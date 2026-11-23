import {
  type AdminData,
  type AdminTrip,
  type ImportRow,
  SEAT_COUNT,
  formatDocument,
  formatPhone,
  normalizeName,
  parseDocType,
} from "@/lib/admin/schema";

// As bibliotecas de planilha só são baixadas quando alguém exporta ou importa.

type Cell = { value: string | number; fontWeight?: "bold" };

const TRIP_HEADERS = ["Poltrona", "Nome", "Tipo de documento", "Documento", "Telefone", "Embarque"];
const PEOPLE_HEADERS = ["Nome", "Tipo de documento", "Documento", "Telefone"];

function header(labels: string[]): Cell[] {
  return labels.map((value) => ({ value, fontWeight: "bold" as const }));
}

function fileSafe(name: string) {
  return normalizeName(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kairos";
}

async function download(rows: Cell[][], widths: number[], fileName: string) {
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  const blob = await writeExcelFile(rows, {
    columns: widths.map((width) => ({ width })),
  }).toBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Todas as 46 poltronas, para servir também de modelo de preenchimento. */
export async function exportTrip(data: AdminData, trip: AdminTrip) {
  const byId = new Map(data.people.map((p) => [p.id, p]));
  const rows: Cell[][] = [header(TRIP_HEADERS)];
  for (let seat = 1; seat <= SEAT_COUNT; seat++) {
    const entry = trip.seats[seat];
    const person = entry && byId.get(entry.personId);
    rows.push(
      person
        ? [
            { value: seat },
            { value: person.name },
            { value: person.document ? person.docType : "" },
            { value: formatDocument(person.docType, person.document) },
            { value: formatPhone(person.phone) },
            { value: entry.boarding },
          ]
        : [{ value: seat }, { value: "" }, { value: "" }, { value: "" }, { value: "" }, { value: "" }],
    );
  }
  await download(rows, [10, 36, 20, 20, 20, 20], `passageiros-${fileSafe(trip.name)}.xlsx`);
}

export async function exportPeople(data: AdminData) {
  const rows: Cell[][] = [header(PEOPLE_HEADERS)];
  const sorted = [...data.people].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  for (const p of sorted) {
    rows.push([
      { value: p.name },
      { value: p.document ? p.docType : "" },
      { value: formatDocument(p.docType, p.document) },
      { value: formatPhone(p.phone) },
    ]);
  }
  await download(rows, [36, 20, 20, 20], "passageiros-kairos.xlsx");
}

type Field = "seat" | "name" | "docType" | "document" | "phone" | "boarding";

function fieldOf(label: unknown): Field | null {
  const h = normalizeName(String(label ?? ""));
  if (!h) return null;
  if (h.startsWith("polt") || h.startsWith("assento") || h === "lugar") return "seat";
  if (h.startsWith("nome") || h === "passageiro") return "name";
  if (h.startsWith("tipo")) return "docType";
  if (h.startsWith("doc") || h === "cpf" || h === "rg" || h === "cin") return "document";
  if (h.startsWith("tel") || h.startsWith("cel") || h.startsWith("whats") || h === "fone") return "phone";
  if (h.startsWith("embarque") || h.startsWith("local")) return "boarding";
  return null;
}

export type ParsedSheet =
  | { ok: true; rows: ImportRow[] }
  | { ok: false; error: string };

/** Lê a primeira aba. Aceita as colunas em qualquer ordem, pelo cabeçalho. */
export async function parseSheet(file: File): Promise<ParsedSheet> {
  let sheet: unknown[][];
  try {
    const { readSheet } = await import("read-excel-file/universal");
    sheet = (await readSheet(file)) as unknown[][];
  } catch {
    return { ok: false, error: "Não foi possível ler esse arquivo. Envie uma planilha .xlsx." };
  }
  const headerIndex = sheet.findIndex((row) => row.some((c) => fieldOf(c) === "name"));
  if (headerIndex === -1) {
    return { ok: false, error: 'A planilha precisa de uma coluna "Nome" no cabeçalho.' };
  }
  const columns = sheet[headerIndex].map(fieldOf);
  const rows: ImportRow[] = [];
  for (const line of sheet.slice(headerIndex + 1)) {
    const get = (field: Field) => {
      const i = columns.indexOf(field);
      return i === -1 || line[i] == null ? "" : String(line[i]).trim();
    };
    const name = get("name");
    if (!name) continue;
    const docType = parseDocType(get("docType")) ?? undefined;
    let doc = get("document");
    // O Excel guarda CPF como número e come os zeros da frente.
    const docIndex = columns.indexOf("document");
    if (typeof line[docIndex] === "number" && docType !== "RG" && doc.length < 11 && doc.length >= 9) {
      doc = doc.padStart(11, "0");
    }
    const seat = Number(get("seat"));
    rows.push({
      seat: Number.isInteger(seat) && seat >= 1 && seat <= SEAT_COUNT ? seat : undefined,
      name,
      docType,
      document: doc,
      phone: get("phone"),
      boarding: get("boarding"),
    });
  }
  if (rows.length === 0) {
    return { ok: false, error: "Nenhuma linha com nome foi encontrada na planilha." };
  }
  return { ok: true, rows };
}
