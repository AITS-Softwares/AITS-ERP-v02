export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { getDistributorCatalogue } from "@/services/integrations/erpnext/distributorCatalogService";

export async function GET(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    const { searchParams } = new URL(req.url);
    const data = await getDistributorCatalogue(session.companyId, { page: searchParams.get("page"), pageSize: searchParams.get("pageSize"), search: searchParams.get("search") || "", itemGroup: searchParams.get("itemGroup") || "" });
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } });
  } catch (error) { return NextResponse.json({ success: false, message: error.message || "Could not load catalogue" }, { status: 500 }); }
}
