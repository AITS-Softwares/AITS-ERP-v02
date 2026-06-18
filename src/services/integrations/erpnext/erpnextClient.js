const DEFAULT_TIMEOUT_MS = 15000;

function getConfig() {
  const baseUrl = process.env.ERP_NEXT_URL
    ?.replace(/\/app\/home\/?$/, "")
    ?.replace(/\/+$/, "");
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

export async function erpnextRequest(path, { method = "POST", body } = {}) {
  const config = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

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
