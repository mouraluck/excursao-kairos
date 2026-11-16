// Login e criptografia do painel admin, tudo no navegador (o site é estático).
// Os parâmetros do verificador precisam bater com next.config.ts.

const ITERATIONS = 150_000;
const VERIFIER_SALT = "kairos-admin-verifier-v1";
const DATA_SALT = "kairos-admin-data-v1";
const encoder = new TextEncoder();

function secretOf(login: string, password: string) {
  return `${login.trim().toLowerCase()}\n${password}`;
}

async function baseKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
}

function params(salt: string): Pbkdf2Params {
  return {
    name: "PBKDF2",
    hash: "SHA-256",
    salt: encoder.encode(salt) as BufferSource,
    iterations: ITERATIONS,
  };
}

/** Hash comparado com o que o build gravou a partir dos secrets. */
export async function deriveVerifier(login: string, password: string) {
  const bits = await crypto.subtle.deriveBits(
    params(VERIFIER_SALT),
    await baseKey(secretOf(login, password)),
    256,
  );
  return [...new Uint8Array(bits)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Chave que criptografa os dados salvos neste navegador. */
export async function deriveDataKey(login: string, password: string) {
  return crypto.subtle.deriveKey(
    params(DATA_SALT),
    await baseKey(secretOf(login, password)),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toBase64(bytes: Uint8Array) {
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return btoa(out);
}

function fromBase64(text: string) {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export async function encryptJson(key: CryptoKey, value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoder.encode(JSON.stringify(value)) as BufferSource,
  );
  return JSON.stringify({
    v: 1,
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(data)),
  });
}

export async function decryptJson<T>(key: CryptoKey, stored: string): Promise<T> {
  const { iv, data } = JSON.parse(stored) as { iv: string; data: string };
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) as BufferSource },
    key,
    fromBase64(data) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
