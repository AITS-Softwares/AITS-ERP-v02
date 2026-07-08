export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorSyncLog, createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorPaymentUpdate from "@/models/DistributorPaymentUpdate";
import { syncDistributorPaymentUpdateToERPNext } from "@/services/integrations/erpnext/distributorWorkflowService";

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    if (!body.invoiceNumber || !body.paymentMode) {
      return NextResponse.json({ success: false, message: "Invoice number and payment mode are required" }, { status: 400 });
    }

    const record = await DistributorPaymentUpdate.create({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      customerId: session.account.customerId || session.user.customerId || null,
      invoiceNumber: String(body.invoiceNumber).trim(),
      paymentMode: String(body.paymentMode).trim(),
      amount: Number(body.amount || 0),
      reference: String(body.reference || "").trim(),
      notifyAccounts: body.notifyAccounts !== false,
    });

    await createDistributorWorkflowEvent({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      workflowType: "paymentUpdate",
      workflowNumber: record.updateNumber,
      actorType: "distributor",
      actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
      title: "Payment update submitted",
      description: `${record.paymentMode} update shared for invoice ${record.invoiceNumber}.`,
    });

    const syncResult = await syncDistributorPaymentUpdateToERPNext(session, record);
    record.erpSyncStatus = syncResult.status;
    record.erpSyncReference = syncResult.reference || "";
    record.erpSyncMessage = syncResult.message || "";
    await record.save();

    await Promise.all([
      createDistributorWorkflowEvent({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "paymentUpdate",
        workflowNumber: record.updateNumber,
        actorType: "system",
        actorLabel: "ERPNext sync",
        title: `Sync ${syncResult.status}`,
        description: syncResult.message || "Payment update sync processed.",
      }),
      createDistributorSyncLog({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "paymentUpdate",
        workflowNumber: record.updateNumber,
        provider: "ERPNext",
        action: "Create payment update",
        status: syncResult.status,
        reference: syncResult.reference || "",
        message: syncResult.message || "",
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: syncResult.status === "Synced"
        ? `Payment update ${record.updateNumber} submitted and synced to ERPNext.`
        : `Payment update ${record.updateNumber} submitted successfully. ${syncResult.message || ""}`.trim(),
      updateNumber: record.updateNumber,
      erpSyncStatus: record.erpSyncStatus,
      erpSyncReference: record.erpSyncReference,
    });
  } catch (error) {
    console.error("Distributor payment update create error:", error);
    return NextResponse.json({ success: false, message: "Failed to save payment update" }, { status: 500 });
  }
}
