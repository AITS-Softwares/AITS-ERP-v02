export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { ERPNextError } from "@/services/integrations/erpnext/erpnextClient";
import { getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";
import { previewERPNextDistributorPricing } from "@/services/integrations/erpnext/distributorPricingService";

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const body = await req.json().catch(() => ({}));
    const preview = await previewERPNextDistributorPricing(session, body);
    return NextResponse.json({ success: true, data: preview }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const status = error instanceof ERPNextError ? (error.status || 502) : 500;
    const message = error instanceof ERPNextError ? getERPNextErrorMessage(error) : (error.message || "Could not calculate ERPNext pricing");
    return NextResponse.json({ success: false, message }, { status });
  }
}
