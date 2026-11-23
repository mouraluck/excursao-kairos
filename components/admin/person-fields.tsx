"use client";

import type { ReactNode } from "react";
import { Input, Select } from "@/components/admin/ui";
import {
  DOC_TYPES,
  type DocType,
  type PersonDraft,
  cleanDocument,
  digitsOf,
  formatDocument,
  formatPhone,
  isValidCpf,
} from "@/lib/admin/schema";

const DOC_HINT: Record<DocType, string> = {
  CPF: "000.000.000-00",
  RG: "00.000.000-0",
  CIN: "000.000.000-00",
};

export const emptyDraft: PersonDraft = {
  name: "",
  docType: "CPF",
  document: "",
  phone: "",
};

/** Nome, documento (tipo + número com máscara) e telefone. */
export function PersonFields({
  value,
  onChange,
  nameError,
  belowName,
  autoFocus = true,
}: {
  value: PersonDraft;
  onChange: (next: PersonDraft) => void;
  nameError?: string;
  /** Espaço logo abaixo do nome (sugestões de passageiros salvos). */
  belowName?: ReactNode;
  autoFocus?: boolean;
}) {
  const usesCpf = value.docType !== "RG";
  const cpfWrong =
    usesCpf && value.document.length === 11 && !isValidCpf(value.document);

  return (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Nome completo</span>
        <Input
          autoFocus={autoFocus}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          autoComplete="off"
          placeholder="Ex.: Maria da Silva"
          aria-invalid={Boolean(nameError)}
          error={Boolean(nameError)}
        />
        {nameError && (
          <span className="text-sm font-medium text-red-600">{nameError}</span>
        )}
      </label>
      {belowName}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Documento</span>
        <div className="flex gap-2">
          <div className="w-28 shrink-0">
          <Select
            aria-label="Tipo de documento"
            value={value.docType}
            onChange={(e) => {
              const docType = e.target.value as DocType;
              onChange({
                ...value,
                docType,
                document: cleanDocument(docType, value.document),
              });
            }}
            className="px-3 font-semibold"
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          </div>
          <div className="min-w-0 flex-1">
          <Input
            aria-label={`Número do ${value.docType}`}
            value={formatDocument(value.docType, value.document)}
            onChange={(e) =>
              onChange({
                ...value,
                document: cleanDocument(value.docType, e.target.value),
              })
            }
            autoComplete="off"
            inputMode={usesCpf ? "numeric" : "text"}
            placeholder={DOC_HINT[value.docType]}
            className="tabular-nums"
          />
          </div>
        </div>
        {cpfWrong ? (
          <span className="text-sm font-medium text-red-600">
            Esse número não é um CPF válido. Confira os dígitos.
          </span>
        ) : (
          value.docType === "CIN" && (
            <span className="text-sm text-muted">
              A CIN usa o mesmo número do CPF.
            </span>
          )
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Telefone</span>
        <Input
          value={formatPhone(value.phone)}
          onChange={(e) =>
            onChange({ ...value, phone: digitsOf(e.target.value).slice(0, 11) })
          }
          autoComplete="off"
          inputMode="tel"
          placeholder="(11) 90000-0000"
          className="tabular-nums"
        />
      </label>
    </>
  );
}
