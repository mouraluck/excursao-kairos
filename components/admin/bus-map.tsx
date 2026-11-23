"use client";

import { DoorOpen } from "lucide-react";
import { SEAT_COUNT } from "@/lib/admin/schema";
import { cn } from "@/lib/utils";

// Ônibus executivo de 46 lugares: 11 fileiras de 4 e a última com 2 ao lado
// do banheiro. Numeração: 1-2 à esquerda (janela, corredor), 4-3 à direita.
const FULL_ROWS = 11;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? "";
}

function Seat({
  seat,
  names,
  selected,
  onSelect,
}: {
  seat: number;
  names: Record<number, string>;
  selected: boolean;
  onSelect: (seat: number) => void;
}) {
  const passenger = names[seat];
  return (
    <button
      type="button"
      onClick={() => onSelect(seat)}
      aria-pressed={selected}
      aria-label={
        passenger
          ? `Poltrona ${seat}, ocupada por ${passenger}`
          : `Poltrona ${seat}, disponível`
      }
      title={passenger ? `${seat} · ${passenger}` : `${seat} · disponível`}
      className={cn(
        "relative flex h-14 w-12 flex-col items-center justify-center rounded-t-2xl rounded-b-lg border-2 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/40 sm:h-16 sm:w-14",
        passenger
          ? "border-zinc-500 bg-zinc-400 text-white hover:bg-zinc-500"
          : "border-kairos-yellow-deep bg-kairos-yellow text-kairos-black hover:-translate-y-0.5 hover:shadow-md",
        selected &&
          "z-10 scale-110 ring-4 ring-foreground ring-offset-2 ring-offset-background",
      )}
    >
      <span className="font-display text-lg font-semibold leading-none sm:text-xl">
        {seat}
      </span>
      {passenger && (
        <span className="mt-0.5 w-full truncate px-0.5 text-[9px] font-medium leading-tight sm:text-[10px]">
          {firstName(passenger)}
        </span>
      )}
    </button>
  );
}

export function BusMap({
  names,
  selectedSeat,
  onSelect,
}: {
  /** Poltrona -> nome de quem está nela. */
  names: Record<number, string>;
  selectedSeat: number | null;
  onSelect: (seat: number) => void;
}) {
  const rows = Array.from({ length: FULL_ROWS }, (_, i) => i + 1);
  const seatProps = (seat: number) => ({
    seat,
    names,
    selected: selectedSeat === seat,
    onSelect,
  });

  return (
    <div className="mx-auto w-fit">
      <div className="rounded-t-[3.5rem] rounded-b-3xl border-2 border-border-strong bg-surface p-4 shadow-(--shadow) sm:p-5">
        {/* Frente do ônibus */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-border-strong px-1 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full border-[3px] border-muted"
            >
              <span className="size-2.5 rounded-full bg-muted" />
            </span>
            Motorista
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Porta
            <DoorOpen className="size-5" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <Seat {...seatProps(4 * r - 3)} />
              <Seat {...seatProps(4 * r - 2)} />
              <span
                aria-hidden
                className="w-6 text-center text-[10px] font-medium text-muted/60 sm:w-8"
              >
                {r}
              </span>
              <Seat {...seatProps(4 * r)} />
              <Seat {...seatProps(4 * r - 1)} />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Seat {...seatProps(SEAT_COUNT - 1)} />
            <Seat {...seatProps(SEAT_COUNT)} />
            <span aria-hidden className="w-6 sm:w-8" />
            <div className="flex h-14 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border-strong text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:h-16">
              Banheiro
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-5 text-sm text-muted">
        <span className="flex items-center gap-2">
          <span className="size-4 rounded border-2 border-kairos-yellow-deep bg-kairos-yellow" />
          Disponível
        </span>
        <span className="flex items-center gap-2">
          <span className="size-4 rounded border-2 border-zinc-500 bg-zinc-400" />
          Ocupada
        </span>
      </div>
    </div>
  );
}
