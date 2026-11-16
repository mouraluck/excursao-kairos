"use client";

import Image from "next/image";
import { type FormEvent, useRef, useState } from "react";
import {
  ArrowLeft,
  BusFront,
  Download,
  LockKeyhole,
  LogOut,
  Plus,
  Printer,
  Trash2,
  Upload,
} from "lucide-react";
import { BusMap } from "@/components/admin/bus-map";
import { PassengerForm } from "@/components/admin/passenger-form";
import { Button } from "@/components/ui/button";
import { deriveDataKey, deriveVerifier } from "@/lib/admin/crypto";
import {
  type AdminTrip,
  type Passenger,
  SEAT_COUNT,
  freeSeats,
  loadTrips,
  occupiedCount,
  parseBackup,
  saveTrips,
} from "@/lib/admin/store";
import { logoSrc, site } from "@/lib/site";

const VERIFIER = process.env.NEXT_PUBLIC_ADMIN_VERIFIER ?? "";

const inputClass =
  "h-12 w-full rounded-xl border-2 border-border-strong bg-background px-4 text-lg text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground";

/* ------------------------------- Login ------------------------------- */

function Login({
  onLogin,
}: {
  onLogin: (key: CryptoKey, trips: AdminTrip[]) => void;
}) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const verifier = await deriveVerifier(login, password);
      if (verifier !== VERIFIER) {
        setError("Login ou senha incorretos.");
        return;
      }
      const key = await deriveDataKey(login, password);
      const result = await loadTrips(key);
      if (!result.ok) {
        setError(
          "Há dados neste navegador salvos com outra senha. Entre com a senha antiga para exportar o backup antes de trocar.",
        );
        return;
      }
      onLogin(key, result.trips);
    } catch {
      setError("Não foi possível entrar neste navegador.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-surface p-8 shadow-(--shadow)">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src={logoSrc}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="size-14 rounded-full"
          />
          <div>
            <h1 className="font-display text-2xl font-semibold leading-tight">
              Painel da {site.name}
            </h1>
            <p className="text-sm text-muted">Viagens e passageiros</p>
          </div>
        </div>

        {!VERIFIER ? (
          <p className="rounded-2xl border border-border bg-surface-inset p-4 text-base text-muted">
            O painel ainda não foi configurado. Defina os secrets{" "}
            <code className="font-semibold text-foreground">ADMIN_LOGIN</code> e{" "}
            <code className="font-semibold text-foreground">ADMIN_PASSWORD</code>{" "}
            no repositório e publique de novo.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Login</span>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                required
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={busy} className="w-full">
              <LockKeyhole />
              {busy ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

/* ---------------------------- Lista impressa ---------------------------- */

function PrintSheet({ trip }: { trip: AdminTrip }) {
  const rows = Object.entries(trip.passengers)
    .map(([seat, p]) => ({ seat: Number(seat), ...p }))
    .sort((a, b) => a.seat - b.seat);

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
              <td className="py-1.5 pr-2">{r.document}</td>
              <td className="py-1.5 pr-2">{r.phone}</td>
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

/* ------------------------------ Uma viagem ------------------------------ */

function TripView({
  trip,
  onChange,
  onBack,
}: {
  trip: AdminTrip;
  onChange: (trip: AdminTrip) => void;
  onBack: () => void;
}) {
  const [seat, setSeat] = useState<number | null>(null);
  const occupied = occupiedCount(trip);
  const free = freeSeats(trip);
  const list = Object.entries(trip.passengers)
    .map(([s, p]) => ({ seat: Number(s), ...p }))
    .sort((a, b) => a.seat - b.seat);

  function save(data: Passenger, opts: { seat: number; next: boolean }) {
    if (seat === null) return;
    const passengers = { ...trip.passengers };
    delete passengers[seat];
    passengers[opts.seat] = data;
    onChange({ ...trip, passengers });
    if (opts.next) {
      const nextFree = free.find((s) => s !== seat && s !== opts.seat && s > seat);
      setSeat(nextFree ?? free.find((s) => s !== seat && s !== opts.seat) ?? null);
    } else {
      setSeat(null);
    }
  }

  function remove() {
    if (seat === null) return;
    const p = trip.passengers[seat];
    if (!p || !window.confirm(`Liberar a poltrona ${seat} de ${p.name}?`)) return;
    const passengers = { ...trip.passengers };
    delete passengers[seat];
    onChange({ ...trip, passengers });
    setSeat(null);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 print:hidden">
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
          <Button onClick={() => window.print()} size="lg" variant="outline">
            <Printer />
            Imprimir lista
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-xl">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">Ocupadas</p>
            <p className="font-display text-3xl font-semibold">{occupied}</p>
          </div>
          <div className="rounded-2xl border border-kairos-yellow-deep bg-kairos-yellow p-4 text-kairos-black">
            <p className="text-sm">Disponíveis</p>
            <p className="font-display text-3xl font-semibold">{free.length}</p>
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
            <BusMap trip={trip} selectedSeat={seat} onSelect={setSeat} />
          </div>

          <div className="min-w-0 lg:sticky lg:top-6">
            {seat !== null ? (
              <>
                {/* No celular o formulário sobe como uma folha por cima do mapa. */}
                <div
                  className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                  onClick={() => setSeat(null)}
                  aria-hidden
                />
                <div className="fixed inset-x-0 bottom-0 z-50 max-h-[92svh] overflow-y-auto rounded-t-[2rem] border border-border bg-background p-6 shadow-2xl lg:static lg:max-h-none lg:rounded-[2rem] lg:bg-surface lg:p-7 lg:shadow-(--shadow)">
                  <PassengerForm
                    key={seat}
                    seat={seat}
                    passenger={trip.passengers[seat]}
                    freeSeats={free}
                    onSave={save}
                    onRemove={remove}
                    onClose={() => setSeat(null)}
                  />
                </div>
              </>
            ) : null}

            <div className={seat !== null ? "lg:hidden" : undefined}>
              <h2 className="mb-3 font-display text-2xl font-semibold">
                Passageiros ({occupied})
              </h2>
              {list.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border-strong p-6 text-base text-muted">
                  Nenhum passageiro ainda. Toque em uma poltrona amarela para começar.
                </p>
              ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                  {list.map((p) => (
                    <li key={p.seat}>
                      <button
                        type="button"
                        onClick={() => setSeat(p.seat)}
                        className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-surface-hover"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-t-xl rounded-b-md border-2 border-zinc-500 bg-zinc-400 font-display text-lg font-semibold text-white">
                          {p.seat}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-lg font-medium">{p.name}</span>
                          <span className="block truncate text-sm text-muted">
                            {[p.boarding, p.phone, p.document].filter(Boolean).join(" · ") ||
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
      <PrintSheet trip={trip} />
    </>
  );
}

/* --------------------------- Lista de viagens --------------------------- */

function TripList({
  trips,
  onOpen,
  onAdd,
  onDelete,
  onImport,
  onLogout,
}: {
  trips: AdminTrip[];
  onOpen: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onImport: (trips: AdminTrip[]) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(trips, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kairos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importBackup(file: File) {
    const parsed = parseBackup(await file.text());
    if (!parsed) {
      setMessage("Esse arquivo não é um backup válido do painel.");
      return;
    }
    if (
      trips.length > 0 &&
      !window.confirm(
        `Substituir as ${trips.length} viagens deste navegador pelas ${parsed.length} do backup?`,
      )
    ) {
      return;
    }
    onImport(parsed);
    setMessage(`Backup importado: ${parsed.length} viagens.`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt=""
            width={52}
            height={52}
            unoptimized
            className="size-13 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Painel
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Viagens
            </h1>
          </div>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <LogOut />
          Sair
        </Button>
      </div>

      <form
        onSubmit={add}
        className="mb-8 flex flex-col gap-3 rounded-[2rem] border border-border bg-surface p-5 shadow-(--shadow) sm:flex-row sm:items-end sm:p-6"
      >
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-semibold">Nome da nova viagem</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Ilhabela 29/11"
            className={inputClass}
          />
        </label>
        <Button type="submit" size="lg" className="h-12" disabled={!name.trim()}>
          <Plus />
          Adicionar viagem
        </Button>
      </form>

      {trips.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-lg text-muted">
          Nenhuma viagem cadastrada. Adicione a primeira acima.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => {
            const occupied = occupiedCount(trip);
            return (
              <li
                key={trip.id}
                className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-surface p-5 shadow-(--shadow)"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold leading-tight">
                    {trip.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir a viagem ${trip.name}`}
                    className="shrink-0 text-muted hover:text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Excluir a viagem "${trip.name}" e seus ${occupied} passageiros? Isso não pode ser desfeito.`,
                        )
                      ) {
                        onDelete(trip.id);
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm text-muted">
                    <span>
                      <strong className="text-foreground">{occupied}</strong> de {SEAT_COUNT}{" "}
                      poltronas
                    </span>
                    <span>{SEAT_COUNT - occupied} livres</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-kairos-yellow">
                    <div
                      className="h-full rounded-full bg-zinc-400"
                      style={{ width: `${(occupied / SEAT_COUNT) * 100}%` }}
                    />
                  </div>
                </div>
                <Button onClick={() => onOpen(trip.id)} size="lg" className="w-full">
                  <BusFront />
                  Abrir ônibus
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 rounded-2xl border border-border bg-surface-inset p-5">
        <h2 className="mb-1 text-base font-semibold">Backup</h2>
        <p className="mb-4 text-sm text-muted">
          Os dados ficam guardados só neste navegador, protegidos pela senha.
          Exporte um backup de vez em quando e para levar a outro aparelho.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportBackup} disabled={trips.length === 0}>
            <Download />
            Exportar backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload />
            Importar backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importBackup(file);
              e.target.value = "";
            }}
          />
        </div>
        {message && <p className="mt-3 text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
}

/* -------------------------------- Painel -------------------------------- */

export function AdminApp() {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  function commit(next: AdminTrip[]) {
    setTrips(next);
    if (key) void saveTrips(key, next);
  }

  if (!key) {
    return (
      <Login
        onLogin={(k, loaded) => {
          setKey(k);
          setTrips(loaded);
        }}
      />
    );
  }

  const open = trips.find((t) => t.id === openId);

  if (open) {
    return (
      <TripView
        trip={open}
        onBack={() => setOpenId(null)}
        onChange={(trip) => commit(trips.map((t) => (t.id === trip.id ? trip : t)))}
      />
    );
  }

  return (
    <TripList
      trips={trips}
      onOpen={setOpenId}
      onAdd={(name) =>
        commit([
          ...trips,
          {
            id: crypto.randomUUID(),
            name,
            createdAt: new Date().toISOString(),
            passengers: {},
          },
        ])
      }
      onDelete={(id) => commit(trips.filter((t) => t.id !== id))}
      onImport={commit}
      onLogout={() => {
        setKey(null);
        setTrips([]);
        setOpenId(null);
      }}
    />
  );
}
