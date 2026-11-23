"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, FileDown, FileUp, Printer } from "lucide-react";
import { BusMap } from "@/components/admin/bus-map";
import { PassengerForm, type SeatSave } from "@/components/admin/passenger-form";
import { SidePanel } from "@/components/admin/side-panel";
import { AnimatedNumber, Button, Notice } from "@/components/admin/ui";
import {
  type AdminData,
  type AdminTrip,
  SEAT_COUNT,
  formatDocument,
  formatPhone,
  freeSeats,
  importTrip,
  occupiedCount,
  upsertPerson,
} from "@/lib/admin/schema";
import type { OnChange } from "@/components/admin/admin-app";
import { env } from "@/lib/admin/store";
import { exportTrip, parseSheet } from "@/lib/admin/xlsx";
import { site } from "@/lib/site";

type Row = {
  seat: number;
  name: string;
  doc: string;
  phone: string;
  boarding: string;
};

function PrintSheet({ trip, rows }: { trip: AdminTrip; rows: Row[] }) {
  return (
    <div className="hidden bg-white p-0 text-black print:block">
      <header className="mb-4 flex items-end justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest">
            {site.name} · Lista de passageiros
          </p>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
        </div>
        <p className="text-right text-sm">
          {rows.length} de {SEAT_COUNT} poltronas ocupadas
          <br />
          Responsável: {site.owner}
        </p>
      </header>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="w-12 py-1.5 pr-2">Polt.</th>
            <th className="py-1.5 pr-2">Nome</th>
            <th className="py-1.5 pr-2">Documento</th>
            <th className="py-1.5 pr-2">Telefone</th>
            <th className="py-1.5 pr-2">Embarque</th>
            <th className="w-16 py-1.5 text-center">Presença</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.seat} className="break-inside-avoid border-b border-black/30">
              <td className="py-1.5 pr-2 font-bold">{r.seat}</td>
              <td className="py-1.5 pr-2">{r.name}</td>
              <td className="py-1.5 pr-2 whitespace-nowrap">{r.doc}</td>
              <td className="py-1.5 pr-2 whitespace-nowrap">{r.phone}</td>
              <td className="py-1.5 pr-2">{r.boarding}</td>
              <td className="py-1.5 text-center">
                <span className="inline-block size-4 border border-black" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="mt-4">Nenhum passageiro cadastrado.</p>}
    </div>
  );
}

export function TripView({
  data,
  trip,
  onChange,
  onBack,
}: {
  data: AdminData;
  trip: AdminTrip;
  onChange: OnChange;
  onBack: () => void;
}) {
  const [seat, setSeat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const byId = useMemo(() => new Map(data.people.map((p) => [p.id, p])), [data.people]);
  const occupied = occupiedCount(trip);
  const free = freeSeats(trip);
  const seatedIds = useMemo(
    () => new Set(Object.values(trip.seats).map((s) => s.personId)),
    [trip.seats],
  );

  const rows: Row[] = Object.entries(trip.seats)
    .map(([s, entry]) => {
      const p = byId.get(entry.personId);
      return {
        seat: Number(s),
        name: p?.name ?? "",
        doc: p?.document ? `${p.docType} ${formatDocument(p.docType, p.document)}` : "",
        phone: formatPhone(p?.phone ?? ""),
        boarding: entry.boarding,
      };
    })
    .sort((a, b) => a.seat - b.seat);
  const names = Object.fromEntries(rows.map((r) => [r.seat, r.name]));

  function withTrip(next: AdminTrip, people = data.people): AdminData {
    return {
      ...data,
      people,
      trips: data.trips.map((t) => (t.id === next.id ? next : t)),
    };
  }

  function save(s: SeatSave) {
    if (seat === null) return;
    const result = upsertPerson(data.people, s.draft, env, s.personId);
    const seats = { ...trip.seats };
    delete seats[seat];
    // Se o documento bateu com alguém que já estava no ônibus, a pessoa muda de lugar.
    for (const [k, entry] of Object.entries(seats)) {
      if (entry.personId === result.personId) delete seats[Number(k)];
    }
    seats[s.seat] = { personId: result.personId, boarding: s.boarding.trim() };
    onChange(withTrip({ ...trip, seats }, result.people));
    if (s.next) {
      const rest = free.filter((f) => f !== seat && f !== s.seat);
      setSeat(rest.find((f) => f > seat) ?? rest[0] ?? null);
    } else {
      setSeat(null);
    }
  }

  function remove() {
    if (seat === null) return;
    const name = names[seat];
    if (!name) return;
    const seats = { ...trip.seats };
    delete seats[seat];
    onChange(withTrip({ ...trip, seats }), {
      title: `Poltrona ${seat} liberada`,
      description: `${name} continua no cadastro de passageiros.`,
    });
    setSeat(null);
  }

  async function importFile(file: File) {
    setMessage("");
    const parsed = await parseSheet(file);
    if (!parsed.ok) {
      setMessage(parsed.error);
      return;
    }
    const { data: next, stats } = importTrip(data, trip.id, parsed.rows, env);
    const lines = [
      `${stats.seated} passageiros serão colocados no ônibus.`,
      stats.replaced > 0
        ? `${stats.replaced} poltronas já ocupadas serão substituídas.`
        : "",
      `Cadastro: ${stats.created} novos, ${stats.updated} atualizados.`,
    ].filter(Boolean);
    if (!window.confirm(`Importar a planilha?\n\n${lines.join("\n")}`)) return;
    onChange(next);
    setSeat(null);
    setMessage(`Planilha importada: ${stats.seated} poltronas preenchidas.`);
  }

  const current = seat !== null ? trip.seats[seat] : undefined;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 print:hidden">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onBack} aria-label="Voltar às viagens">
              <ArrowLeft />
            </Button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Viagem
              </p>
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {trip.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void exportTrip(data, trip)}>
              <FileDown />
              Exportar XLSX
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <FileUp />
              Importar XLSX
            </Button>
            <Button onClick={() => window.print()}>
              <Printer />
              Imprimir lista
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {message && (
          <Notice className="mb-6">{message}</Notice>
        )}

        <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-xl">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">Ocupadas</p>
            <AnimatedNumber value={occupied} className="font-display text-3xl font-semibold text-inherit" />
          </div>
          <div className="rounded-2xl border border-kairos-yellow-deep bg-kairos-yellow p-4 text-kairos-black">
            <p className="text-sm">Disponíveis</p>
            <AnimatedNumber value={free.length} className="font-display text-3xl font-semibold text-inherit" />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">Total</p>
            <p className="font-display text-3xl font-semibold">{SEAT_COUNT}</p>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="mb-3 text-center text-base text-muted lg:text-left">
              Toque em uma poltrona para cadastrar ou editar.
            </p>
            <BusMap names={names} selectedSeat={seat} onSelect={setSeat} />
          </div>

          <div className="min-w-0 lg:sticky lg:top-6">
            {seat !== null && (
              <SidePanel title={`Poltrona ${seat}`} onClose={() => setSeat(null)}>
                <PassengerForm
                  key={seat}
                  seat={seat}
                  entry={current}
                  person={current ? byId.get(current.personId) : undefined}
                  people={data.people}
                  seatedIds={seatedIds}
                  freeSeats={free}
                  onSave={save}
                  onRemove={remove}
                  onClose={() => setSeat(null)}
                />
              </SidePanel>
            )}

            <div className={seat !== null ? "lg:hidden" : undefined}>
              <h2 className="mb-3 font-display text-2xl font-semibold">
                Passageiros ({occupied})
              </h2>
              {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border-strong p-6 text-base text-muted">
                  Nenhum passageiro ainda. Toque em uma poltrona amarela para começar.
                </p>
              ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                  {rows.map((r) => (
                    <li key={r.seat}>
                      <button
                        type="button"
                        onClick={() => setSeat(r.seat)}
                        className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-surface-hover"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-t-xl rounded-b-md border-2 border-zinc-500 bg-zinc-400 font-display text-lg font-semibold text-white">
                          {r.seat}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-lg font-medium">{r.name}</span>
                          <span className="block truncate text-sm text-muted">
                            {[r.boarding, r.doc, r.phone].filter(Boolean).join(" · ") ||
                              "Sem dados adicionais"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <PrintSheet trip={trip} rows={rows} />
    </>
  );
}
