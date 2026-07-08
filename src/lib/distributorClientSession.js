function parseDistributorToken(token) {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = JSON.parse(window.atob(padded));
    return decoded && decoded.type === "distributor" ? decoded : null;
  } catch {
    return null;
  }
}

export function getStoredDistributorToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("distributor_token") || "";
}

export function clearStoredDistributorToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("distributor_token");
}

export function hasValidDistributorSession() {
  if (typeof window === "undefined") return false;

  const token = getStoredDistributorToken();
  const payload = parseDistributorToken(token);
  if (!payload) return false;

  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}

export function getDistributorRecoveryTarget() {
  return hasValidDistributorSession() ? "/distributor" : "/distributor/signin";
}

export function getDistributorRecoveryLabel() {
  return hasValidDistributorSession() ? "Go to dashboard" : "Go to distributor login";
}
