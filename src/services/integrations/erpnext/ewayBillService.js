import {
  normalizeEWayBillResponse,
  performERPNextComplianceRequest,
} from "./complianceHelpers";

const METHODS = {
  generate:
    process.env.ERP_NEXT_EWAY_GENERATE_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.generate_ewaybill",
  cancel:
    process.env.ERP_NEXT_EWAY_CANCEL_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.cancel_ewaybill",
  status:
    process.env.ERP_NEXT_EWAY_STATUS_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.get_ewaybill_status",
  "update-vehicle":
    process.env.ERP_NEXT_EWAY_UPDATE_VEHICLE_METHOD ||
    "/api/method/erpexpress_integration.api.compliance.update_eway_vehicle",
};

export async function runEWayBillAction(action, payload) {
  const path = METHODS[action];
  if (!path) {
    const error = new Error(`Unsupported e-way bill action: ${action}`);
    error.code = "UNSUPPORTED_ACTION";
    throw error;
  }

  const response = await performERPNextComplianceRequest(path, payload);
  return normalizeEWayBillResponse(response);
}
