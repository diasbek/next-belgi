import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function masterKey(): Buffer {
  const raw = process.env.SECRETS_MASTER_KEY?.trim();
  if (!raw) {
    throw new Error("SECRETS_MASTER_KEY_missing");
  }
  // Accept 64-hex (32 bytes) or any string → sha256
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return createHash("sha256").update(raw).digest();
}

/** Encrypt JSON-serializable payload → base64url(iv + tag + ciphertext). */
export function encryptSecretPayload(payload: unknown): string {
  const key = masterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plain = Buffer.from(JSON.stringify(payload), "utf8");
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptSecretPayload<T = Record<string, unknown>>(
  encoded: string,
): T {
  const key = masterKey();
  const buf = Buffer.from(encoded, "base64url");
  if (buf.length < 28) throw new Error("invalid_ciphertext");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plain.toString("utf8")) as T;
}

export function hasSecretsMasterKey(): boolean {
  return Boolean(process.env.SECRETS_MASTER_KEY?.trim());
}
