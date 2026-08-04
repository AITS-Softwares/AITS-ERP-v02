import crypto from "crypto";
import dbConnect from "@/lib/db";
import DistributorPricingPreview from "@/models/DistributorPricingPreview";
import { ERPNextError, erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";
import { resolveERPNextActiveWarehouse, resolveERPNextDistributorContext, resolveERPNextTransactionCompany, resolveERPNextTransactionPricing } from "@/services/integrations/erpnext/distributorAppService";

const PREVIEW_TTL_MS = 60 * 1000;
const DEFAULT_METHOD = "aitserp_distributor.api.pricing.preview_sales_order";

function text(value) { return String(value || "").trim(); }
function number(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function date(value) { return /^\d{4}-\d{2}-\d{2}$/.test(text(value)) ? text(value) : new Date().toISOString().slice(0, 10); }

function normalizeLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines
    .map((line) => ({
      item_code: text(line.itemCode || line.item_code),
      qty: Math.max(1, number(line.qty, 1)),
      uom: text(line.uom),
    }))
    .filter((line) => line.item_code)
    .sort((left, right) => `${left.item_code}:${left.uom}`.localeCompare(`${right.item_code}:${right.uom}`));
}

function normalizePreview(raw, fallback) {
  const source = raw?.message || raw?.data || raw || {};
  const items = Array.isArray(source.items) ? source.items.map((line) => ({
    itemCode: text(line.item_code || line.itemCode),
    itemName: text(line.item_name || line.itemName),
    uom: text(line.uom),
    qty: number(line.qty, 0),
    priceListRate: number(line.price_list_rate ?? line.priceListRate),
    rate: number(line.rate),
    amount: number(line.amount),
    discountPercentage: number(line.discount_percentage ?? line.discountPercentage),
    discountAmount: number(line.discount_amount ?? line.discountAmount),
    pricingRules: Array.isArray(line.pricing_rules || line.pricingRules) ? (line.pricing_rules || line.pricingRules) : [],
  })).filter((line) => line.itemCode) : [];

  if (!items.length) throw new Error("ERPNext pricing preview returned no priced items");

  return {
    items,
    freeItems: Array.isArray(source.free_items || source.freeItems) ? (source.free_items || source.freeItems) : [],
    netTotal: number(source.net_total ?? source.netTotal),
    totalTaxesAndCharges: number(source.total_taxes_and_charges ?? source.totalTaxesAndCharges),
    grandTotal: number(source.grand_total ?? source.grandTotal),
    currency: text(source.currency) || fallback.currency || "INR",
    sellingPriceList: text(source.selling_price_list || source.sellingPriceList) || fallback.sellingPriceList || "",
    pricingContextHash: text(source.pricing_context_hash || source.pricingContextHash),
    calculatedAt: new Date().toISOString(),
  };
}

function unavailable(error) {
  const status = Number(error?.status);
  const details = JSON.stringify(error?.details || "").toLowerCase();
  return status === 404 || status === 405 || error?.code === "NETWORK_ERROR" || error?.code === "CONFIG_MISSING"
    || (status === 417 && (details.includes("failed to get method") || details.includes("modulenotfounderror") || details.includes("no module named")));
}

async function basicERPNextPreview(config, request) {
  const items = await Promise.all(request.items.map(async (line) => {
    const args = {
      doctype: "Sales Order",
      item_code: line.item_code,
      customer: request.customer,
      company: request.company,
      currency: request.currency,
      qty: line.qty,
      uom: line.uom,
      warehouse: request.warehouse,
      transaction_date: request.transaction_date,
    };
    if (request.selling_price_list) args.price_list = request.selling_price_list;
    const response = await erpnextRequestWithConfig(config, "/api/method/erpnext.stock.get_item_details.get_item_details", { method: "POST", body: { args } });
    const result = response?.message || response?.data || {};
    // This ERPNext site has a custom get_item_details override which returns
    // rate: 0 while still returning the valid price_list_rate. For a base-rate
    // preview, use the positive list rate instead of displaying a false zero.
    const returnedRate = number(result.rate);
    const priceListRate = number(result.price_list_rate);
    const rate = returnedRate > 0 ? returnedRate : priceListRate;
    const returnedAmount = number(result.amount);
    return {
      item_code: line.item_code,
      item_name: text(result.item_name) || line.item_code,
      uom: text(result.uom) || line.uom,
      qty: line.qty,
      price_list_rate: priceListRate,
      rate,
      amount: returnedAmount > 0 ? returnedAmount : rate * line.qty,
      discount_percentage: number(result.discount_percentage),
      discount_amount: number(result.discount_amount),
      pricing_rules: [],
    };
  }));
  const netTotal = items.reduce((sum, item) => sum + item.amount, 0);
  return {
    items,
    net_total: netTotal,
    total_taxes_and_charges: 0,
    grand_total: netTotal,
    currency: request.currency,
    selling_price_list: request.selling_price_list,
    preview_mode: "basic",
  };
}

export async function previewERPNextDistributorPricing(session, input = {}) {
  const lines = normalizeLines(input.lines);
  if (!lines.length) throw new ERPNextError("Add at least one item before requesting pricing", { status: 400, code: "INVALID_CART" });

  const context = await resolveERPNextDistributorContext(session);
  if (!context?.config || !context?.customer?.name) {
    throw new ERPNextError("ERPNext distributor customer mapping is required before pricing an order", { status: 400, code: "CUSTOMER_MAPPING_REQUIRED" });
  }

  const [company, warehouse] = await Promise.all([
    resolveERPNextTransactionCompany(context.config, context.customer),
    resolveERPNextActiveWarehouse(context.config, session.account?.preferredWarehouse),
  ]);
  const pricing = await resolveERPNextTransactionPricing(context.config, company, context.customer);
  const request = {
    customer: context.customer.name,
    company,
    selling_price_list: pricing.priceList,
    currency: pricing.currency,
    transaction_date: date(input.transactionDate),
    delivery_date: date(input.deliveryDate),
    warehouse,
    items: lines,
  };
  const cacheKey = crypto.createHash("sha256").update(JSON.stringify(request)).digest("hex");

  await dbConnect();
  const cached = await DistributorPricingPreview.findOne({ companyId: session.companyId, cacheKey, expiresAt: { $gt: new Date() } }).lean();
  const isObsoleteZeroBasePreview = cached?.preview?.mode === "basic"
    && Array.isArray(cached.preview.items)
    && cached.preview.items.some((item) => number(item.rate) <= 0 && number(item.priceListRate) > 0);
  if (cached?.preview && !isObsoleteZeroBasePreview) return { ...cached.preview, cache: "hit" };

  const method = text(process.env.ERP_NEXT_DISTRIBUTOR_PRICING_METHOD) || DEFAULT_METHOD;
  let response;
  try {
    response = await erpnextRequestWithConfig(context.config, `/api/method/${method}`, { method: "POST", body: request });
  } catch (error) {
    if (unavailable(error)) {
      try {
        response = await basicERPNextPreview(context.config, request);
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }

  const preview = normalizePreview(response, { currency: request.currency, sellingPriceList: request.selling_price_list });
  preview.mode = text((response?.message || response)?.preview_mode) || "authoritative";
  const expiresAt = new Date(Date.now() + PREVIEW_TTL_MS);
  await DistributorPricingPreview.findOneAndUpdate(
    { companyId: session.companyId, cacheKey },
    { $set: { preview, expiresAt } },
    { upsert: true, new: true }
  );
  return { ...preview, cache: "miss" };
}
