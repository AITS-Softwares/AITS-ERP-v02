export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorSyncLog, createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorComplaint from "@/models/DistributorComplaint";
import DistributorDispatchReview from "@/models/DistributorDispatchReview";
import DistributorMaterialRequest from "@/models/DistributorMaterialRequest";
import DistributorPaymentUpdate from "@/models/DistributorPaymentUpdate";
import {
  syncDistributorComplaintToERPNext,
  syncDistributorDispatchReviewToERPNext,
  syncDistributorMaterialRequestToERPNext,
  syncDistributorPaymentUpdateToERPNext,
} from "@/services/integrations/erpnext/distributorWorkflowService";

const workflowConfig = {
  complaint: {
    model: DistributorComplaint,
    numberField: "complaintNumber",
    label: "Complaint",
    sync: syncDistributorComplaintToERPNext,
  },
  materialRequest: {
    model: DistributorMaterialRequest,
    numberField: "requestNumber",
    label: "Material Request",
    sync: syncDistributorMaterialRequestToERPNext,
  },
  paymentUpdate: {
    model: DistributorPaymentUpdate,
    numberField: "updateNumber",
    label: "Payment update",
    sync: syncDistributorPaymentUpdateToERPNext,
  },
  dispatchReview: {
    model: DistributorDispatchReview,
    numberField: "reviewNumber",
    label: "Dispatch review",
    sync: syncDistributorDispatchReviewToERPNext,
  },
};

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    const type = String(body.type || "").trim();
    const number = String(body.number || "").trim();
    const config = workflowConfig[type];

    if (!config || !number) {
      return NextResponse.json({ success: false, message: "Valid workflow type and document number are required" }, { status: 400 });
    }

    const record = await config.model.findOne({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      [config.numberField]: number,
    });

    if (!record) {
      return NextResponse.json({ success: false, message: `${config.label} not found` }, { status: 404 });
    }

    await createDistributorWorkflowEvent({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      workflowType: type,
      workflowNumber: number,
      actorType: "distributor",
      actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
      title: "Sync retry requested",
      description: `Retry sent for ${config.label.toLowerCase()} ${number}.`,
    });

    const syncResult = await config.sync(session, record);
    record.erpSyncStatus = syncResult.status;
    record.erpSyncReference = syncResult.reference || "";
    record.erpSyncMessage = syncResult.message || "";
    await record.save();

    await Promise.all([
      createDistributorWorkflowEvent({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: type,
        workflowNumber: number,
        actorType: "system",
        actorLabel: "ERPNext sync",
        title: `Retry ${syncResult.status}`,
        description: syncResult.message || "Retry sync processed.",
      }),
      createDistributorSyncLog({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: type,
        workflowNumber: number,
        provider: "ERPNext",
        action: `Retry ${config.label}`,
        status: syncResult.status,
        reference: syncResult.reference || "",
        message: syncResult.message || "",
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: syncResult.status === "Synced"
        ? `${config.label} ${number} synced successfully.`
        : `${config.label} ${number} saved with status ${syncResult.status}. ${syncResult.message || ""}`.trim(),
      erpSyncStatus: record.erpSyncStatus,
      erpSyncReference: record.erpSyncReference,
    });
  } catch (error) {
    console.error("Distributor workflow retry error:", error);
    return NextResponse.json({ success: false, message: "Failed to retry ERPNext sync" }, { status: 500 });
  }
}
