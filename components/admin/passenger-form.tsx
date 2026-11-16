"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Passenger } from "@/lib/admin/store";

const BOARDING_POINTS = ["Cotia", "Barra Funda", "Tiradentes"];

const fieldClass =
  "h-12 w-full rounded-xl border-2 border-border-strong bg-background px-4 text-lg text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground";

export function PassengerForm({
  seat,
  passenger,
  freeSeats,
  onSave,
  onRemove,
  onClose,
}: {
  seat: number;
  passenger?: Passenger;
  freeSeats: number[];
  onSave: (data: Passenger, opts: { seat: number; next: boolean }) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(passenger?.name ?? "");
  const [document, setDocument] = useState(passenger?.document ?? "");
  const [phone, setPhone] = useState(passenger?.phone ?? "");
  const [boarding, setBoarding] = useState(passenger?.boarding ?? "");
  const [targetSeat, setTargetSeat] = useState(seat);
  const [error, setError] = useState("");

  function submit(next: boolean) {
    if (!name.trim()) {
      setError("Preencha o nome do passageiro.");
      return;
    }
    onSave(
      {
        name: name.trim(),
        document: document.trim(),
        phone: phone.trim(),
        boarding: boarding.trim(),
      },
      { seat: targetSeat, next },
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit(false);
  }

  const hasNext = freeSeats.some((s) => s !== seat);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={
              passenger
                ? "grid size-14 place-items-center rounded-t-2xl rounded-b-lg border-2 border-zinc-500 bg-zinc-400 font-display text-2xl font-semibold text-white"
                : "grid size-14 place-items-center rounded-t-2xl rounded-b-lg border-2 border-kairos-yellow-deep bg-kairos-yellow font-display text-2xl font-semibold text-kairos-black"
            }
          >
            {seat}
          </span>
          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight">
              Poltrona {seat}
            </h3>
            <p className="text-sm text-muted">
              {passenger ? "Ocupada. Edite ou libere." : "Disponível. Cadastre o passageiro."}
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
          <X />
        </Button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Nome completo</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          autoComplete="off"
          placeholder="Ex.: Maria da Silva"
          className={fieldClass}
          aria-invalid={Boolean(error)}
        />
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Documento (RG ou CPF)</span>
          <input
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            autoComplete="off"
            inputMode="numeric"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Telefone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="off"
            inputMode="tel"
            placeholder="(11) 90000-0000"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Local de embarque</span>
        <input
          value={boarding}
          onChange={(e) => setBoarding(e.target.value)}
          list="kairos-boarding"
          autoComplete="off"
          placeholder="Escolha ou digite"
          className={fieldClass}
        />
        <datalist id="kairos-boarding">
          {BOARDING_POINTS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <span className="flex flex-wrap gap-2 pt-1">
          {BOARDING_POINTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setBoarding(p)}
              className={
                boarding === p
                  ? "rounded-full border-2 border-foreground bg-foreground px-3 py-1 text-sm font-medium text-background"
                  : "rounded-full border-2 border-border-strong px-3 py-1 text-sm font-medium hover:border-foreground"
              }
            >
              {p}
            </button>
          ))}
        </span>
      </label>

      {passenger && freeSeats.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Trocar de poltrona</span>
          <select
            value={targetSeat}
            onChange={(e) => setTargetSeat(Number(e.target.value))}
            className={fieldClass}
          >
            <option value={seat}>Manter na {seat}</option>
            {freeSeats.map((s) => (
              <option key={s} value={s}>
                Mudar para a {s}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" size="lg" className="w-full">
          <Check />
          Salvar passageiro
        </Button>
        {!passenger && hasNext && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => submit(true)}
          >
            Salvar e ir para a próxima livre
            <ArrowRight />
          </Button>
        )}
        {passenger && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-600/10 hover:text-red-700"
            onClick={onRemove}
          >
            <Trash2 />
            Liberar poltrona
          </Button>
        )}
      </div>
    </form>
  );
}
