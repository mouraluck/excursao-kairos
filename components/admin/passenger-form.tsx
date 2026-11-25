"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Trash2, UserCheck, X } from "lucide-react";
import { PersonFields, emptyDraft } from "@/components/admin/person-fields";
import { Badge, Button, Input, Select } from "@/components/admin/ui";
import { useAutosave } from "@/components/admin/use-autosave";
import {
  type Person,
  type PersonDraft,
  type SeatEntry,
  digitsOf,
  formatDocument,
  normalizeName,
} from "@/lib/admin/schema";

const BOARDING_POINTS = ["Cotia", "Barra Funda", "Tiradentes"];

export type SeatSave = {
  draft: PersonDraft;
  personId?: string;
  boarding: string;
  seat: number;
  next: boolean;
};

export function PassengerForm({
  seat,
  entry,
  person,
  people,
  seatedIds,
  freeSeats,
  onSave,
  onAutosave,
  onRemove,
  onClose,
}: {
  seat: number;
  entry?: SeatEntry;
  person?: Person;
  people: Person[];
  /** Quem já está neste ônibus (não aparece nas sugestões). */
  seatedIds: Set<string>;
  freeSeats: number[];
  onSave: (save: SeatSave) => void;
  /** Só para poltrona ocupada: grava a edição sem fechar o formulário. */
  onAutosave?: (save: { draft: PersonDraft; personId: string; boarding: string }) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PersonDraft>(person ?? emptyDraft);
  const [linkedId, setLinkedId] = useState<string | undefined>(person?.id);
  const [boarding, setBoarding] = useState(entry?.boarding ?? "");
  const [targetSeat, setTargetSeat] = useState(seat);
  const [error, setError] = useState("");
  const boardingRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () => people.filter((p) => !seatedIds.has(p.id)),
    [people, seatedIds],
  );

  const suggestions = useMemo(() => {
    if (linkedId) return [];
    const query = normalizeName(draft.name);
    const doc = digitsOf(draft.name);
    if (query.length < 2) return [];
    return available
      .filter(
        (p) =>
          normalizeName(p.name).includes(query) ||
          (doc.length >= 3 && p.document.startsWith(doc)),
      )
      .slice(0, 5);
  }, [available, draft.name, linkedId]);

  const version = JSON.stringify([draft.name, draft.docType, draft.document, draft.phone, boarding]);
  const [savedVersion, setSavedVersion] = useState(version);
  const auto = useAutosave({
    enabled: Boolean(onAutosave && person),
    dirty: Boolean(draft.name.trim()) && version !== savedVersion,
    version,
    save: () => {
      if (!person) return;
      onAutosave?.({ draft, personId: person.id, boarding });
      setSavedVersion(version);
    },
  });

  function submit(next: boolean) {
    if (!draft.name.trim()) {
      setError("Preencha o nome do passageiro.");
      return;
    }
    auto.finish();
    onSave({ draft, personId: linkedId, boarding, seat: targetSeat, next });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit(false);
  }

  const occupied = Boolean(entry);
  const hasNext = freeSeats.some((s) => s !== seat);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={
              occupied
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
              {occupied
                ? "Ocupada. As alterações são salvas automaticamente."
                : "Disponível. Cadastre ou escolha um passageiro."}
            </p>
            {auto.saved && (
              <Badge tone="success" dot className="mt-2 h-7 text-sm">
                Alterações salvas
              </Badge>
            )}
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
          <X />
        </Button>
      </div>

      {linkedId && !occupied && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm">
          <Badge tone="success" variant="soft" className="h-7 text-sm">
            <UserCheck className="size-4" />
            Passageiro já cadastrado
          </Badge>
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            onClick={() => {
              setLinkedId(undefined);
              setDraft(emptyDraft);
            }}
          >
            Trocar
          </button>
        </div>
      )}

      <PersonFields
        value={draft}
        onChange={(next) => {
          setDraft(next);
          setError("");
        }}
        nameError={error}
        belowName={
          !linkedId &&
          (suggestions.length > 0 ? (
            <ul className="-mt-2 overflow-hidden rounded-xl border-2 border-border-strong bg-background">
              {suggestions.map((p) => (
                <li key={p.id} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(p);
                      setLinkedId(p.id);
                      setError("");
                      boardingRef.current?.focus();
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-hover"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-base font-medium">{p.name}</span>
                      <span className="block text-sm text-muted">
                        {p.document
                          ? `${p.docType} ${formatDocument(p.docType, p.document)}`
                          : "Sem documento"}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-accent">Usar</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !occupied &&
            available.length > 0 &&
            draft.name.trim().length < 2 && (
              <p className="-mt-2 text-sm text-muted">
                Digite o nome para buscar entre os passageiros já cadastrados (
                {available.length} {available.length === 1 ? "disponível" : "disponíveis"}).
              </p>
            )
          ))
        }
      />

      <div className="flex flex-col gap-1.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Local de embarque</span>
          <Input
            ref={boardingRef}
            value={boarding}
            onChange={(e) => setBoarding(e.target.value)}
            autoComplete="off"
            placeholder="Escolha abaixo ou digite"
          />
        </label>
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
      </div>

      {occupied && freeSeats.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Trocar de poltrona</span>
          <Select
            value={targetSeat}
            onChange={(e) => setTargetSeat(Number(e.target.value))}
          >
            <option value={seat}>Manter na {seat}</option>
            {freeSeats.map((s) => (
              <option key={s} value={s}>
                Mudar para a {s}
              </option>
            ))}
          </Select>
        </label>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" size="lg" className="w-full">
          <Check />
          Salvar passageiro
        </Button>
        {!occupied && hasNext && (
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
        {occupied && (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => {
              auto.finish();
              onRemove();
            }}
          >
            <Trash2 />
            Liberar poltrona
          </Button>
        )}
      </div>
    </form>
  );
}
