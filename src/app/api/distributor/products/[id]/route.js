export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { getDistributorCatalogueItem } from "@/services/integrations/erpnext/distributorCatalogService";

export async function GET(req, { params }) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    const { id } = await params;
    const product = await getDistributorCatalogueItem(session.companyId, id, session.account?.preferredWarehouse || "");
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (error) { return NextResponse.json({ success: false, message: error.message || "Could not load product" }, { status: 500 }); }
}
