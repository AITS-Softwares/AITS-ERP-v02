export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { getDistributorCatalogue } from "@/services/integrations/erpnext/distributorCatalogService";

export async function GET(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    const { searchParams } = new URL(req.url);
    const catalogue = await getDistributorCatalogue(session.companyId, { page: searchParams.get("page") || 1, pageSize: Math.min(Number(searchParams.get("pageSize")) || 10, 10), search: searchParams.get("search") || "", itemGroup: searchParams.get("itemGroup") || "", salesOnly: true });
    // Rates are intentionally omitted here. A single-item qty=1 lookup cannot represent
    // cart-level Pricing Rules; the pricing preview endpoint calculates the full basket.
    const items = catalogue.items.map((item) => ({ ...item, rate: null }));
    return NextResponse.json({ success: true, data: { ...catalogue, items } }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) { return NextResponse.json({ success: false, message: error.message || "Could not load order items" }, { status: 500 }); }
}
