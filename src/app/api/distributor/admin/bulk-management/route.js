export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import DistributorWorkflowEvent from "@/models/DistributorWorkflowEvent";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

const roles = new Set(["Owner", "Sales operator", "Accounts viewer", "Read only"]);
const text = (value) => String(value || "").trim();
const code = (value) => text(value).toUpperCase();
const mobile = (value) => String(value || "").replace(/\D/g, "").slice(-10);
const bool = (value, fallback = true) => value === undefined || value === "" ? fallback : [true, "true", "1", 1, "yes"].includes(typeof value === "string" ? value.toLowerCase() : value);
const role = (value) => ({ owner: "Owner", "sales operator": "Sales operator", "accounts viewer": "Accounts viewer", "read only": "Read only" }[text(value).toLowerCase()] || text(value));

function serialize(account, users) { return { id: String(account._id), displayName: account.displayName, distributorCode: account.distributorCode, erpCustomerName: account.erpCustomerName || "", territory: account.territory || "", preferredWarehouse: account.preferredWarehouse || "", isActive: account.isActive !== false, mappingHealth: account.erpCustomerName ? "Needs ERP verification" : "Missing mapping", users: users.filter((user) => String(user.distributorAccountId) === String(account._id)).map((user) => ({ id: String(user._id), fullName: user.fullName, mobileNumber: user.mobileNumber, emailAddress: user.emailAddress || "", role: user.role, isActive: user.isActive !== false, loginEnabled: user.loginEnabled !== false })) }; }

async function records(companyId) { const [accounts, users] = await Promise.all([DistributorAccount.find({ companyId }).sort({ displayName: 1 }).lean(), DistributorAppUser.find({ companyId }).sort({ fullName: 1 }).lean()]); return { accounts, users }; }

async function verifyMappings(companyId, accounts) { const connection = await resolveERPNextConnection({ companyId }); if (!connection) throw new Error("Configure an active ERPNext connection before validating mappings"); const config = buildERPNextConfig(connection); const checks = await Promise.all(accounts.map(async (account) => { const candidate = text(account.erpCustomerName); if (!candidate) return [String(account._id), "Missing mapping"]; const params = new URLSearchParams({ fields: JSON.stringify(["name"]), or_filters: JSON.stringify([["Customer", "name", "=", candidate], ["Customer", "customer_name", "=", candidate]]), limit_page_length: "1" }); const response = await erpnextRequestWithConfig(config, `/api/resource/Customer?${params}`, { method: "GET" }); return [String(account._id), Array.isArray(response?.data) && response.data.length ? "Valid" : "ERP customer not found"]; })); return Object.fromEntries(checks); }

function validateRows(rows, existingCodes) { const seen = new Set(); return rows.map((raw, index) => { const row = { displayName: text(raw.displayName || raw.distributorName), distributorCode: code(raw.distributorCode), erpCustomerName: text(raw.erpCustomerName), territory: text(raw.territory), preferredWarehouse: text(raw.preferredWarehouse), fullName: text(raw.fullName || raw.ownerName), mobileNumber: mobile(raw.mobileNumber || raw.mobile), emailAddress: text(raw.emailAddress || raw.email).toLowerCase(), role: role(raw.role) || "Read only", loginEnabled: bool(raw.loginEnabled), isActive: bool(raw.isActive) }; const errors = []; if (!row.displayName) errors.push("Distributor name is required"); if (!row.distributorCode) errors.push("Distributor code is required"); if (seen.has(row.distributorCode)) errors.push("Duplicate distributor code in upload"); seen.add(row.distributorCode); if (row.mobileNumber && row.mobileNumber.length !== 10) errors.push("Mobile number must contain 10 digits"); if (row.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.emailAddress)) errors.push("Email is invalid"); if (!roles.has(row.role)) errors.push("Role must be Owner, Sales operator, Accounts viewer, or Read only"); return { rowNumber: index + 2, data: row, errors, action: existingCodes.has(row.distributorCode) ? "Update account" : "Create account" }; }); }

export async function GET(req) {
  const user = getDistributorAdminSession(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  await dbConnect(); const { accounts, users } = await records(user.companyId);
  if (new URL(req.url).searchParams.get("export") === "csv") { const header = "distributorCode,displayName,erpCustomerName,territory,preferredWarehouse,fullName,mobileNumber,emailAddress,role,loginEnabled,isActive"; const lines = accounts.flatMap((account) => { const linked = users.filter((item) => String(item.distributorAccountId) === String(account._id)); const rows = linked.length ? linked : [{}]; return rows.map((item) => [account.distributorCode, account.displayName, account.erpCustomerName || "", account.territory || "", account.preferredWarehouse || "", item.fullName || "", item.mobileNumber || "", item.emailAddress || "", item.role || "", item.loginEnabled !== false, item.isActive !== false].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")); }); return new NextResponse([header, ...lines].join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=distributor-management.csv" } }); }
  return NextResponse.json({ success: true, records: accounts.map((account) => serialize(account, users)) });
}

export async function POST(req) {
  try {
    const user = getDistributorAdminSession(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({})); const rows = Array.isArray(body.rows) ? body.rows : [];
    await dbConnect(); const { accounts } = await records(user.companyId);
    if (body.mode === "validate") return NextResponse.json({ success: true, health: await verifyMappings(user.companyId, accounts) });
    if (!rows.length) return NextResponse.json({ success: false, message: "Upload contains no rows" }, { status: 400 });
    const validated = validateRows(rows, new Set(accounts.map((item) => item.distributorCode)));
    if (body.mode === "preview") return NextResponse.json({ success: true, rows: validated, validCount: validated.filter((item) => !item.errors.length).length });
    const invalid = validated.filter((item) => item.errors.length); if (invalid.length) return NextResponse.json({ success: false, message: "Fix validation errors before importing", rows: validated }, { status: 400 });
    let accountsCreated = 0, accountsUpdated = 0, usersCreated = 0, usersUpdated = 0;
    for (const { data } of validated) { let account = await DistributorAccount.findOne({ companyId: user.companyId, distributorCode: data.distributorCode }); const accountData = { displayName: data.displayName, erpCustomerName: data.erpCustomerName, territory: data.territory, preferredWarehouse: data.preferredWarehouse, isActive: data.isActive }; if (account) { await account.updateOne({ $set: accountData }); accountsUpdated += 1; } else { account = await DistributorAccount.create({ companyId: user.companyId, distributorCode: data.distributorCode, ...accountData }); accountsCreated += 1; } if (data.mobileNumber) { const existingUser = await DistributorAppUser.findOne({ distributorAccountId: account._id, mobileNumber: data.mobileNumber }); const userData = { companyId: user.companyId, distributorAccountId: account._id, fullName: data.fullName || data.displayName, emailAddress: data.emailAddress, role: data.role, loginEnabled: data.loginEnabled, isActive: data.isActive }; if (existingUser) { await existingUser.updateOne({ $set: userData }); usersUpdated += 1; } else { await DistributorAppUser.create({ ...userData, mobileNumber: data.mobileNumber }); usersCreated += 1; } } }
    return NextResponse.json({ success: true, message: `Import complete: ${accountsCreated} accounts created, ${accountsUpdated} updated, ${usersCreated} users created, ${usersUpdated} updated.` });
  } catch (error) { return NextResponse.json({ success: false, message: error.message || "Bulk import failed" }, { status: 500 }); }
}

export async function PATCH(req) {
  try {
    const user = getDistributorAdminSession(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { action, accountIds = [], userIds = [] } = await req.json().catch(() => ({}));
    await dbConnect();
    if (!Array.isArray(accountIds) || !Array.isArray(userIds)) throw new Error("Invalid selection");
    if (action === "archive") {
      await Promise.all([
        DistributorAccount.updateMany({ _id: { $in: accountIds }, companyId: user.companyId }, { $set: { isActive: false } }),
        DistributorAppUser.updateMany({ $or: [{ _id: { $in: userIds } }, { distributorAccountId: { $in: accountIds } }], companyId: user.companyId }, { $set: { isActive: false, loginEnabled: false } }),
      ]);
      return NextResponse.json({ success: true, message: "Selected records archived; login is disabled." });
    }
    if (action === "delete") {
      const linkedEvents = await DistributorWorkflowEvent.countDocuments({ companyId: user.companyId, $or: [{ distributorAccountId: { $in: accountIds } }, { distributorUserId: { $in: userIds } }] });
      if (linkedEvents) return NextResponse.json({ success: false, message: "Permanent deletion is blocked because selected records have workflow history. Archive them instead." }, { status: 409 });
      await DistributorAppUser.deleteMany({ companyId: user.companyId, $or: [{ _id: { $in: userIds } }, { distributorAccountId: { $in: accountIds } }] });
      await DistributorAccount.deleteMany({ companyId: user.companyId, _id: { $in: accountIds } });
      return NextResponse.json({ success: true, message: "Selected records permanently deleted." });
    }
    throw new Error("Unsupported action");
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Bulk action failed" }, { status: 500 });
  }
}
