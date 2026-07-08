export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorSyncLog, createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorComplaint from "@/models/DistributorComplaint";
import { syncDistributorComplaintToERPNext } from "@/services/integrations/erpnext/distributorWorkflowService";

function resolveAssignedTeam(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("rate") || normalized.includes("misbill")) return "Accounts";
  if (normalized.includes("qty")) return "Claims";
  return "Claims";
}

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    if (!body.invoiceNumber || !body.complaintType) {
      return NextResponse.json({ success: false, message: "Invoice number and complaint type are required" }, { status: 400 });
    }

    const complaint = await DistributorComplaint.create({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      customerId: session.account.customerId || session.user.customerId || null,
      invoiceNumber: String(body.invoiceNumber).trim(),
      deliveryNoteNumber: String(body.deliveryNoteNumber || "").trim(),
      complaintType: String(body.complaintType).trim(),
      remarks: String(body.remarks || "").trim(),
      attachmentExpected: Boolean(body.attachmentExpected),
      assignedTeam: resolveAssignedTeam(body.complaintType),
      priority: body.priority || "Medium",
    });

    await createDistributorWorkflowEvent({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      workflowType: "complaint",
      workflowNumber: complaint.complaintNumber,
      actorType: "distributor",
      actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
      title: "Complaint submitted",
      description: `${complaint.complaintType} issue raised against invoice ${complaint.invoiceNumber}.`,
    });

    const syncResult = await syncDistributorComplaintToERPNext(session, complaint);
    complaint.erpSyncStatus = syncResult.status;
    complaint.erpSyncReference = syncResult.reference || "";
    complaint.erpSyncMessage = syncResult.message || "";
    await complaint.save();

    await Promise.all([
      createDistributorWorkflowEvent({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "complaint",
        workflowNumber: complaint.complaintNumber,
        actorType: "system",
        actorLabel: "ERPNext sync",
        title: `Sync ${syncResult.status}`,
        description: syncResult.message || "Complaint sync processed.",
      }),
      createDistributorSyncLog({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "complaint",
        workflowNumber: complaint.complaintNumber,
        provider: "ERPNext",
        action: "Create complaint issue",
        status: syncResult.status,
        reference: syncResult.reference || "",
        message: syncResult.message || "",
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: syncResult.status === "Synced"
        ? `Complaint ${complaint.complaintNumber} submitted and synced to ERPNext.`
        : `Complaint ${complaint.complaintNumber} submitted successfully. ${syncResult.message || ""}`.trim(),
      complaintNumber: complaint.complaintNumber,
      erpSyncStatus: complaint.erpSyncStatus,
      erpSyncReference: complaint.erpSyncReference,
    });
  } catch (error) {
    console.error("Distributor complaint create error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit complaint" }, { status: 500 });
  }
}
