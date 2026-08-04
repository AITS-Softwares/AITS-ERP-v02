import dbConnect from "@/lib/db";
import DistributorStockBin from "@/models/DistributorStockBin";
import DistributorStockState from "@/models/DistributorStockState";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

const TTL = 10 * 60 * 1000;
const PAGE_SIZE = 500;
const value = (input) => Number.isFinite(Number(input)) ? Number(input) : 0;
function statusFor(actual, projected) { return projected <= 0 ? "Low" : projected <= actual * 0.25 ? "Watch" : "Healthy"; }
function escapeRegex(input) { return String(input || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

async function listBins(config, start) {
  const params = new URLSearchParams({ fields: JSON.stringify(["item_code", "warehouse", "actual_qty", "reserved_qty", "projected_qty"]), limit_page_length: String(PAGE_SIZE), limit_start: String(start), order_by: "item_code asc" });
  const response = await erpnextRequestWithConfig(config, `/api/resource/Bin?${params}`, { method: "GET" });
  return Array.isArray(response?.data) ? response.data : [];
}

async function sync(companyId) {
  const connection = await resolveERPNextConnection({ companyId });
  if (!connection) throw new Error("ERPNext connection is not configured");
  const config = buildERPNextConfig(connection), syncedAt = new Date();
  await DistributorStockState.findOneAndUpdate({ companyId }, { $set: { status: "syncing", lastError: "" } }, { upsert: true });
  try {
    let start = 0, records = [];
    while (true) { const page = await listBins(config, start); records.push(...page); if (page.length < PAGE_SIZE) break; start += page.length; }
    const mapped = records.filter((row) => row.item_code && row.warehouse).map((row) => { const actualQty = value(row.actual_qty), reservedQty = value(row.reserved_qty), projectedQty = value(row.projected_qty); return { itemCode: String(row.item_code), warehouseCode: String(row.warehouse), actualQty, reservedQty, projectedQty, availableQty: actualQty - reservedQty, status: statusFor(actualQty, projectedQty), syncedAt }; });
    for (let index = 0; index < mapped.length; index += 500) await DistributorStockBin.bulkWrite(mapped.slice(index, index + 500).map((row) => ({ updateOne: { filter: { companyId, itemCode: row.itemCode, warehouseCode: row.warehouseCode }, update: { $set: row }, upsert: true } })));
    await DistributorStockBin.deleteMany({ companyId, syncedAt: { $lt: syncedAt } });
    await DistributorStockState.findOneAndUpdate({ companyId }, { $set: { lastSyncedAt: new Date(), recordCount: mapped.length, status: "ready", lastError: "" } }, { upsert: true });
  } catch (error) { await DistributorStockState.findOneAndUpdate({ companyId }, { $set: { status: "failed", lastError: error.message || "Stock sync failed" } }, { upsert: true }); throw error; }
}

async function ensure(companyId) { await dbConnect(); const state = await DistributorStockState.findOne({ companyId }).lean(); if (!(state?.status === "ready" && state.lastSyncedAt && Date.now() - new Date(state.lastSyncedAt).getTime() < TTL)) await sync(companyId); }

export async function getDistributorStock(companyId, { page = 1, pageSize = 20, search = "", warehouse = "", status = "" } = {}) {
  await ensure(companyId);
  const safePage = Math.max(1, Number(page) || 1), safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20));
  const filter = { companyId };
  if (warehouse) filter.warehouseCode = warehouse;
  if (status) filter.status = status;
  if (search.trim()) { const term = new RegExp(escapeRegex(search.trim()), "i"); filter.$or = [{ itemCode: term }, { warehouseCode: term }]; }
  const [items, total, warehouses, state] = await Promise.all([DistributorStockBin.find(filter).sort({ itemCode: 1, warehouseCode: 1 }).skip((safePage - 1) * safePageSize).limit(safePageSize).lean(), DistributorStockBin.countDocuments(filter), DistributorStockBin.distinct("warehouseCode", { companyId }), DistributorStockState.findOne({ companyId }).lean()]);
  return { items, total, page: safePage, pageSize: safePageSize, warehouses: warehouses.filter(Boolean).sort(), statuses: ["Healthy", "Watch", "Low"], syncedAt: state?.lastSyncedAt || null };
}
