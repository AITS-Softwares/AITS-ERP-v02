export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getWarehouseSession } from "@/lib/wmsAuth";
import ErpNextConnection from "@/models/ErpNextConnection";

function toResponse(connection) {
  return {
    id: String(connection._id),
    label: connection.label,
    baseUrl: connection.baseUrl,
    apiKeyPreview: connection.apiKey ? `${connection.apiKey.slice(0, 6)}...` : "",
    hasApiSecret: Boolean(connection.apiSecret),
    isDefault: connection.isDefault,
    isActive: connection.isActive,
    lastTestedAt: connection.lastTestedAt,
    lastTestStatus: connection.lastTestStatus,
    lastTestMessage: connection.lastTestMessage,
  };
}

function unauthorized() {
  return NextResponse.json({ success: false, message: "Warehouse Manager or System Manager access is required." }, { status: 401 });
}

export async function GET(req) {
  try {
    const user = getWarehouseSession(req, { manage: true });
    if (!user) return unauthorized();
    await dbConnect();
    const connection = await ErpNextConnection.findOne({ companyId: user.companyId, isActive: true }).sort({ isDefault: -1, updatedAt: -1 });
    return NextResponse.json({ success: true, connection: connection ? toResponse(connection) : null });
  } catch (error) {
    console.error("WMS connection GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to load the ERPNext connection." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getWarehouseSession(req, { manage: true });
    if (!user) return unauthorized();
    const body = await req.json().catch(() => ({}));
    const label = String(body.label || "Primary ERPNext").trim();
    const baseUrl = String(body.baseUrl || "").trim();
    const apiKey = String(body.apiKey || "").trim();
    const apiSecret = String(body.apiSecret || "").trim();
    if (!baseUrl) return NextResponse.json({ success: false, message: "ERPNext site URL is required." }, { status: 400 });

    await dbConnect();
    let connection = await ErpNextConnection.findOne({ companyId: user.companyId, isActive: true }).sort({ isDefault: -1, updatedAt: -1 });
    if (!connection) {
      if (!apiKey || !apiSecret) return NextResponse.json({ success: false, message: "API key and API secret are required for the first connection." }, { status: 400 });
      connection = new ErpNextConnection({ companyId: user.companyId, label, baseUrl, apiKey, apiSecret, isDefault: true, isActive: true });
    } else {
      connection.label = label;
      connection.baseUrl = baseUrl;
      connection.isDefault = true;
      connection.isActive = true;
      if (apiKey) connection.apiKey = apiKey;
      if (apiSecret) connection.apiSecret = apiSecret;
    }
    await ErpNextConnection.updateMany({ companyId: user.companyId, _id: { $ne: connection._id } }, { $set: { isDefault: false } });
    await connection.save();
    return NextResponse.json({ success: true, message: "Shared ERPNext connection saved for Distributor and WMS.", connection: toResponse(connection) });
  } catch (error) {
    console.error("WMS connection POST error:", error);
    return NextResponse.json({ success: false, message: "Unable to save the ERPNext connection." }, { status: 500 });
  }
}

