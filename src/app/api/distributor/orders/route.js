export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { ERPNextError } from "@/services/integrations/erpnext/erpnextClient";
import { createERPNextDistributorSalesOrder, getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    const liveOrder = await createERPNextDistributorSalesOrder(session, body);
    if (liveOrder?.name) {
      return NextResponse.json({
        success: true,
        message: `Sales Order ${liveOrder.name} created successfully`,
        documentNumberOrder: liveOrder.name,
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
