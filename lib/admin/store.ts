import { decryptJson, encryptJson } from "@/lib/admin/crypto";
import {
  type AdminData,
  InvalidDataError,
  NewerSchemaError,
  migrate,
} from "@/lib/admin/schema";

// O nome da chave não muda nunca: trocar deixaria os dados antigos órfãos.
// A versão do formato vai dentro do conteúdo (campo `schema`).
const STORAGE_KEY = "kairos-admin-data-v1";
const SNAPSHOT_PREFIX = "kairos-admin-snapshot-schema-";

export const env = {
  newId: () => crypto.randomUUID(),
  now: () => new Date().toISOString(),
};

export type LoadResult =
  | { ok: true; data: AdminData; migratedFrom?: number }
  | { ok: false; reason: "undecryptable" | "newer" | "invalid" };

/**
 * Lê os dados deste navegador e, se vieram de uma versão anterior do site,
 * converte para o formato atual. Antes de regravar, guarda uma cópia intacta
 * do que havia. Em qualquer falha, não escreve nada.
 */
export async function loadData(key: CryptoKey): Promise<LoadResult> {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  let raw: unknown = null;
  if (stored) {
    try {
      raw = await decryptJson<unknown>(key, stored);
    } catch {
      return { ok: false, reason: "undecryptable" };
    }
  }
  try {
    const { data, from } = migrate(raw, env);
    if (stored && from !== data.schema) {
      const snapshotKey = `${SNAPSHOT_PREFIX}${from}`;
      if (!localStorage.getItem(snapshotKey)) {
        localStorage.setItem(snapshotKey, stored);
      }
      await saveData(key, data);
      return { ok: true, data, migratedFrom: from };
    }
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NewerSchemaError) return { ok: false, reason: "newer" };
    if (error instanceof InvalidDataError) return { ok: false, reason: "invalid" };
    throw error;
  }
}

export async function saveData(key: CryptoKey, data: AdminData) {
  localStorage.setItem(STORAGE_KEY, await encryptJson(key, data));
}

/** Aceita backup de qualquer versão já publicada. */
export function parseBackup(text: string): AdminData | null {
  try {
    return migrate(JSON.parse(text) as unknown, env).data;
  } catch {
    return null;
  }
}
