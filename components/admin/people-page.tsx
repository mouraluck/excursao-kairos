"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import { Check, FileDown, FileUp, Plus, Search, Trash2, X } from "lucide-react";
import { PersonFields, emptyDraft } from "@/components/admin/person-fields";
import { SidePanel } from "@/components/admin/side-panel";
import { useAutosave } from "@/components/admin/use-autosave";
import { Badge, Button, Input, Notice } from "@/components/admin/ui";
import {
  type AdminData,
  type Person,
  type PersonDraft,
  digitsOf,
  formatDocument,
  formatPhone,
  importPeople,
  normalizeName,
  removePerson,
  upsertPerson,
} from "@/lib/admin/schema";
import type { OnChange } from "@/components/admin/admin-app";
import { env } from "@/lib/admin/store";
import { exportPeople, parseSheet } from "@/lib/admin/xlsx";

function draftOf(p: PersonDraft): PersonDraft {
  return { name: p.name, docType: p.docType, document: p.document, phone: p.phone };
}

function PersonForm({
  person,
  onSave,
  onAutosave,
  onDelete,
  onClose,
}: {
  person?: Person;
  onSave: (draft: PersonDraft) => void;
  /** Só para quem já está cadastrado: grava sem fechar o formulário. */
  onAutosave?: (draft: PersonDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PersonDraft>(person ?? emptyDraft);
  const [saved, setSaved] = useState<PersonDraft>(person ?? emptyDraft);
  const [error, setError] = useState("");

  const version = JSON.stringify(draftOf(draft));
  const auto = useAutosave({
    enabled: Boolean(onAutosave),
    dirty: Boolean(draft.name.trim()) && version !== JSON.stringify(draftOf(saved)),
    version,
    save: () => {
      onAutosave?.(draft);
      setSaved(draft);
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("Preencha o nome do passageiro.");
      return;
    }
    auto.finish();
    onSave(draft);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold leading-tight">
            {person ? "Editar passageiro" : "Novo passageiro"}
          </h3>
          <p className="text-sm text-muted">
            {person
              ? "As alterações são salvas automaticamente."
              : "Fica salvo para usar em qualquer viagem."}
          </p>
          {auto.saved && (
            <Badge tone="success" dot className="mt-2 h-7 text-sm">
              Alterações salvas
            </Badge>
          )}
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
          <X />
        </Button>
      </div>
      <PersonFields
        value={draft}
        onChange={(next) => {
          setDraft(next);
          setError("");
        }}
        nameError={error}
      />
      <div className="flex flex-col gap-2 pt-1">
        <Button type="submit" size="lg" className="w-full">
          <Check />
          Salvar passageiro
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => {
              auto.finish();
              onDelete();
            }}
          >
            <Trash2 />
            Excluir passageiro
          </Button>
        )}
      </div>
    </form>
  );
}

export function PeoplePage({
  data,
  onChange,
}: {
  data: AdminData;
  onChange: OnChange;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const tripCount = useMemo(() => {
    const count = new Map<string, number>();
    for (const trip of data.trips) {
      for (const entry of Object.values(trip.seats)) {
        count.set(entry.personId, (count.get(entry.personId) ?? 0) + 1);
      }
    }
    return count;
  }, [data.trips]);

  const list = useMemo(() => {
    const q = normalizeName(query);
    const digits = digitsOf(query);
    return [...data.people]
      .filter(
        (p) =>
          !q ||
          normalizeName(p.name).includes(q) ||
          (digits.length >= 3 && (p.document.includes(digits) || p.phone.includes(digits))),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [data.people, query]);

  const current = data.people.find((p) => p.id === editing);

  function save(draft: PersonDraft) {
    const { people } = upsertPerson(data.people, draft, env, current?.id);
    onChange({ ...data, people });
    setEditing(null);
  }

  // Grava a edição sem fechar. Ignora se a pessoa já foi excluída.
  function autosave(personId: string, draft: PersonDraft) {
    if (!data.people.some((p) => p.id === personId)) return;
    onChange({ ...data, people: upsertPerson(data.people, draft, env, personId).people });
  }

  function remove(person: Person) {
    const trips = tripCount.get(person.id) ?? 0;
    onChange(removePerson(data, person.id), {
      title: `${person.name} foi excluído`,
      description:
        trips > 0
          ? `Saiu do cadastro e de ${trips === 1 ? "1 viagem" : `${trips} viagens`}.`
          : "Saiu do cadastro de passageiros.",
    });
    setEditing(null);
  }

  async function importFile(file: File) {
    setMessage("");
    const parsed = await parseSheet(file);
    if (!parsed.ok) {
      setMessage(parsed.error);
      return;
    }
    const { data: next, stats } = importPeople(data, parsed.rows, env);
    if (
      !window.confirm(
        `Importar a planilha?\n\n${stats.created} passageiros novos\n${stats.updated} já cadastrados serão atualizados`,
      )
    ) {
      return;
    }
    onChange(next);
    setMessage(`Planilha importada: ${stats.created} novos, ${stats.updated} atualizados.`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Cadastro
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Passageiros ({data.people.length})
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void exportPeople(data)}
            disabled={data.people.length === 0}
          >
            <FileDown />
            Exportar XLSX
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp />
            Importar XLSX
          </Button>
          <Button onClick={() => setEditing("new")}>
            <Plus />
            Novo passageiro
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

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-w-0">
          <div className="mb-4">
            <Input
              leftIcon={<Search className="size-5" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, documento ou telefone"
              aria-label="Buscar passageiro"
            />
          </div>

          {data.people.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-lg text-muted">
              Nenhum passageiro cadastrado. Adicione aqui ou direto na poltrona de
              uma viagem.
            </p>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-strong p-6 text-base text-muted">
              Ninguém encontrado para essa busca.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {list.map((p) => {
                const trips = tripCount.get(p.id) ?? 0;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setEditing(p.id)}
                      aria-current={editing === p.id}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-surface-hover aria-[current=true]:bg-surface-hover"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-medium">{p.name}</span>
                        <span className="block truncate text-sm text-muted">
                          {[
                            p.document && `${p.docType} ${formatDocument(p.docType, p.document)}`,
                            formatPhone(p.phone),
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Sem documento nem telefone"}
                        </span>
                      </span>
                      <Badge
                        tone={trips > 0 ? "success" : "neutral"}
                        variant={trips > 0 ? "soft" : "outline"}
                        dot={trips > 0}
                        className="h-7 shrink-0 text-sm"
                      >
                        {trips === 0 ? "Sem viagem" : trips === 1 ? "1 viagem" : `${trips} viagens`}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-6">
          {editing !== null ? (
            <SidePanel
              title={current ? "Editar passageiro" : "Novo passageiro"}
              onClose={() => setEditing(null)}
            >
              <PersonForm
                key={editing}
                person={current}
                onSave={save}
                onAutosave={current ? (draft) => autosave(current.id, draft) : undefined}
                onDelete={current ? () => remove(current) : undefined}
                onClose={() => setEditing(null)}
              />
            </SidePanel>
          ) : (
            <p className="hidden rounded-2xl border border-dashed border-border-strong p-6 text-base text-muted lg:block">
              Toque em um passageiro para editar. Quem está cadastrado aqui aparece
              como sugestão ao preencher uma poltrona, sem digitar tudo de novo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
