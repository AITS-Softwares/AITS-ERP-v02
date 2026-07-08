export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorSyncLog, createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorDispatchReview from "@/models/DistributorDispatchReview";
import { syncDistributorDispatchReviewToERPNext } from "@/services/integrations/erpnext/distributorWorkflowService";

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    if (!body.deliveryNoteNumber || !body.reviewStatus) {
      return NextResponse.json({ success: false, message: "Delivery Note number and review status are required" }, { status: 400 });
    }

    const record = await DistributorDispatchReview.create({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      customerId: session.account.customerId || session.user.customerId || null,
      deliveryNoteNumber: String(body.deliveryNoteNumber).trim(),
      salesOrderNumber: String(body.salesOrderNumber || "").trim(),
      salesInvoiceNumber: String(body.salesInvoiceNumber || "").trim(),
      reviewStatus: String(body.reviewStatus).trim(),
      issueType: String(body.issueType || "").trim(),
      remarks: String(body.remarks || "").trim(),
      notifyClaims: body.notifyClaims !== false,
    });

    await createDistributorWorkflowEvent({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      workflowType: "dispatchReview",
      workflowNumber: record.reviewNumber,
      actorType: "distributor",
      actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
      title: "Dispatch review submitted",
      description: `${record.reviewStatus} recorded for delivery ${record.deliveryNoteNumber}.`,
    });

    const syncResult = await syncDistributorDispatchReviewToERPNext(session, record);
    record.erpSyncStatus = syncResult.status;
    record.erpSyncReference = syncResult.reference || "";
    record.erpSyncMessage = syncResult.message || "";
    await record.save();

    await Promise.all([
      createDistributorWorkflowEvent({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "dispatchReview",
        workflowNumber: record.reviewNumber,
        actorType: "system",
        actorLabel: "ERPNext sync",
        title: `Sync ${syncResult.status}`,
        description: syncResult.message || "Dispatch review sync processed.",
      }),
      createDistributorSyncLog({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "dispatchReview",
        workflowNumber: record.reviewNumber,
        provider: "ERPNext",
        action: "Create dispatch review",
        status: syncResult.status,
        reference: syncResult.reference || "",
        message: syncResult.message || "",
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: syncResult.status === "Synced"
        ? `Dispatch review ${record.reviewNumber} submitted and synced to ERPNext.`
        : `Dispatch review ${record.reviewNumber} submitted successfully. ${syncResult.message || ""}`.trim(),
      reviewNumber: record.reviewNumber,
      erpSyncStatus: record.erpSyncStatus,
      erpSyncReference: record.erpSyncReference,
    });
  } catch (error) {
    console.error("Distributor dispatch review create error:", error);
    return NextResponse.json({ success: false, message: "Failed to save dispatch review" }, { status: 500 });
  }
}
