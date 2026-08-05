export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getWarehouseSession } from "@/lib/wmsAuth";
import { getWmsDashboardData } from "@/services/integrations/erpnext/wms/masterDataService";

export async function GET(req) {
  try {
    const user = getWarehouseSession(req);
    if (!user) return NextResponse.json({ success: false, message: "Warehouse access is required." }, { status: 401 });
    return NextResponse.json({ success: true, data: await getWmsDashboardData(user.companyId) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to load WMS dashboard." }, { status: 500 });
  }
}

