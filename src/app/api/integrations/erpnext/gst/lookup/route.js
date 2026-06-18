export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import IntegrationLog from "@/models/IntegrationLog";
import { getGSTINValidationMessage, normalizeGSTIN } from "@/utils/gstin";
import { lookupGSTIN } from "@/services/integrations/erpnext/gstService";

function userMessage(error) {
  const details = error.details || {};
  const nestedMessage =
    details?.message?.message ||
    details?.message?.exception ||
    details?.exception ||
    details?.error ||
    details?._error_message;

  if (error.code === "CONFIG_MISSING") return "ERPNext integration is not configured.";
  if (error.code === "AUTH_FAILED") return "ERPNext authentication failed.";
  if (error.code === "TIMEOUT" || error.code === "NETWORK_ERROR") return "ERPNext is unavailable. Please try again.";
  if (error.code === "EMPTY_RESPONSE") return "No GST details found for this GSTIN.";
  if (error.status === 429) return "Too many GST lookup requests. Please try again later.";
  if (nestedMessage) return nestedMessage;
  return "GST lookup failed. Please try again.";
}

async function writeLog(entry) {
  try {
    await IntegrationLog.create(entry);
  } catch (error) {
    console.error("GST lookup log failed:", error.message);
  }
}

export async function POST(req) {
  const startedAt = Date.now();
  let user = null;
  let gstin = "";

  try {
    const token = getTokenFromHeader(req);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    user = verifyJWT(token);
    if (!user?.companyId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    gstin = normalizeGSTIN(body.gstin);
    const validationMessage = getGSTINValidationMessage(gstin);
    if (validationMessage) {
      return NextResponse.json({ success: false, message: validationMessage }, { status: 400 });
    }

    await dbConnect();
    const data = await lookupGSTIN(gstin);

    await writeLog({
      companyId: user.companyId,
      userId: user.id,
      integration: "erpnext",
      action: "gst_lookup",
      reference: gstin,
      status: "success",
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GST lookup failed:", error.code || error.status || error.message);

    if (user?.companyId) {
      await dbConnect().catch(() => null);
      await writeLog({
        companyId: user.companyId,
        userId: user.id,
        integration: "erpnext",
        action: "gst_lookup",
        reference: gstin,
        status: "failure",
        durationMs: Date.now() - startedAt,
        errorCode: error.code || String(error.status || "UNKNOWN"),
        message: error.message,
      });
    }

    return NextResponse.json({ success: false, message: userMessage(error) }, { status: error.status || 500 });
  }
}
