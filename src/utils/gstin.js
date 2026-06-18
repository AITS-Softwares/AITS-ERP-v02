export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function normalizeGSTIN(value = "") {
  return String(value).trim().toUpperCase();
}

export function isValidGSTIN(value = "") {
  return GSTIN_REGEX.test(normalizeGSTIN(value));
}

export function getGSTINValidationMessage(value = "") {
  const gstin = normalizeGSTIN(value);
  if (!gstin) return "GSTIN is required";
  if (gstin.length !== 15) return "GSTIN must be 15 characters";
  if (!GSTIN_REGEX.test(gstin)) return "Invalid GSTIN format";
  return "";
}

