export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

const doctypes = ["Customer", "Item", "Item Group", "Pricing Rule", "Sales Order"];
const fields = ["name", "fieldname", "label", "fieldtype", "options", "read_only", "reqd", "hidden"];

function endpoint(doctype, filters) {
  const params = new URLSearchParams({ fields: JSON.stringify(fields), filters: JSON.stringify(filters), limit_page_length: "500" });
  return `/api/resource/${encodeURIComponent(doctype)}?${params.toString()}`;
}

function normalize(rows, source) {
  return (Array.isArray(rows) ? rows : []).map((field) => ({
    fieldname: String(field.fieldname || field.name || "").trim(),
    label: String(field.label || field.fieldname || field.name || "").trim(),
    fieldtype: String(field.fieldtype || "").trim(),
    options: String(field.options || "").trim(),
    required: field.reqd === 1 || field.reqd === true,
    readOnly: field.read_only === 1 || field.read_only === true,
    hidden: field.hidden === 1 || field.hidden === true,
    source,
  })).filter((field) => field.fieldname);
}

export async function GET(req) {
  try {
    const user = getDistributorAdminSession(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const connection = await resolveERPNextConnection({ companyId: user.companyId });
    if (!connection) return NextResponse.json({ success: false, message: "Configure an active ERPNext connection before discovering fields." }, { status: 400 });
    const config = buildERPNextConfig(connection);

    const result = await Promise.all(doctypes.map(async (doctype) => {
      const [standardResult, customResult] = await Promise.allSettled([
        erpnextRequestWithConfig(config, endpoint("DocField", [["DocField", "parent", "=", doctype]]), { method: "GET" }),
        erpnextRequestWithConfig(config, endpoint("Custom Field", [["Custom Field", "dt", "=", doctype]]), { method: "GET" }),
      ]);
      const standard = standardResult.status === "fulfilled" ? normalize(standardResult.value?.data, "Standard") : [];
      const custom = customResult.status === "fulfilled" ? normalize(customResult.value?.data, "Custom") : [];
      const warning = standardResult.status === "rejected" && customResult.status === "rejected"
        ? "ERPNext did not permit DocField/Custom Field metadata access for this doctype."
        : "";
      return { doctype, fields: [...standard, ...custom].sort((a, b) => a.label.localeCompare(b.label)), warning };
    }));

    return NextResponse.json({ success: true, connection: { label: connection.label, baseUrl: connection.baseUrl }, doctypes: result });
  } catch (error) {
    console.error("Distributor data-contract discovery error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to inspect ERPNext fields" }, { status: 500 });
  }
}
