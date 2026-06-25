import {
  normalizeEInvoiceResponse,
  performERPNextComplianceRequest,
} from "./complianceHelpers";

const METHODS = {
  generate:
    process.env.ERP_NEXT_EINVOICE_GENERATE_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.generate_einvoice",
  cancel:
    process.env.ERP_NEXT_EINVOICE_CANCEL_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.cancel_einvoice",
  status:
    process.env.ERP_NEXT_EINVOICE_STATUS_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.get_einvoice_status",
};

export async function runEInvoiceAction(action, payload) {
  const path = METHODS[action];
  if (!path) {
    const error = new Error(`Unsupported e-invoice action: ${action}`);
    error.code = "UNSUPPORTED_ACTION";
    throw error;
  }

  const response = await performERPNextComplianceRequest(path, payload);
  return normalizeEInvoiceResponse(response);
}
