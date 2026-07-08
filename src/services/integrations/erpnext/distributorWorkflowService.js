import { ERPNextError, erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";
import { resolveERPNextDistributorContext, getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";

function normalizeText(value) {
  return String(value || "").trim();
}

function toNumber(value) {
  const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function createERPNextDocument(config, doctype, body) {
  const payload = await erpnextRequestWithConfig(
    config,
    `/api/resource/${encodeURIComponent(doctype)}`,
    { method: "POST", body }
  );

  return payload?.data || null;
}

function buildDistributorContextLabel(session) {
  return [
    session.account?.displayName,
    session.account?.distributorCode,
    session.erpCustomer?.customer_name || session.erpCustomer?.name,
    session.user?.mobileNumber,
  ].filter(Boolean).join(" | ");
}

function buildIssueDescription(title, lines) {
  return [title, ...lines.filter(Boolean)].join("\n");
}

async function createERPNextIssue(config, { subject, priority = "Medium", description }) {
  return createERPNextDocument(config, "Issue", {
    doctype: "Issue",
    subject: normalizeText(subject),
    priority: normalizeText(priority) || "Medium",
    status: "Open",
    description: normalizeText(description),
  });
}

function success(reference, message) {
  return {
    status: "Synced",
    reference: reference || "",
    message,
  };
}

function skipped(message) {
  return {
    status: "Not Configured",
    reference: "",
    message,
  };
}

function failed(error) {
  return {
    status: "Failed",
    reference: "",
    message: getERPNextErrorMessage(error),
  };
}

export async function syncDistributorComplaintToERPNext(session, complaint) {
  try {
    const liveContext = await resolveERPNextDistributorContext(session);
    if (!liveContext?.config) {
      return skipped("ERPNext connection is not configured yet.");
    }

    const issue = await createERPNextIssue(liveContext.config, {
      subject: `Distributor complaint ${complaint.complaintNumber}`,
      priority: complaint.priority || "Medium",
      description: buildIssueDescription(
        `Complaint ${complaint.complaintNumber}`,
        [
          `Distributor: ${buildDistributorContextLabel(session)}`,
          `Invoice: ${complaint.invoiceNumber}`,
          complaint.deliveryNoteNumber ? `Delivery Note: ${complaint.deliveryNoteNumber}` : "",
          `Type: ${complaint.complaintType}`,
          `Assigned Team: ${complaint.assignedTeam}`,
          complaint.remarks ? `Remarks: ${complaint.remarks}` : "",
        ]
      ),
    });

    return success(issue?.name, `ERPNext Issue ${issue?.name || ""} created.`.trim());
  } catch (error) {
    return failed(error);
  }
}

export async function syncDistributorPaymentUpdateToERPNext(session, update) {
  try {
    const liveContext = await resolveERPNextDistributorContext(session);
    if (!liveContext?.config) {
      return skipped("ERPNext connection is not configured yet.");
    }

    const issue = await createERPNextIssue(liveContext.config, {
      subject: `Distributor payment update ${update.updateNumber}`,
      priority: "Medium",
      description: buildIssueDescription(
        `Payment update ${update.updateNumber}`,
        [
          `Distributor: ${buildDistributorContextLabel(session)}`,
          `Invoice: ${update.invoiceNumber}`,
          `Payment mode: ${update.paymentMode}`,
          `Amount: ${toNumber(update.amount)}`,
          update.reference ? `Reference: ${update.reference}` : "",
          `Notify Accounts: ${update.notifyAccounts ? "Yes" : "No"}`,
        ]
      ),
    });

    return success(issue?.name, `ERPNext Issue ${issue?.name || ""} created.`.trim());
  } catch (error) {
    return failed(error);
  }
}

export async function syncDistributorDispatchReviewToERPNext(session, review) {
  try {
    const liveContext = await resolveERPNextDistributorContext(session);
    if (!liveContext?.config) {
      return skipped("ERPNext connection is not configured yet.");
    }

    const priority = review.reviewStatus === "Issue" ? "High" : "Low";
    const issue = await createERPNextIssue(liveContext.config, {
      subject: `Distributor dispatch review ${review.reviewNumber}`,
      priority,
      description: buildIssueDescription(
        `Dispatch review ${review.reviewNumber}`,
        [
          `Distributor: ${buildDistributorContextLabel(session)}`,
          `Delivery Note: ${review.deliveryNoteNumber}`,
          review.salesOrderNumber ? `Sales Order: ${review.salesOrderNumber}` : "",
          review.salesInvoiceNumber ? `Sales Invoice: ${review.salesInvoiceNumber}` : "",
          `Review status: ${review.reviewStatus}`,
          review.issueType ? `Issue type: ${review.issueType}` : "",
          review.remarks ? `Remarks: ${review.remarks}` : "",
          `Notify Claims: ${review.notifyClaims ? "Yes" : "No"}`,
        ]
      ),
    });

    return success(issue?.name, `ERPNext Issue ${issue?.name || ""} created.`.trim());
  } catch (error) {
    return failed(error);
  }
}

export async function syncDistributorMaterialRequestToERPNext(session, request) {
  try {
    const liveContext = await resolveERPNextDistributorContext(session);
    if (!liveContext?.config) {
      return skipped("ERPNext connection is not configured yet.");
    }

    const scheduleDate = request.scheduleDate
      ? new Date(request.scheduleDate).toISOString().slice(0, 10)
      : todayISO();
    const warehouse = normalizeText(request.warehouseCode || session.account?.preferredWarehouse);

    try {
      const materialRequest = await createERPNextDocument(liveContext.config, "Material Request", {
        doctype: "Material Request",
        material_request_type: "Material Transfer",
        transaction_date: todayISO(),
        schedule_date: scheduleDate,
        set_warehouse: warehouse || undefined,
        items: [
          {
            item_code: normalizeText(request.itemCode),
            qty: Math.max(1, toNumber(request.quantity)),
            schedule_date: scheduleDate,
            warehouse: warehouse || undefined,
          },
        ],
      });

      return success(materialRequest?.name, `ERPNext Material Request ${materialRequest?.name || ""} created.`.trim());
    } catch (materialRequestError) {
      const issue = await createERPNextIssue(liveContext.config, {
        subject: `Distributor stock request ${request.requestNumber}`,
        priority: "Medium",
        description: buildIssueDescription(
          `Material request ${request.requestNumber}`,
          [
            `Distributor: ${buildDistributorContextLabel(session)}`,
            `Item Code: ${request.itemCode}`,
            request.itemName ? `Item Name: ${request.itemName}` : "",
            `Quantity: ${Math.max(1, toNumber(request.quantity))}`,
            warehouse ? `Warehouse: ${warehouse}` : "",
            `Purpose: ${request.purpose || "Stock request"}`,
            request.remarks ? `Remarks: ${request.remarks}` : "",
            `Material Request doctype sync failed and this issue was created as fallback.`,
            `Failure: ${getERPNextErrorMessage(materialRequestError)}`,
          ]
        ),
      });

      return success(issue?.name, `ERPNext Material Request fallback Issue ${issue?.name || ""} created.`.trim());
    }
  } catch (error) {
    return failed(error);
  }
}

export function isWorkflowSyncError(result) {
  return result?.status === "Failed";
}

export { ERPNextError };
