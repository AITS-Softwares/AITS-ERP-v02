export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { unauthorizedDistributorResponse, getDistributorSession } from "@/lib/distributorSession";
import { buildDistributorConnectedAppData, getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";

export async function GET(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const data = await buildDistributorConnectedAppData(session).catch((error) => {
      console.error("Distributor ERPNext bridge error:", error);
      return {
        profile: {
          name: session.account?.displayName || "",
          code: session.account?.distributorCode || "",
          phone: session.user?.mobileNumber || session.user?.emailAddress || "",
          route: session.account?.territory || "",
          userRole: session.user?.role || "",
          preferredWarehouse: session.account?.preferredWarehouse || "",
        },
        categories: [],
        products: [],
        stockItems: [],
        orders: [],
        invoices: [],
        dispatches: [],
        creditNotes: [],
        financeSummary: [],
        ledgerEntries: [],
        dashboardStats: [],
        notifications: [],
        offers: [],
        complaints: [],
        materialRequests: [],
        paymentUpdates: [],
        dispatchReviews: [],
        teamMembers: [],
        savedAddresses: [],
        source: {
          mode: "erpnext-error",
          label: getERPNextErrorMessage(error),
        },
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Distributor app data error:", error);
    return NextResponse.json({ success: false, message: "Failed to load distributor app data" }, { status: 500 });
  }
}
