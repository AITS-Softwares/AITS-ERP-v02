export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import DistributorSyncLog from "@/models/DistributorSyncLog";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

async function getCompanyUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  const user = verifyJWT(token);
  if (!user?.companyId) return null;
  return user;
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const logs = await DistributorSyncLog.find({ companyId: user.companyId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      summary: {
        total: logs.length,
        synced: logs.filter((log) => log.status === "Synced").length,
        failed: logs.filter((log) => log.status === "Failed").length,
        pending: logs.filter((log) => log.status === "Pending").length,
        notConfigured: logs.filter((log) => log.status === "Not Configured").length,
      },
      logs: logs.map((log) => ({
        id: String(log._id),
        workflowType: log.workflowType || "-",
        workflowNumber: log.workflowNumber || "-",
        provider: log.provider || "ERPNext",
        action: log.action || "-",
        status: log.status || "Pending",
        reference: log.reference || "",
        message: log.message || "",
        createdAt: formatDate(log.createdAt),
      })),
    });
  } catch (error) {
    console.error("Admin distributor sync logs GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load distributor sync logs" }, { status: 500 });
  }
}
