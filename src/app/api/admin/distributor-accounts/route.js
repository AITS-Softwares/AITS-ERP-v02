export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import DistributorAccount from "@/models/DistributorAccount";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { ERPNextError, erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";
import { getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

async function getCompanyUser(req) {
  return getDistributorAdminSession(req);
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeCode(value = "") {
  return cleanText(value).toUpperCase();
}

function buildQueryString(options = {}) {
  const params = new URLSearchParams();
  if (options.fields?.length) params.set("fields", JSON.stringify(options.fields));
  if (options.orFilters?.length) params.set("or_filters", JSON.stringify(options.orFilters));
  if (Number.isFinite(options.limit)) params.set("limit_page_length", String(options.limit));
  return params.toString() ? `?${params.toString()}` : "";
}

function mapAccount(account) {
  return {
    id: String(account._id),
    displayName: account.displayName || "",
    distributorCode: account.distributorCode || "",
    territory: account.territory || "",
    preferredWarehouse: account.preferredWarehouse || "",
    erpCustomerName: account.erpCustomerName || "",
    isActive: account.isActive !== false,
  };
}

async function searchERPNextCustomers(companyId, search) {
  const connection = await resolveERPNextConnection({ companyId });
  if (!connection) {
    return { ready: false, message: "No active ERPNext connection found.", customers: [] };
  }

  let config;
  try {
    config = buildERPNextConfig(connection);
  } catch (error) {
    return { ready: false, message: error.message || "ERPNext connection details are incomplete.", customers: [] };
  }

  const term = cleanText(search);
  if (!term) {
    return { ready: true, message: "Search ERPNext customers by code, name, or mobile number.", customers: [] };
  }

  try {
    const payload = await erpnextRequestWithConfig(
      config,
      `/api/resource/Customer${buildQueryString({
        fields: ["name", "customer_name", "territory", "mobile_no", "customer_group"],
        orFilters: [
          ["Customer", "name", "like", `%${term}%`],
          ["Customer", "customer_name", "like", `%${term}%`],
          ["Customer", "mobile_no", "like", `%${term}%`],
        ],
        limit: 20,
      })}`,
      { method: "GET" }
    );

    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return {
      ready: true,
      message: rows.length ? "ERPNext customers found." : "No ERPNext customers matched this search.",
      customers: rows.map((row) => ({
        code: row.name || "",
        name: row.customer_name || row.name || "",
        territory: row.territory || "",
        mobileNumber: row.mobile_no || "",
        customerGroup: row.customer_group || "",
      })),
    };
  } catch (error) {
    const normalizedError = error instanceof ERPNextError ? error : new ERPNextError(error.message || "ERPNext customer search failed");
    return {
      ready: false,
      message: getERPNextErrorMessage(normalizedError),
      customers: [],
    };
  }
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const search = cleanText(req.nextUrl.searchParams.get("search"));

    const [accounts, erpnext] = await Promise.all([
      DistributorAccount.find({ companyId: user.companyId }).sort({ displayName: 1 }).lean(),
      searchERPNextCustomers(user.companyId, search),
    ]);

    return NextResponse.json({
      success: true,
      accounts: accounts.map(mapAccount),
      erpnext,
    });
  } catch (error) {
    console.error("Distributor accounts GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load distributor accounts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const displayName = cleanText(body.displayName);
    const distributorCode = normalizeCode(body.distributorCode);

    if (!displayName || !distributorCode) {
      return NextResponse.json({ success: false, message: "Display name and distributor code are required" }, { status: 400 });
    }

    await dbConnect();

    const existing = await DistributorAccount.findOne({
      companyId: user.companyId,
      distributorCode,
    }).lean();

    if (existing) {
      return NextResponse.json({ success: false, message: "Distributor code already exists" }, { status: 400 });
    }

    const account = await DistributorAccount.create({
      companyId: user.companyId,
      displayName,
      distributorCode,
      territory: cleanText(body.territory),
      preferredWarehouse: cleanText(body.preferredWarehouse),
      erpCustomerName: cleanText(body.erpCustomerName),
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      success: true,
      message: "Distributor account created successfully",
      account: {
        id: String(account._id),
        displayName: account.displayName,
        distributorCode: account.distributorCode,
      },
    });
  } catch (error) {
    console.error("Distributor accounts POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to create distributor account" }, { status: 500 });
  }
}
