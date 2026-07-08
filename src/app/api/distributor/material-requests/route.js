export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorSyncLog, createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorMaterialRequest from "@/models/DistributorMaterialRequest";
import { syncDistributorMaterialRequestToERPNext } from "@/services/integrations/erpnext/distributorWorkflowService";

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    if (!body.itemCode || !body.quantity) {
      return NextResponse.json({ success: false, message: "Item code and quantity are required" }, { status: 400 });
    }

    const record = await DistributorMaterialRequest.create({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      customerId: session.account.customerId || session.user.customerId || null,
      itemCode: String(body.itemCode).trim(),
      itemName: String(body.itemName || "").trim(),
      quantity: Number(body.quantity),
      scheduleDate: body.scheduleDate ? new Date(body.scheduleDate) : null,
      warehouseCode: String(body.warehouseCode || "").trim(),
      purpose: String(body.purpose || "").trim(),
      remarks: String(body.remarks || "").trim(),
      notifySales: body.notifySales !== false,
    });

    await createDistributorWorkflowEvent({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      workflowType: "materialRequest",
      workflowNumber: record.requestNumber,
      actorType: "distributor",
      actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
      title: "Material request submitted",
      description: `${record.itemCode} requested for ${record.quantity} qty.`,
    });

    const syncResult = await syncDistributorMaterialRequestToERPNext(session, record);
    record.erpSyncStatus = syncResult.status;
    record.erpSyncReference = syncResult.reference || "";
    record.erpSyncMessage = syncResult.message || "";
    await record.save();

    await Promise.all([
      createDistributorWorkflowEvent({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "materialRequest",
        workflowNumber: record.requestNumber,
        actorType: "system",
        actorLabel: "ERPNext sync",
        title: `Sync ${syncResult.status}`,
        description: syncResult.message || "Material request sync processed.",
      }),
      createDistributorSyncLog({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "materialRequest",
        workflowNumber: record.requestNumber,
        provider: "ERPNext",
        action: "Create material request",
        status: syncResult.status,
        reference: syncResult.reference || "",
        message: syncResult.message || "",
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: syncResult.status === "Synced"
        ? `Material Request ${record.requestNumber} submitted and synced to ERPNext.`
        : `Material Request ${record.requestNumber} submitted successfully. ${syncResult.message || ""}`.trim(),
      requestNumber: record.requestNumber,
      erpSyncStatus: record.erpSyncStatus,
      erpSyncReference: record.erpSyncReference,
    });
  } catch (error) {
    console.error("Distributor material request create error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit material request" }, { status: 500 });
  }
}
