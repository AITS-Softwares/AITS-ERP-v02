import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import Customer from "@/models/CustomerModel";
import Item from "@/models/ItemModels";
import IntegrationLog from "@/models/IntegrationLog";
import SalesInvoice from "@/models/SalesInvoice";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { buildCompliancePayload, validateComplianceReadiness } from "@/services/integrations/erpnext/compliancePayload";
import { runEInvoiceAction } from "@/services/integrations/erpnext/einvoiceService";
import { runEWayBillAction } from "@/services/integrations/erpnext/ewayBillService";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mergeCompliance(invoice, updates = {}) {
  invoice.compliance = invoice.compliance || {};
  const compliance = invoice.compliance;

  for (const key of [
    "supplyType",
    "transactionType",
    "placeOfSupply",
    "exportType",
    "transporterName",
    "transporterId",
    "transportMode",
    "vehicleNumber",
    "vehicleType",
    "transportDocumentNumber",
  ]) {
    if (updates[key] != null) compliance[key] = updates[key];
  }

  if (updates.reverseCharge != null) {
    compliance.reverseCharge = Boolean(updates.reverseCharge);
  }

  if (updates.transportDistanceKm != null) {
    compliance.transportDistanceKm = Number(updates.transportDistanceKm) || 0;
  }

  if (updates.transportDocumentDate) {
    compliance.transportDocumentDate = updates.transportDocumentDate;
  }

  if (updates.dispatchFrom) {
    compliance.dispatchFrom = { ...(compliance.dispatchFrom || {}), ...updates.dispatchFrom };
  }

  if (updates.shipTo) {
    compliance.shipTo = { ...(compliance.shipTo || {}), ...updates.shipTo };
  }
}

function updateInvoiceWithResult(invoice, docType, action, result, reason = "") {
  const now = new Date();

  if (docType === "einvoice") {
    invoice.compliance.eInvoice = {
      ...(invoice.compliance.eInvoice || {}),
      status: result.status || invoice.compliance.eInvoice?.status || "Generated",
      irn: result.irn || invoice.compliance.eInvoice?.irn || "",
      ackNo: result.ackNo || invoice.compliance.eInvoice?.ackNo || "",
      ackDate: result.ackDate || invoice.compliance.eInvoice?.ackDate || null,
      signedInvoice: result.signedInvoice || invoice.compliance.eInvoice?.signedInvoice || "",
      signedQRCode: result.signedQRCode || invoice.compliance.eInvoice?.signedQRCode || "",
      qrCodeData: result.qrCodeData || invoice.compliance.eInvoice?.qrCodeData || "",
      requestId: result.requestId || invoice.compliance.eInvoice?.requestId || "",
      lastSyncedAt: now,
      errorMessage: result.errorMessage || "",
    };

    if (action === "generate") {
      invoice.compliance.eInvoice.generatedAt = now;
    }
    if (action === "cancel") {
      invoice.compliance.eInvoice.status = result.status || "Cancelled";
      invoice.compliance.eInvoice.cancelledAt = now;
      invoice.compliance.eInvoice.cancelReason = reason;
    }
    return;
  }

  invoice.compliance.eWayBill = {
    ...(invoice.compliance.eWayBill || {}),
    status: result.status || invoice.compliance.eWayBill?.status || "Generated",
    ewbNo: result.ewbNo || invoice.compliance.eWayBill?.ewbNo || "",
    ewbDate: result.ewbDate || invoice.compliance.eWayBill?.ewbDate || null,
    validUpto: result.validUpto || invoice.compliance.eWayBill?.validUpto || null,
    requestId: result.requestId || invoice.compliance.eWayBill?.requestId || "",
    lastSyncedAt: now,
    errorMessage: result.errorMessage || "",
  };

  if (action === "generate") {
    invoice.compliance.eWayBill.generatedAt = now;
  }
  if (action === "cancel") {
    invoice.compliance.eWayBill.status = result.status || "Cancelled";
    invoice.compliance.eWayBill.cancelledAt = now;
    invoice.compliance.eWayBill.cancelReason = reason;
  }
}

export async function POST(req, { params }) {
  const startedAt = Date.now();
  let companyId = null;
  let userId = null;
  let docType = "";
  let action = "";
  let invoiceId = "";

  try {
    await dbConnect();

    const token = getTokenFromHeader(req);
    if (!token) return json({ success: false, message: "Unauthorized" }, 401);

    const user = verifyJWT(token);
    if (!user?.companyId) return json({ success: false, message: "Invalid token" }, 403);

    companyId = user.companyId;
    userId = user.id;

    const routeParams = await params;
    docType = routeParams.docType;
    action = routeParams.action;

    if (!["einvoice", "ewaybill"].includes(docType)) {
      return json({ success: false, message: "Unsupported compliance document type" }, 400);
    }

    const body = await req.json();
    invoiceId = body.invoiceId;
    const cancelReason = body.cancelReason || "";

    if (!invoiceId) {
      return json({ success: false, message: "Invoice id is required" }, 400);
    }

    const invoice = await SalesInvoice.findOne({ _id: invoiceId, companyId: user.companyId });
    if (!invoice) {
      return json({ success: false, message: "Sales invoice not found" }, 404);
    }

    mergeCompliance(invoice, body.compliance || {});

    const company = await Company.findById(user.companyId);
    const customer = invoice.customer
      ? await Customer.findById(invoice.customer)
      : await Customer.findOne({ companyId: user.companyId, customerCode: invoice.customerCode });

    if (!company || !customer) {
      return json({ success: false, message: "Company or customer details not found" }, 400);
    }

    const itemIds = (invoice.items || []).map((item) => item.item).filter(Boolean);
    const itemDocs = await Item.find({ _id: { $in: itemIds } });
    const itemMap = new Map(itemDocs.map((item) => [String(item._id), item]));

    const needsFullValidation =
      action === "generate" || (docType === "ewaybill" && action === "update-vehicle");

    if (needsFullValidation) {
      const missing = validateComplianceReadiness({
        invoice,
        company,
        customer,
        items: itemMap,
        docType,
      });

      if (missing.length) {
        return json({
          success: false,
          message: `Compliance data missing: ${missing.join(", ")}`,
        }, 400);
      }
    }

    const payload = buildCompliancePayload({
      invoice,
      company,
      customer,
      items: itemMap,
    });

    const requestBody = {
      invoice_id: String(invoice._id),
      invoice_number: invoice.invoiceNumber,
      company_id: String(user.companyId),
      payload,
      irn: invoice.compliance?.eInvoice?.irn || "",
      ewb_no: invoice.compliance?.eWayBill?.ewbNo || "",
      cancel_reason: cancelReason,
    };

    const result =
      docType === "einvoice"
        ? await runEInvoiceAction(action, requestBody)
        : await runEWayBillAction(action, requestBody);

    updateInvoiceWithResult(invoice, docType, action, result, cancelReason);
    await invoice.save();

    await IntegrationLog.create({
      companyId,
      userId,
      integration: "erpnext",
      action: `${docType}:${action}`,
      reference: invoice.invoiceNumber,
      status: "success",
      durationMs: Date.now() - startedAt,
      message: result.status || "Completed",
    });

    return json({
      success: true,
      message: `${docType} ${action} completed`,
      data: result,
      invoice,
    });
  } catch (error) {
    await IntegrationLog.create({
      companyId,
      userId,
      integration: "erpnext",
      action: `${docType || "compliance"}:${action || "unknown"}`,
      reference: invoiceId,
      status: "failure",
      durationMs: Date.now() - startedAt,
      errorCode: error.code || "COMPLIANCE_ERROR",
      message: error.message,
    }).catch(() => null);

    return json(
      { success: false, message: error.message || "Compliance action failed" },
      error.status || 500
    );
  }
}
