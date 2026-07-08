export const runtime = "nodejs";

import { Parser } from "json2csv";
import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { buildDistributorConnectedAppData } from "@/services/integrations/erpnext/distributorAppService";

export async function GET(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const data = await buildDistributorConnectedAppData(session).catch(() => ({ ledgerEntries: [] }));

    const rows = (data.ledgerEntries || []).map((entry) => ({
      Date: entry.date || "-",
      Reference: entry.ref || "-",
      Type: entry.type || "-",
      Amount: entry.amount || "-",
      Balance: entry.balance || "-",
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);
    const fileName = `distributor-statement-${session.account.distributorCode || "account"}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error("Distributor finance statement export error:", error);
    return NextResponse.json({ success: false, message: "Failed to export finance statement" }, { status: 500 });
  }
}
