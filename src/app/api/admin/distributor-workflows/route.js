export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorComplaint from "@/models/DistributorComplaint";
import DistributorDispatchReview from "@/models/DistributorDispatchReview";
import DistributorMaterialRequest from "@/models/DistributorMaterialRequest";
import DistributorPaymentUpdate from "@/models/DistributorPaymentUpdate";

const workflowConfig = {
  complaint: {
    model: DistributorComplaint,
    numberField: "complaintNumber",
    allowedStatuses: ["Open", "Under Review", "Resolved"],
  },
  materialRequest: {
    model: DistributorMaterialRequest,
    numberField: "requestNumber",
    allowedStatuses: ["Submitted", "In Review", "Approved", "Rejected"],
  },
  paymentUpdate: {
    model: DistributorPaymentUpdate,
    numberField: "updateNumber",
    allowedStatuses: ["Submitted", "Acknowledged"],
  },
  dispatchReview: {
    model: DistributorDispatchReview,
    numberField: "reviewNumber",
    allowedStatuses: ["Submitted", "Reviewed"],
  },
};

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

async function getCompanyUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  const user = verifyJWT(token);
  if (!user?.companyId) return null;
  return user;
}

function buildAdminUpdateDescription(body) {
  const changes = [];
  if (body.status) changes.push(`status set to ${body.status}`);
  if (body.internalOwner !== undefined) changes.push(`owner updated to ${body.internalOwner || "unassigned"}`);
  if (body.linkedCreditNoteNumber !== undefined && body.linkedCreditNoteNumber !== "") {
    changes.push(`credit note linked as ${body.linkedCreditNoteNumber}`);
  }
  if (body.adminNotes) changes.push(`note added`);
  return changes.join(", ");
}

function mapRows(items, type) {
  return items.map((item) => ({
    id: String(item._id),
    type,
    number:
      item.complaintNumber ||
      item.requestNumber ||
      item.updateNumber ||
      item.reviewNumber ||
      "",
    distributor: item.distributorAccountId?.displayName || item.distributorAccountId?.distributorCode || "-",
    distributorCode: item.distributorAccountId?.distributorCode || "-",
    user: item.distributorUserId?.fullName || item.distributorUserId?.mobileNumber || "-",
    primaryRef:
      item.invoiceNumber ||
      item.deliveryNoteNumber ||
      item.itemCode ||
      "-",
    summary:
      item.complaintType ||
      item.paymentMode ||
      item.issueType ||
      item.purpose ||
      item.remarks ||
      "-",
    status: item.status,
    internalOwner: item.internalOwner || "",
    adminNotes: item.adminNotes || "",
    linkedCreditNoteNumber: item.linkedCreditNoteNumber || "",
    erpSyncStatus: item.erpSyncStatus || "Pending",
    erpSyncReference: item.erpSyncReference || "",
    updatedAt: formatDate(item.updatedAt),
    createdAtRaw: new Date(item.createdAt || item.updatedAt || Date.now()).getTime(),
  }));
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const [complaints, materialRequests, paymentUpdates, dispatchReviews] = await Promise.all([
      DistributorComplaint.find({ companyId: user.companyId }).populate("distributorAccountId", "displayName distributorCode").populate("distributorUserId", "fullName mobileNumber").sort({ updatedAt: -1 }).limit(50).lean(),
      DistributorMaterialRequest.find({ companyId: user.companyId }).populate("distributorAccountId", "displayName distributorCode").populate("distributorUserId", "fullName mobileNumber").sort({ updatedAt: -1 }).limit(50).lean(),
      DistributorPaymentUpdate.find({ companyId: user.companyId }).populate("distributorAccountId", "displayName distributorCode").populate("distributorUserId", "fullName mobileNumber").sort({ updatedAt: -1 }).limit(50).lean(),
      DistributorDispatchReview.find({ companyId: user.companyId }).populate("distributorAccountId", "displayName distributorCode").populate("distributorUserId", "fullName mobileNumber").sort({ updatedAt: -1 }).limit(50).lean(),
    ]);

    const complaintRows = mapRows(complaints, "complaint");
    const materialRequestRows = mapRows(materialRequests, "materialRequest");
    const paymentUpdateRows = mapRows(paymentUpdates, "paymentUpdate");
    const dispatchReviewRows = mapRows(dispatchReviews, "dispatchReview");

    const allRows = [
      ...complaintRows,
      ...materialRequestRows,
      ...paymentUpdateRows,
      ...dispatchReviewRows,
    ].sort((a, b) => b.createdAtRaw - a.createdAtRaw);

    return NextResponse.json({
      success: true,
      summary: {
        total: allRows.length,
        complaints: complaintRows.length,
        materialRequests: materialRequestRows.length,
        paymentUpdates: paymentUpdateRows.length,
        dispatchReviews: dispatchReviewRows.length,
        failedSync: allRows.filter((row) => row.erpSyncStatus === "Failed").length,
      },
      records: {
        complaints: complaintRows,
        materialRequests: materialRequestRows,
        paymentUpdates: paymentUpdateRows,
        dispatchReviews: dispatchReviewRows,
        all: allRows,
      },
    });
  } catch (error) {
    console.error("Admin distributor workflows GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch distributor workflow records" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const type = String(body.type || "").trim();
    const number = String(body.number || "").trim();
    const status = String(body.status || "").trim();
    const internalOwner = String(body.internalOwner || "").trim();
    const adminNotes = String(body.adminNotes || "").trim();
    const linkedCreditNoteNumber = String(body.linkedCreditNoteNumber || "").trim();
    const config = workflowConfig[type];

    if (!config || !number) {
      return NextResponse.json({ success: false, message: "Valid type and document number are required" }, { status: 400 });
    }

    if (status && !config.allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Status is not allowed for this workflow" }, { status: 400 });
    }

    await dbConnect();

    const update = {
      internalOwner,
      adminNotes,
    };
    if (status) update.status = status;
    if (type === "complaint") {
      update.linkedCreditNoteNumber = linkedCreditNoteNumber;
    }

    const record = await config.model.findOneAndUpdate(
      {
        companyId: user.companyId,
        [config.numberField]: number,
      },
      { $set: update },
      { new: true }
    );

    if (!record) {
      return NextResponse.json({ success: false, message: "Workflow record not found" }, { status: 404 });
    }

    await createDistributorWorkflowEvent({
      companyId: user.companyId,
      distributorAccountId: record.distributorAccountId || null,
      distributorUserId: record.distributorUserId || null,
      workflowType: type,
      workflowNumber: number,
      actorType: "admin",
      actorLabel: user.email || user.companyName || "Admin",
      title: "Workflow updated",
      description: buildAdminUpdateDescription(body) || "Workflow details were updated.",
    });

    return NextResponse.json({
      success: true,
      message: status ? `${number} updated to ${status}` : `${number} updated successfully`,
    });
  } catch (error) {
    console.error("Admin distributor workflows PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update workflow status" }, { status: 500 });
  }
}
