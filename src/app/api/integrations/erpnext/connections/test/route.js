export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import ErpNextConnection from "@/models/ErpNextConnection";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { ERPNextError, erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

function userMessage(error) {
  if (error.code === "CONFIG_MISSING") return "ERPNext connection details are incomplete.";
  if (error.code === "AUTH_FAILED") return "ERPNext authentication failed.";
  if (error.code === "TIMEOUT") return "ERPNext did not respond in time.";
  if (error.code === "NETWORK_ERROR") return "ERPNext could not be reached.";
  return error.message || "ERPNext connection test failed.";
}

async function updateTestStatus(connectionId, companyId, status, message) {
  if (!connectionId || !companyId) return;

  await ErpNextConnection.findOneAndUpdate(
    { _id: connectionId, companyId },
    {
      $set: {
        lastTestedAt: new Date(),
        lastTestStatus: status,
        lastTestMessage: message,
      },
    }
  ).catch(() => null);
}

export async function POST(req) {
  let user = null;
  let savedConnectionId = null;

  try {
    user = getDistributorAdminSession(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));

    await dbConnect();

    let config;
    if (body.connectionId) {
      const savedConnection = await resolveERPNextConnection({
        companyId: user.companyId,
        connectionId: body.connectionId,
      });

      if (!savedConnection) {
        return NextResponse.json({ success: false, message: "ERPNext connection not found" }, { status: 404 });
      }

      savedConnectionId = String(savedConnection._id);
      config = buildERPNextConfig(savedConnection);
    } else {
      config = buildERPNextConfig({
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
      });
    }

    const response = await erpnextRequestWithConfig(
      config,
      "/api/method/frappe.auth.get_logged_user",
      { method: "GET" }
    );

    const loggedUser = response?.message || "";
    await updateTestStatus(savedConnectionId, user.companyId, "success", loggedUser || "Connection verified");

    return NextResponse.json({
      success: true,
      message: "ERPNext connection verified successfully",
      loggedUser,
    });
  } catch (error) {
    const normalizedError = error instanceof ERPNextError
      ? error
      : new ERPNextError(error.message || "ERPNext connection test failed", { code: error.code });

    await updateTestStatus(savedConnectionId, user?.companyId, "failure", userMessage(normalizedError));

    return NextResponse.json(
      { success: false, message: userMessage(normalizedError) },
      { status: normalizedError.status || 500 }
    );
  }
}
