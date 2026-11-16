import { decryptJson, encryptJson } from "@/lib/admin/crypto";

export const SEAT_COUNT = 46;
const STORAGE_KEY = "kairos-admin-data-v1";

export type Passenger = {
  name: string;
  document: string;
  phone: string;
  boarding: string;
};

export type AdminTrip = {
  id: string;
  name: string;
  createdAt: string;
  /** Poltrona (1 a 46) -> passageiro. */
  passengers: Record<number, Passenger>;
};

export type LoadResult =
  | { ok: true; trips: AdminTrip[] }
  | { ok: false; reason: "undecryptable" };

/** Lê as viagens deste navegador. Vazio se nunca houve dados. */
export async function loadTrips(key: CryptoKey): Promise<LoadResult> {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: true, trips: [] };
  }
  if (!stored) return { ok: true, trips: [] };
  try {
    return { ok: true, trips: await decryptJson<AdminTrip[]>(key, stored) };
  } catch {
    // Dados gravados com outra senha: não sobrescrever.
    return { ok: false, reason: "undecryptable" };
  }
}

export async function saveTrips(key: CryptoKey, trips: AdminTrip[]) {
  localStorage.setItem(STORAGE_KEY, await encryptJson(key, trips));
}

export function occupiedCount(trip: AdminTrip) {
  return Object.keys(trip.passengers).length;
}

export function freeSeats(trip: AdminTrip) {
  const free: number[] = [];
  for (let seat = 1; seat <= SEAT_COUNT; seat++) {
    if (!trip.passengers[seat]) free.push(seat);
  }
  return free;
}

/** Valida um backup importado antes de aceitar. */
export function parseBackup(text: string): AdminTrip[] | null {
  try {
    const data = JSON.parse(text) as unknown;
    if (!Array.isArray(data)) return null;
    const trips: AdminTrip[] = [];
    for (const item of data) {
      if (!item || typeof item.id !== "string" || typeof item.name !== "string") {
        return null;
      }
      const passengers: Record<number, Passenger> = {};
      for (const [seat, p] of Object.entries(item.passengers ?? {})) {
        const n = Number(seat);
        const pax = p as Partial<Passenger>;
        if (!Number.isInteger(n) || n < 1 || n > SEAT_COUNT) return null;
        if (typeof pax?.name !== "string") return null;
        passengers[n] = {
          name: pax.name,
          document: String(pax.document ?? ""),
          phone: String(pax.phone ?? ""),
          boarding: String(pax.boarding ?? ""),
        };
      }
      trips.push({
        id: item.id,
        name: item.name,
        createdAt: String(item.createdAt ?? new Date().toISOString()),
        passengers,
      });
    }
    return trips;
  } catch {
    return null;
  }
}
