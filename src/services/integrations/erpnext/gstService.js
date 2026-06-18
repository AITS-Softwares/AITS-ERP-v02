import { erpnextRequest } from "./erpnextClient";
import { normalizeGSTIN } from "@/utils/gstin";

const GST_LOOKUP_METHOD =
  process.env.ERP_NEXT_GST_METHOD ||
  "/api/method/india_compliance.gst_india.utils.gstin_info.get_gstin_info";

export function normalizeGSTDetails(raw = {}) {
  const data = raw.message?.data || raw.data || raw.message || {};
  const permanentAddress = data.permanent_address || {};
  const businessName = data.business_name || data.legal_name || data.trade_name || "";

  return {
    gstin: normalizeGSTIN(data.gstin),
    legalName: data.legal_name || data.legalName || businessName,
    tradeName: data.trade_name || data.tradeName || businessName,
    address:
      data.address ||
      [permanentAddress.address_line1, permanentAddress.address_line2, permanentAddress.city, permanentAddress.state, permanentAddress.pincode]
        .filter(Boolean)
        .join(", "),
    addressLine1: data.address_line1 || permanentAddress.address_line1 || "",
    addressLine2: data.address_line2 || permanentAddress.address_line2 || "",
    city: data.city || permanentAddress.city || "",
    state: data.state || permanentAddress.state || "",
    country: data.country || permanentAddress.country || "India",
    status: data.status || "",
    pincode: data.pincode || data.pin || permanentAddress.pincode || "",
    pan: data.pan || data.tax_id || "",
    gstCategory: data.gst_category || "",
    email: data.email_id || data.email || "",
    mobile: data.mobile_no || data.mobile || "",
    contactPerson: data.contact_person || "",
  };
}

export async function lookupGSTIN(gstin) {
  const response = await erpnextRequest(GST_LOOKUP_METHOD, {
    body: {
      gstin: normalizeGSTIN(gstin),
      doc: {},
      throw_error: true,
    },
  });

  const success = response.success ?? response.message?.success ?? true;
  const data = normalizeGSTDetails(response);

  if (!success || !data.gstin) {
    const error = new Error("No GST details found");
    error.code = "EMPTY_RESPONSE";
    throw error;
  }

  return data;
}
