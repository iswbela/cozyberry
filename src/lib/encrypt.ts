import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY env var is missing or not 64 hex characters (32 bytes)."
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM.
 * Returns a base64 string: iv(12) + authTag(16) + ciphertext.
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * Decrypts a base64 string produced by `encrypt`.
 * If decryption fails (e.g. plaintext legacy data), returns the original string unchanged.
 */
export function decrypt(value: string): string {
  try {
    const key = getKey();
    const data = Buffer.from(value, "base64");
    if (data.length < 29) return value; // too short to be encrypted
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const ciphertext = data.subarray(28);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    // Plaintext legacy entry — return as-is
    return value;
  }
}
