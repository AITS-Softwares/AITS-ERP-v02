import crypto from "crypto";

const PREFIX = "enc:v1:";

function encryptionKey() {
  const source = process.env.ERP_CONNECTION_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source) throw new Error("ERP connection encryption requires ERP_CONNECTION_ENCRYPTION_KEY or JWT_SECRET");
  return crypto.createHash("sha256").update(source).digest();
}

export function encryptConnectionSecret(value) {
  const plainText = String(value || "");
  if (!plainText || plainText.startsWith(PREFIX)) return plainText;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptConnectionSecret(value) {
  const encrypted = String(value || "");
  if (!encrypted.startsWith(PREFIX)) return encrypted; // Legacy values are read safely until they are next saved.

  const [, , ivValue, tagValue, cipherValue] = encrypted.split(":");
  if (!ivValue || !tagValue || !cipherValue) throw new Error("Stored ERP connection credential is invalid");

  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(cipherValue, "base64url")), decipher.final()]).toString("utf8");
}
