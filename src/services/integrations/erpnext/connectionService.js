import ErpNextConnection, { normalizeBaseUrl } from "@/models/ErpNextConnection";

const DEFAULT_TIMEOUT_MS = Number(process.env.ERP_NEXT_TIMEOUT_MS) || 15000;

export function buildERPNextConfig(connection) {
  if (!connection?.baseUrl || !connection?.apiKey || !connection?.apiSecret) {
    const error = new Error("ERPNext connection details are incomplete");
    error.code = "CONFIG_MISSING";
    throw error;
  }

  return {
    baseUrl: normalizeBaseUrl(connection.baseUrl),
    apiKey: String(connection.apiKey).trim(),
    apiSecret: String(connection.apiSecret).trim(),
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
}

export async function resolveERPNextConnection({ companyId, connectionId } = {}) {
  if (!companyId) return null;

  if (connectionId) {
    return ErpNextConnection.findOne({
      _id: connectionId,
      companyId,
      isActive: true,
    });
  }

  return ErpNextConnection.findOne({
    companyId,
    isActive: true,
  }).sort({ isDefault: -1, updatedAt: -1 });
}
