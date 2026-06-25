import { erpnextRequest } from "./erpnextClient";

function pickFirst(...values) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function responseData(raw = {}) {
  return raw?.message?.data || raw?.data || raw?.message || raw;
}

export function normalizeEInvoiceResponse(raw = {}) {
  const data = responseData(raw);
  return {
    status: pickFirst(
      data.status,
      data.einvoice_status,
      data.irn_status,
      data.irn ? "Generated" : ""
    ) || "Generated",
    irn: pickFirst(data.irn, data.Irn, data.irn_no),
    ackNo: pickFirst(data.ack_no, data.AckNo, data.acknowledgement_number),
    ackDate: parseDate(pickFirst(data.ack_date, data.AckDt, data.acknowledgement_date)),
    signedInvoice: pickFirst(data.signed_invoice, data.SignedInvoice),
    signedQRCode: pickFirst(data.signed_qr_code, data.SignedQRCode),
    qrCodeData: pickFirst(data.qr_code, data.qr_code_image),
    requestId: pickFirst(data.request_id, data.requestId),
    errorMessage: pickFirst(data.error, data.message),
    raw: data,
  };
}

export function normalizeEWayBillResponse(raw = {}) {
  const data = responseData(raw);
  return {
    status: pickFirst(
      data.status,
      data.ewaybill_status,
      data.ewb_status,
      data.eway_bill_no || data.ewbNo ? "Generated" : ""
    ) || "Generated",
    ewbNo: pickFirst(data.eway_bill_no, data.ewbNo, data.ewb_number),
    ewbDate: parseDate(pickFirst(data.eway_bill_date, data.ewbDt, data.date)),
    validUpto: parseDate(pickFirst(data.valid_upto, data.validUpto, data.valid_till)),
    requestId: pickFirst(data.request_id, data.requestId),
    errorMessage: pickFirst(data.error, data.message),
    raw: data,
  };
}

export async function performERPNextComplianceRequest(path, body) {
  return erpnextRequest(path, { body });
}
