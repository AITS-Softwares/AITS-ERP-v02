export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { getDistributorStock } from "@/services/integrations/erpnext/distributorStockService";

export async function GET(req) {
  try { const session = await getDistributorSession(req); if (!session) return unauthorizedDistributorResponse(); const params = new URL(req.url).searchParams; const data = await getDistributorStock(session.companyId, { page: params.get("page"), pageSize: params.get("pageSize"), search: params.get("search") || "", warehouse: params.get("warehouse") || "", status: params.get("status") || "" }); return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } }); } catch (error) { return NextResponse.json({ success: false, message: error.message || "Could not load stock" }, { status: 500 }); }
}
