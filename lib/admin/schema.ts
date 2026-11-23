// Formato dos dados do painel e as migrações entre versões.
//
// Este arquivo não importa nada de propósito: é a parte que garante que uma
// atualização do site não perde o que já está salvo no navegador, então roda
// também nos testes (`npm test`) fora do Next.
//
// Regra para mudar o formato: suba CURRENT_SCHEMA, escreva a função
// `vN -> vN+1` em `migrate` e adicione um teste com dados no formato antigo.
// Nunca altere uma migração que já foi publicada.

export const CURRENT_SCHEMA = 2;
export const SEAT_COUNT = 46;

export type DocType = "CPF" | "RG" | "CIN";
export const DOC_TYPES: DocType[] = ["CPF", "RG", "CIN"];

export type Person = {
  id: string;
  name: string;
  docType: DocType;
  /** Sem pontuação: só dígitos (CPF, CIN) ou letras e dígitos (RG). */
  document: string;
  /** Só dígitos. */
  phone: string;
  createdAt: string;
};

export type SeatEntry = { personId: string; boarding: string };

export type AdminTrip = {
  id: string;
  name: string;
  createdAt: string;
  /** Poltrona (1 a 46) -> quem está nela. */
  seats: Record<number, SeatEntry>;
};

export type AdminData = {
  schema: typeof CURRENT_SCHEMA;
  people: Person[];
  trips: AdminTrip[];
};

export type PersonDraft = Pick<Person, "name" | "docType" | "document" | "phone">;

/** Dados gravados por uma versão do site mais nova que esta. */
export class NewerSchemaError extends Error {
  found: number;
  constructor(found: number) {
    super(`Dados no formato ${found}, mais novo que ${CURRENT_SCHEMA}.`);
    this.found = found;
  }
}

export class InvalidDataError extends Error {}

type Env = { newId: () => string; now: () => string };

export function emptyData(): AdminData {
  return { schema: CURRENT_SCHEMA, people: [], trips: [] };
}

/* ----------------------------- Documentos ----------------------------- */

export function digitsOf(value: string) {
  return value.replace(/\D/g, "");
}

export function cleanDocument(type: DocType, value: string) {
  if (type === "RG") {
    return value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14);
  }
  return digitsOf(value).slice(0, 11);
}

export function isValidCpf(value: string) {
  const d = digitsOf(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return (rest === 10 ? 0 : rest) === Number(d[len]);
  };
  return check(9) && check(10);
}

/** Formata conforme o tipo e a quantidade de caracteres já digitados. */
export function formatDocument(type: DocType, value: string) {
  const v = cleanDocument(type, value);
  if (type === "RG") {
    if (v.length === 9) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}-${v.slice(8)}`;
    if (v.length === 8) return `${v.slice(0, 1)}.${v.slice(1, 4)}.${v.slice(4, 7)}-${v.slice(7)}`;
    return v;
  }
  // CPF e CIN usam o número do CPF: 000.000.000-00
  let out = v.slice(0, 3);
  if (v.length > 3) out += `.${v.slice(3, 6)}`;
  if (v.length > 6) out += `.${v.slice(6, 9)}`;
  if (v.length > 9) out += `-${v.slice(9, 11)}`;
  return out;
}

export function guessDocType(value: string): DocType {
  return isValidCpf(value) ? "CPF" : "RG";
}

export function parseDocType(value: unknown): DocType | null {
  const v = String(value ?? "").trim().toUpperCase();
  return (DOC_TYPES as string[]).includes(v) ? (v as DocType) : null;
}

export function formatPhone(value: string) {
  const d = digitsOf(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = `(${d.slice(0, 2)}) `;
  const rest = d.slice(2);
  if (rest.length <= 4) return ddd + rest;
  const cut = rest.length === 9 ? 5 : 4;
  return `${ddd}${rest.slice(0, cut)}-${rest.slice(cut)}`;
}

export function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------ Pessoas ------------------------------ */

/** Mesmo documento é a mesma pessoa; sem documento, vale o nome. */
export function findPerson(
  people: Person[],
  who: { document: string; name: string },
) {
  if (who.document) {
    const byDoc = people.find((p) => p.document === who.document);
    if (byDoc) return byDoc;
  }
  const name = normalizeName(who.name);
  return people.find(
    (p) => normalizeName(p.name) === name && (!p.document || !who.document),
  );
}

function cleanDraft(draft: PersonDraft): PersonDraft {
  return {
    name: draft.name.replace(/\s+/g, " ").trim(),
    docType: draft.docType,
    document: cleanDocument(draft.docType, draft.document),
    phone: digitsOf(draft.phone).slice(0, 11),
  };
}

/** Cria a pessoa ou atualiza a existente. Devolve a lista nova e o id. */
export function upsertPerson(
  people: Person[],
  draft: PersonDraft,
  env: Env,
  personId?: string,
): { people: Person[]; personId: string } {
  const clean = cleanDraft(draft);
  const existing = personId
    ? people.find((p) => p.id === personId)
    : findPerson(people, clean);
  if (existing) {
    return {
      people: people.map((p) => (p.id === existing.id ? { ...p, ...clean } : p)),
      personId: existing.id,
    };
  }
  const id = env.newId();
  return {
    people: [...people, { id, ...clean, createdAt: env.now() }],
    personId: id,
  };
}

export function removePerson(data: AdminData, personId: string): AdminData {
  return {
    ...data,
    people: data.people.filter((p) => p.id !== personId),
    trips: data.trips.map((t) => ({
      ...t,
      seats: Object.fromEntries(
        Object.entries(t.seats).filter(([, s]) => s.personId !== personId),
      ),
    })),
  };
}

export function occupiedCount(trip: AdminTrip) {
  return Object.keys(trip.seats).length;
}

export function freeSeats(trip: AdminTrip) {
  const free: number[] = [];
  for (let seat = 1; seat <= SEAT_COUNT; seat++) {
    if (!trip.seats[seat]) free.push(seat);
  }
  return free;
}

/* ----------------------------- Importação ----------------------------- */

export type ImportRow = {
  seat?: number;
  name: string;
  docType?: DocType;
  document: string;
  phone: string;
  boarding: string;
};

export type ImportStats = {
  created: number;
  updated: number;
  seated: number;
  replaced: number;
};

function rowDraft(row: ImportRow): PersonDraft {
  const docType = row.docType ?? guessDocType(row.document);
  return { name: row.name, docType, document: row.document, phone: row.phone };
}

function upsertFromRow(people: Person[], row: ImportRow, env: Env, stats: ImportStats) {
  const draft = cleanDraft(rowDraft(row));
  const existing = findPerson(people, draft);
  if (existing) {
    stats.updated++;
    // Uma célula vazia na planilha não apaga o que já estava salvo.
    const merged: PersonDraft = {
      name: draft.name || existing.name,
      docType: draft.document ? draft.docType : existing.docType,
      document: draft.document || existing.document,
      phone: draft.phone || existing.phone,
    };
    return upsertPerson(people, merged, env, existing.id);
  }
  stats.created++;
  return upsertPerson(people, draft, env);
}

export function importPeople(data: AdminData, rows: ImportRow[], env: Env) {
  const stats: ImportStats = { created: 0, updated: 0, seated: 0, replaced: 0 };
  let people = data.people;
  for (const row of rows) {
    if (!row.name.trim()) continue;
    people = upsertFromRow(people, row, env, stats).people;
  }
  return { data: { ...data, people }, stats };
}

/** Linhas com poltrona ocupam o ônibus; sem poltrona, só entram no cadastro. */
export function importTrip(
  data: AdminData,
  tripId: string,
  rows: ImportRow[],
  env: Env,
) {
  const stats: ImportStats = { created: 0, updated: 0, seated: 0, replaced: 0 };
  const trip = data.trips.find((t) => t.id === tripId);
  if (!trip) return { data, stats };
  let people = data.people;
  const seats = { ...trip.seats };
  for (const row of rows) {
    if (!row.name.trim()) continue;
    const result = upsertFromRow(people, row, env, stats);
    people = result.people;
    if (!row.seat || row.seat < 1 || row.seat > SEAT_COUNT) continue;
    for (const [s, entry] of Object.entries(seats)) {
      if (entry.personId === result.personId) delete seats[Number(s)];
    }
    if (seats[row.seat]) stats.replaced++;
    seats[row.seat] = { personId: result.personId, boarding: row.boarding.trim() };
    stats.seated++;
  }
  return {
    data: {
      ...data,
      people,
      trips: data.trips.map((t) => (t.id === tripId ? { ...t, seats } : t)),
    },
    stats,
  };
}

/* ------------------------------ Migrações ------------------------------ */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/** v1: lista de viagens, cada poltrona com os dados do passageiro digitados. */
function v1ToV2(raw: unknown[], env: Env): AdminData {
  let people: Person[] = [];
  const trips: AdminTrip[] = [];
  for (const item of raw) {
    if (!isRecord(item)) throw new InvalidDataError("Viagem inválida.");
    const seats: Record<number, SeatEntry> = {};
    const seatedHere = new Set<string>();
    const passengers = isRecord(item.passengers) ? item.passengers : {};
    for (const [seatKey, value] of Object.entries(passengers)) {
      const seat = Number(seatKey);
      if (!Number.isInteger(seat) || seat < 1 || seat > SEAT_COUNT) continue;
      if (!isRecord(value) || !str(value.name).trim()) continue;
      const rawDoc = str(value.document);
      const docType = guessDocType(rawDoc);
      const draft = cleanDraft({
        name: str(value.name),
        docType,
        document: rawDoc,
        phone: str(value.phone),
      });
      // Dois homônimos no mesmo ônibus são pessoas diferentes.
      const match = findPerson(people, draft);
      const reuse = match && !seatedHere.has(match.id) ? match.id : undefined;
      let personId: string;
      if (reuse) {
        personId = reuse;
      } else {
        personId = env.newId();
        people = [...people, { id: personId, ...draft, createdAt: env.now() }];
      }
      seatedHere.add(personId);
      seats[seat] = { personId, boarding: str(value.boarding).trim() };
    }
    trips.push({
      id: str(item.id) || env.newId(),
      name: str(item.name),
      createdAt: str(item.createdAt) || env.now(),
      seats,
    });
  }
  return { schema: 2, people, trips };
}

function checkV2(raw: Record<string, unknown>, env: Env): AdminData {
  if (!Array.isArray(raw.people) || !Array.isArray(raw.trips)) {
    throw new InvalidDataError("Faltam passageiros ou viagens.");
  }
  const people: Person[] = [];
  for (const p of raw.people) {
    if (!isRecord(p) || !str(p.id) || !str(p.name).trim()) continue;
    const docType = parseDocType(p.docType) ?? guessDocType(str(p.document));
    people.push({
      id: str(p.id),
      ...cleanDraft({
        name: str(p.name),
        docType,
        document: str(p.document),
        phone: str(p.phone),
      }),
      createdAt: str(p.createdAt) || env.now(),
    });
  }
  const known = new Set(people.map((p) => p.id));
  const trips: AdminTrip[] = [];
  for (const t of raw.trips) {
    if (!isRecord(t) || !str(t.id)) continue;
    const seats: Record<number, SeatEntry> = {};
    for (const [seatKey, value] of Object.entries(isRecord(t.seats) ? t.seats : {})) {
      const seat = Number(seatKey);
      if (!Number.isInteger(seat) || seat < 1 || seat > SEAT_COUNT) continue;
      if (!isRecord(value) || !known.has(str(value.personId))) continue;
      seats[seat] = { personId: str(value.personId), boarding: str(value.boarding) };
    }
    trips.push({
      id: str(t.id),
      name: str(t.name),
      createdAt: str(t.createdAt) || env.now(),
      seats,
    });
  }
  return { schema: 2, people, trips };
}

/**
 * Recebe o que estava salvo, em qualquer versão já publicada, e devolve no
 * formato atual. `from` diz de qual versão veio.
 */
export function migrate(raw: unknown, env: Env): { data: AdminData; from: number } {
  if (raw == null) return { data: emptyData(), from: CURRENT_SCHEMA };
  if (Array.isArray(raw)) return { data: v1ToV2(raw, env), from: 1 };
  if (!isRecord(raw) || typeof raw.schema !== "number") {
    throw new InvalidDataError("Formato não reconhecido.");
  }
  if (raw.schema > CURRENT_SCHEMA) throw new NewerSchemaError(raw.schema);
  if (raw.schema === 2) return { data: checkV2(raw, env), from: 2 };
  throw new InvalidDataError(`Versão ${raw.schema} desconhecida.`);
}
