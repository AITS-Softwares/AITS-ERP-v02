export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import ErpNextConnection from "@/models/ErpNextConnection";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

function toConnectionResponse(connection) {
  return {
    id: connection._id,
    label: connection.label,
    baseUrl: connection.baseUrl,
    apiKeyPreview: connection.apiKey ? `${connection.apiKey.slice(0, 6)}...` : "",
    hasApiSecret: Boolean(connection.apiSecret),
    isDefault: connection.isDefault,
    isActive: connection.isActive,
    lastTestedAt: connection.lastTestedAt,
    lastTestStatus: connection.lastTestStatus,
    lastTestMessage: connection.lastTestMessage,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
  };
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

    const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";
    const query = { companyId: user.companyId };
    if (!includeInactive) {
      query.isActive = true;
    }

    const connections = await ErpNextConnection.find(query).sort({ isDefault: -1, updatedAt: -1 });

    return NextResponse.json({
      success: true,
      connections: connections.map(toConnectionResponse),
    });
  } catch (error) {
    console.error("ERPNext connections GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch ERPNext connections" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const id = body.id || null;
    const label = String(body.label || "").trim();
    const baseUrl = String(body.baseUrl || "").trim();
    const apiKey = String(body.apiKey || "").trim();
    const apiSecret = String(body.apiSecret || "").trim();
    const requestedDefault = body.isDefault === true;
    const isActive = body.isActive !== false;

    if (!label || !baseUrl) {
      return NextResponse.json({ success: false, message: "Label and base URL are required" }, { status: 400 });
    }

    await dbConnect();

    let connection = id
      ? await ErpNextConnection.findOne({ _id: id, companyId: user.companyId })
      : null;

    if (id && !connection) {
      return NextResponse.json({ success: false, message: "ERPNext connection not found" }, { status: 404 });
    }

    const hasDefaultConnection = await ErpNextConnection.exists({
      companyId: user.companyId,
      isDefault: true,
      ...(id ? { _id: { $ne: id } } : {}),
    });
    const isDefault = requestedDefault || !hasDefaultConnection;

    if (!connection) {
      if (!apiKey || !apiSecret) {
        return NextResponse.json({ success: false, message: "API key and API secret are required for a new connection" }, { status: 400 });
      }

      connection = new ErpNextConnection({
        companyId: user.companyId,
        label,
        baseUrl,
        apiKey,
        apiSecret,
        isDefault,
        isActive,
      });
    } else {
      connection.label = label;
      connection.baseUrl = baseUrl;
      connection.isDefault = isDefault;
      connection.isActive = isActive;
      if (apiKey) connection.apiKey = apiKey;
      if (apiSecret) connection.apiSecret = apiSecret;
    }

    if (isDefault) {
      await ErpNextConnection.updateMany(
        { companyId: user.companyId, _id: { $ne: connection._id } },
        { $set: { isDefault: false } }
      );
    }

    await connection.save();

    return NextResponse.json({
      success: true,
      connection: toConnectionResponse(connection),
    });
  } catch (error) {
    console.error("ERPNext connections POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to save ERPNext connection" }, { status: 500 });
  }
}
