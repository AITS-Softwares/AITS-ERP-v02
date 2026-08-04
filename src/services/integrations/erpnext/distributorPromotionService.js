import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

// Schemes are marketing-facing and time-sensitive; refresh within one minute
// while still avoiding repeated ERPNext reads during normal page navigation.
const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

function text(value) { return String(value || "").trim(); }
function dateOnly(value) { return text(value).slice(0, 10); }
function values(rows, keys) {
  return [...new Set((Array.isArray(rows) ? rows : []).flatMap((row) => keys.map((key) => text(row?.[key]))).filter(Boolean))];
}

function isActive(scheme, today) {
  const from = dateOnly(scheme.valid_from);
  const to = dateOnly(scheme.valid_to);
  return (!from || from <= today) && (!to || to >= today);
}

function isEligibleForDistributor(scheme, customer) {
  if (text(scheme.select_the_party) !== "Selling") return false;
  const applicableFor = text(scheme.applicable_for);
  if (!applicableFor) return true;
  if (applicableFor === "Customer") {
    const targets = values(scheme.customer, ["customer", "customer_name", "link_name"]);
    return targets.includes(text(customer.name)) || targets.includes(text(customer.customer_name));
  }
  if (applicableFor === "Customer Group") {
    return values(scheme.customer_group, ["customer_group", "link_name"]).includes(text(customer.customer_group));
  }
  if (applicableFor === "Territory") {
    return values(scheme.territory, ["territory", "link_name"]).includes(text(customer.territory));
  }
  return false;
}

function requirementLabel(scheme) {
  const validation = text(scheme.type_of_promo_validation);
  if (validation === "Based on Minimum Amount") return "Minimum order amount applies";
  if (validation === "Based on Minimum Quantity") return "Minimum quantity applies";
  if (validation === "Based on Minimum Quantity & Amount") return "Minimum quantity and amount apply";
  return "Eligibility is calculated by ERPNext";
}

function mapOffer(scheme) {
  const itemCodes = values(scheme.promotional_scheme_on_item_code, ["item_code", "item"]);
  const itemGroups = values(scheme.promotional_scheme_on_item_group, ["item_group"]);
  const targets = [
    itemCodes.length ? `Items: ${itemCodes.slice(0, 3).join(", ")}${itemCodes.length > 3 ? "…" : ""}` : "",
    itemGroups.length ? `Item groups: ${itemGroups.slice(0, 3).join(", ")}${itemGroups.length > 3 ? "…" : ""}` : "",
  ].filter(Boolean).join(" · ");
  const from = dateOnly(scheme.valid_from), to = dateOnly(scheme.valid_to);
  return {
    id: `erp-scheme-${scheme.name}`,
    title: text(scheme.scheme_name) || text(scheme.name),
    description: [targets, requirementLabel(scheme)].filter(Boolean).join(". "),
    schemeTag: "ERPNext promotional scheme",
    itemCodes,
    itemGroups,
    validity: from && to ? `Valid ${from} to ${to}` : from ? `Valid from ${from}` : to ? `Valid till ${to}` : "Currently active",
    source: "erpnext-promotional-scheme",
  };
}

async function listSchemes(config) {
  const fields = ["name", "scheme_name", "apply_on", "valid_from", "valid_to", "type_of_promo_validation", "select_the_party", "applicable_for", "modified"];
  const params = new URLSearchParams({ fields: JSON.stringify(fields), limit_page_length: "500", order_by: "modified desc" });
  const response = await erpnextRequestWithConfig(config, `/api/resource/Custom%20Promotional%20Scheme?${params}`, { method: "GET" });
  const summaries = Array.isArray(response?.data) ? response.data : [];
  const details = [];
  for (let index = 0; index < summaries.length; index += 10) {
    const batch = summaries.slice(index, index + 10);
    const rows = await Promise.all(batch.map(async (scheme) => {
      const payload = await erpnextRequestWithConfig(config, `/api/resource/Custom%20Promotional%20Scheme/${encodeURIComponent(scheme.name)}`, { method: "GET" }).catch(() => null);
      return payload?.data || null;
    }));
    details.push(...rows.filter(Boolean));
  }
  return details;
}

export async function getDistributorPromotionalOffers({ companyId, context }) {
  if (!context?.config || !context?.customer?.name) return [];
  const key = String(companyId);
  const existing = cache.get(key);
  let schemes = existing?.schemes;
  if (!schemes || Date.now() - existing.fetchedAt > CACHE_TTL_MS) {
    schemes = await listSchemes(context.config);
    cache.set(key, { schemes, fetchedAt: Date.now() });
  }
  const today = new Date().toISOString().slice(0, 10);
  return schemes
    .filter((scheme) => isActive(scheme, today) && isEligibleForDistributor(scheme, context.customer))
    .map(mapOffer);
}
