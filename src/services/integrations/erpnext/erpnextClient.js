const DEFAULT_TIMEOUT_MS = 15000;

function normalizeBaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/app\/home\/?$/i, "")
    .replace(/\/+$/, "");
}

export function getERPNextEnvConfig() {
  const baseUrl = process.env.ERP_NEXT_URL
    ? normalizeBaseUrl(process.env.ERP_NEXT_URL)
    : "";
  const apiKey = process.env.ERP_NEXT_API_KEY;
  const apiSecret = process.env.ERP_NEXT_API_SECRET;

  if (!baseUrl || !apiKey || !apiSecret) {
    const error = new Error("ERPNext integration is not configured");
    error.code = "CONFIG_MISSING";
    throw error;
  }

  return {
    baseUrl,
    apiKey,
    apiSecret,
    timeoutMs: Number(process.env.ERP_NEXT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

export class ERPNextError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ERPNextError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function erpnextRequestWithConfig(config, path, { method = "POST", body } = {}) {
  if (!config?.baseUrl || !config?.apiKey || !config?.apiSecret) {
    throw new ERPNextError("ERPNext integration is not configured", { code: "CONFIG_MISSING" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${config.apiKey}:${config.apiSecret}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ERPNextError("ERPNext request failed", {
        status: res.status,
        code: res.status === 401 || res.status === 403 ? "AUTH_FAILED" : "ERP_NEXT_ERROR",
        details: payload,
      });
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ERPNextError("ERPNext request timed out", { code: "TIMEOUT" });
    }
    if (error instanceof ERPNextError) throw error;
    throw new ERPNextError("Unable to reach ERPNext", { code: "NETWORK_ERROR", details: error.message });
  } finally {
    clearTimeout(timeout);
  }
}

export async function erpnextRequest(path, options = {}) {
  return erpnextRequestWithConfig(getERPNextEnvConfig(), path, options);
}
