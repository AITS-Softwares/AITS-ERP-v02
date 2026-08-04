export const runtime = "nodejs";

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { ERPNextError, erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";
import { getERPNextErrorMessage } from "@/services/integrations/erpnext/distributorAppService";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

async function getCompanyUser(req) {
  return getDistributorAdminSession(req);
}

function cleanText(value) {
  return String(value || "").trim();
}

function uniqueValues(values) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

function buildQueryString(options = {}) {
  const params = new URLSearchParams();
  if (options.fields?.length) params.set("fields", JSON.stringify(options.fields));
  if (options.orFilters?.length) params.set("or_filters", JSON.stringify(options.orFilters));
  if (options.limit) params.set("limit_page_length", String(options.limit));
  return params.toString() ? `?${params.toString()}` : "";
}

function mapAccount(account, customerCountMap) {
  return {
    id: String(account._id),
    displayName: account.displayName || "",
    distributorCode: account.distributorCode || "",
    territory: account.territory || "",
    preferredWarehouse: account.preferredWarehouse || "",
    erpCustomerName: account.erpCustomerName || "",
    isActive: account.isActive !== false,
    userCount: customerCountMap.get(String(account._id)) || 0,
  };
}

async function fetchERPNextCandidates(companyId, account) {
  const connection = await resolveERPNextConnection({ companyId });
  if (!connection) {
    return {
      ready: false,
      message: "No active ERPNext connection found.",
      candidates: [],
    };
  }

  let config;
  try {
    config = buildERPNextConfig(connection);
  } catch (error) {
    return {
      ready: false,
      message: error.message || "ERPNext connection details are incomplete.",
      candidates: [],
    };
  }

  const values = uniqueValues([
    account.erpCustomerName,
    account.distributorCode,
    account.displayName,
  ]);

  if (!values.length) {
    return {
      ready: true,
      message: "No matching values available for preview.",
      candidates: [],
    };
  }

  try {
    const payload = await erpnextRequestWithConfig(
      config,
      `/api/resource/Customer${buildQueryString({
        fields: ["name", "customer_name", "customer_group", "territory", "mobile_no"],
        orFilters: values.flatMap((value) => [
          ["Customer", "name", "=", value],
          ["Customer", "customer_name", "=", value],
          ["Customer", "mobile_no", "=", value],
        ]),
        limit: 5,
      })}`,
      { method: "GET" }
    );

    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return {
      ready: true,
      message: rows.length ? "ERPNext candidates found." : "No ERPNext customer matched these values.",
      candidates: rows.map((row) => ({
        name: row.name || "",
        customerName: row.customer_name || "",
        customerGroup: row.customer_group || "",
        territory: row.territory || "",
        mobileNumber: row.mobile_no || "",
      })),
    };
  } catch (error) {
    const normalizedError = error instanceof ERPNextError ? error : new ERPNextError(error.message || "ERPNext preview failed");
    return {
      ready: false,
      message: getERPNextErrorMessage(normalizedError),
      candidates: [],
    };
  }
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const [accounts, userCounts, connection] = await Promise.all([
      DistributorAccount.find({ companyId: user.companyId }).sort({ displayName: 1 }).lean(),
      DistributorAppUser.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(user.companyId) } },
        { $group: { _id: "$distributorAccountId", count: { $sum: 1 } } },
      ]),
      resolveERPNextConnection({ companyId: user.companyId }),
    ]);

    const countMap = new Map(userCounts.map((row) => [String(row._id), row.count]));
    const selectedAccountId = cleanText(req.nextUrl.searchParams.get("accountId"));
    const selectedAccount = selectedAccountId
      ? await DistributorAccount.findOne({ _id: selectedAccountId, companyId: user.companyId })
      : null;
    const preview = selectedAccount ? await fetchERPNextCandidates(user.companyId, selectedAccount) : null;

    return NextResponse.json({
      success: true,
      connection: connection
        ? {
            label: connection.label,
            baseUrl: connection.baseUrl,
            lastTestStatus: connection.lastTestStatus || "",
            lastTestMessage: connection.lastTestMessage || "",
            ready: connection.isActive === true,
          }
        : null,
      accounts: accounts.map((account) => mapAccount(account, countMap)),
      preview,
    });
  } catch (error) {
    console.error("Admin distributor mapping GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load distributor mapping data" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const accountId = cleanText(body.accountId);
    if (!accountId) {
      return NextResponse.json({ success: false, message: "Distributor account is required" }, { status: 400 });
    }

    await dbConnect();

    const account = await DistributorAccount.findOne({ _id: accountId, companyId: user.companyId });
    if (!account) {
      return NextResponse.json({ success: false, message: "Distributor account not found" }, { status: 404 });
    }

    const preview = await fetchERPNextCandidates(user.companyId, account);
    return NextResponse.json({ success: true, preview });
  } catch (error) {
    console.error("Admin distributor mapping POST preview error:", error);
    return NextResponse.json({ success: false, message: "Failed to preview ERPNext customer mapping" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const accountId = cleanText(body.accountId);
    if (!accountId) {
      return NextResponse.json({ success: false, message: "Distributor account is required" }, { status: 400 });
    }

    await dbConnect();

    const update = {
      territory: cleanText(body.territory),
      preferredWarehouse: cleanText(body.preferredWarehouse),
      erpCustomerName: cleanText(body.erpCustomerName),
      isActive: body.isActive !== false,
    };

    const account = await DistributorAccount.findOneAndUpdate(
      { _id: accountId, companyId: user.companyId },
      { $set: update },
      { new: true }
    );

    if (!account) {
      return NextResponse.json({ success: false, message: "Distributor account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Distributor mapping updated successfully",
    });
  } catch (error) {
    console.error("Admin distributor mapping PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update distributor mapping" }, { status: 500 });
  }
}
