import dbConnect from "@/lib/db";
import DistributorCatalogItem from "@/models/DistributorCatalogItem";
import DistributorCatalogState from "@/models/DistributorCatalogState";
import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

const CACHE_TTL_MS = 10 * 60 * 1000;
const ERP_PAGE_SIZE = 500;
const syncInFlight = new Map();

function query(options = {}) {
  const params = new URLSearchParams({ fields: JSON.stringify(options.fields || []) });
  if (options.filters?.length) params.set("filters", JSON.stringify(options.filters));
  if (options.limitStart) params.set("limit_start", String(options.limitStart));
  params.set("limit_page_length", String(options.limit || ERP_PAGE_SIZE));
  params.set("order_by", options.orderBy || "item_name asc");
  return `?${params.toString()}`;
}

async function list(config, doctype, options) {
  const payload = await erpnextRequestWithConfig(config, `/api/resource/${encodeURIComponent(doctype)}${query(options)}`, { method: "GET" });
  return Array.isArray(payload?.data) ? payload.data : [];
}

function mapItem(item, syncedAt, baseUrl) {
  const image = String(item.image || "").trim();
  return {
    itemCode: String(item.item_code || item.name || "").trim(),
    itemName: String(item.item_name || item.item_code || item.name || "").trim(),
    itemGroup: String(item.item_group || "").trim(),
    isSalesItem: Number(item.is_sales_item) === 1 || item.is_sales_item === true,
    stockUom: String(item.stock_uom || "").trim(),
    imageUrl: image ? (image.startsWith("http") ? image : `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`) : "",
    description: String(item.description || ""),
    syncedAt,
  };
}

async function syncCatalogue(companyId) {
  const connection = await resolveERPNextConnection({ companyId });
  if (!connection) throw new Error("ERPNext connection is not configured");
  const config = buildERPNextConfig(connection);
  const startedAt = new Date();
  await DistributorCatalogState.findOneAndUpdate({ companyId }, { $set: { status: "syncing", lastError: "" } }, { upsert: true });
  try {
    let offset = 0, all = [];
    while (true) {
      const page = await list(config, "Item", { fields: ["name", "item_code", "item_name", "item_group", "stock_uom", "description", "image", "is_sales_item"], filters: [["Item", "disabled", "=", 0]], limitStart: offset });
      all = all.concat(page.map((item) => mapItem(item, startedAt, config.baseUrl)).filter((item) => item.itemCode));
      if (page.length < ERP_PAGE_SIZE) break;
      offset += page.length;
    }
    // Keep stock reads bounded. The mobile list needs one inexpensive available
    // quantity, while the detail screen still resolves warehouse-specific stock.
    const stockByItem = new Map();
    for (let index = 0; index < all.length; index += 250) {
      const itemCodes = all.slice(index, index + 250).map((item) => item.itemCode);
      let binOffset = 0;
      while (true) {
        const bins = await list(config, "Bin", { fields: ["item_code", "actual_qty", "reserved_qty"], filters: [["Bin", "item_code", "in", itemCodes]], limit: 1000, limitStart: binOffset, orderBy: "item_code asc" }).catch(() => []);
        for (const bin of bins) stockByItem.set(String(bin.item_code || ""), (stockByItem.get(String(bin.item_code || "")) || 0) + Number(bin.actual_qty || 0) - Number(bin.reserved_qty || 0));
        if (bins.length < 1000) break;
        binOffset += bins.length;
      }
    }
    for (const item of all) item.availableQty = stockByItem.has(item.itemCode) ? stockByItem.get(item.itemCode) : null;
    for (let index = 0; index < all.length; index += 500) {
      await DistributorCatalogItem.bulkWrite(all.slice(index, index + 500).map((item) => ({ updateOne: { filter: { companyId, itemCode: item.itemCode }, update: { $set: item }, upsert: true } })));
    }
    await DistributorCatalogItem.deleteMany({ companyId, syncedAt: { $lt: startedAt } });
    await DistributorCatalogState.findOneAndUpdate({ companyId }, { $set: { lastSyncedAt: new Date(), itemCount: all.length, schemaVersion: 3, status: "ready", lastError: "" } }, { upsert: true });
  } catch (error) {
    await DistributorCatalogState.findOneAndUpdate({ companyId }, { $set: { status: "failed", lastError: error.message || "Catalogue sync failed" } }, { upsert: true });
    throw error;
  }
}

function syncCatalogueOnce(companyId) {
  const key = String(companyId);
  if (syncInFlight.has(key)) return syncInFlight.get(key);
  const task = syncCatalogue(companyId).finally(() => syncInFlight.delete(key));
  syncInFlight.set(key, task);
  return task;
}

async function ensureCatalogue(companyId) {
  await dbConnect();
  const state = await DistributorCatalogState.findOne({ companyId }).lean();
  const isFresh = state?.schemaVersion === 3 && state?.status === "ready" && state.lastSyncedAt && Date.now() - new Date(state.lastSyncedAt).getTime() < CACHE_TTL_MS;
  if (!isFresh) await syncCatalogueOnce(companyId);
}

function escapeRegex(value) { return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function getDistributorCatalogue(companyId, { page = 1, pageSize = 20, search = "", itemGroup = "", salesOnly = false } = {}) {
  await ensureCatalogue(companyId);
  const safePage = Math.max(1, Number(page) || 1), safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20));
  const filter = { companyId };
  if (salesOnly) filter.isSalesItem = true;
  if (itemGroup) filter.itemGroup = itemGroup;
  if (search.trim()) { const term = new RegExp(escapeRegex(search.trim()), "i"); filter.$or = [{ itemCode: term }, { itemName: term }, { itemGroup: term }]; }
  const [items, total, groups, state] = await Promise.all([
    DistributorCatalogItem.find(filter).sort({ itemName: 1, itemCode: 1 }).skip((safePage - 1) * safePageSize).limit(safePageSize).lean(),
    DistributorCatalogItem.countDocuments(filter),
    DistributorCatalogItem.distinct("itemGroup", { companyId }),
    DistributorCatalogState.findOne({ companyId }).lean(),
  ]);
  return { items, total, page: safePage, pageSize: safePageSize, categories: groups.filter(Boolean).sort(), syncedAt: state?.lastSyncedAt || null };
}

export async function getDistributorCatalogueItem(companyId, itemCode, preferredWarehouse = "") {
  await ensureCatalogue(companyId);
  const cached = await DistributorCatalogItem.findOne({ companyId, itemCode }).lean();
  if (!cached) return null;
  const connection = await resolveERPNextConnection({ companyId });
  const config = buildERPNextConfig(connection);
  const [detail, prices, bins] = await Promise.all([
    erpnextRequestWithConfig(config, `/api/resource/Item/${encodeURIComponent(itemCode)}`, { method: "GET" }).then((result) => result?.data).catch(() => null),
    list(config, "Item Price", { fields: ["price_list_rate", "price_list", "currency"], filters: [["Item Price", "item_code", "=", itemCode], ["Item Price", "selling", "=", 1]], limit: 1, orderBy: "modified desc" }).catch(() => []),
    list(config, "Bin", { fields: ["actual_qty", "reserved_qty", "projected_qty", "warehouse"], filters: [["Bin", "item_code", "=", itemCode], ...(preferredWarehouse ? [["Bin", "warehouse", "=", preferredWarehouse]] : [])], limit: 1, orderBy: "modified desc" }).catch(() => []),
  ]);
  const price = prices[0], bin = bins[0];
  return { ...cached, description: detail?.description || cached.description, standardRate: price?.price_list_rate ?? null, priceList: price?.price_list || "", currency: price?.currency || "", actualQty: bin?.actual_qty ?? null, reservedQty: bin?.reserved_qty ?? null, projectedQty: bin?.projected_qty ?? null, stock: bin ? `${bin.projected_qty ?? bin.actual_qty ?? 0} available` : "Stock pending", reorderLevel: detail?.reorder_levels?.[0]?.warehouse_reorder_level ?? null, gstRate: detail?.taxes?.[0]?.tax_rate ?? null };
}
