export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import { ERPNextError } from "@/services/integrations/erpnext/erpnextClient";
import { createERPNextDistributorSalesOrder, getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    const liveOrder = await createERPNextDistributorSalesOrder(session, body);
    if (liveOrder?.name) {
      const itemCount = Array.isArray(liveOrder.items) ? liveOrder.items.length : 0;
      const workflowState = liveOrder.workflow_state || liveOrder.status || "Created";

      await createDistributorWorkflowEvent({
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        distributorUserId: session.user._id,
        workflowType: "salesOrder",
        workflowNumber: liveOrder.name,
        actorType: "distributor",
        actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
        title: "Sales Order created",
        description: `${itemCount} item(s) submitted to ERPNext. Status: ${workflowState}.`,
        meta: { workflowState, itemCount },
      });

      return NextResponse.json({
        success: true,
        message: `Sales Order ${liveOrder.name} created successfully`,
        documentNumberOrder: liveOrder.name,
        workflowState,
      });
    }

    return NextResponse.json(
      { success: false, message: "ERPNext distributor customer mapping is required before order creation" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ERPNextError) {
      return NextResponse.json({ success: false, message: getERPNextErrorMessage(error) }, { status: error.status || 502 });
    }

    console.error("Distributor Sales Order create error:", error);
    return NextResponse.json({ success: false, message: "Failed to create Sales Order" }, { status: 500 });
  }
}
