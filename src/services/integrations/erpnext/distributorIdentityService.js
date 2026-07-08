import { buildERPNextConfig, resolveERPNextConnection } from "@/services/integrations/erpnext/connectionService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

function normalizeText(value) {
  return String(value || "").trim();
}

function uniqueValues(values) {
  return [...new Set(values.map(normalizeText).filter(Boolean))];
}

function buildQueryString(options = {}) {
  const params = new URLSearchParams();

  if (options.fields?.length) {
    params.set("fields", JSON.stringify(options.fields));
  }
  if (options.filters?.length) {
    params.set("filters", JSON.stringify(options.filters));
  }
  if (options.orFilters?.length) {
    params.set("or_filters", JSON.stringify(options.orFilters));
  }
  if (Number.isFinite(options.limit)) {
    params.set("limit_page_length", String(options.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function listERPNextDocuments(config, doctype, options = {}) {
  const payload = await erpnextRequestWithConfig(
    config,
    `/api/resource/${encodeURIComponent(doctype)}${buildQueryString(options)}`,
    { method: "GET" }
  );

  return Array.isArray(payload?.data) ? payload.data : [];
}

async function readERPNextDocument(config, doctype, name) {
  if (!name) return null;

  const payload = await erpnextRequestWithConfig(
    config,
    `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    { method: "GET" }
  );

  return payload?.data || null;
}

function buildAccountCandidates({ account, user, localCustomer = null } = {}) {
  return uniqueValues([
    account?.erpCustomerName,
    account?.distributorCode,
    account?.displayName,
    user?.mobileNumber,
    user?.emailAddress,
    localCustomer?.customerCode,
    localCustomer?.customerName,
    localCustomer?.mobileNumber,
    localCustomer?.emailId,
  ]);
}

async function findERPNextCustomerByContact(config, { emailAddress = "", mobileNumber = "" } = {}) {
  const contactOrFilters = [];
  const email = normalizeText(emailAddress).toLowerCase();
  const mobile = normalizeText(mobileNumber);

  if (email) {
    contactOrFilters.push(["Contact", "email_id", "=", email]);
  }
  if (mobile) {
    contactOrFilters.push(["Contact", "mobile_no", "=", mobile]);
    contactOrFilters.push(["Contact", "phone", "=", mobile]);
  }

  if (!contactOrFilters.length) return null;

  const contacts = await listERPNextDocuments(config, "Contact", {
    fields: ["name", "email_id", "mobile_no", "phone"],
    orFilters: contactOrFilters,
    limit: 10,
  }).catch(() => []);

  for (const contact of contacts) {
    const detail = await readERPNextDocument(config, "Contact", contact.name).catch(() => null);
    const customerLink = (detail?.links || []).find((link) => link.link_doctype === "Customer" && normalizeText(link.link_name));
    if (!customerLink?.link_name) continue;

    const customer = await readERPNextDocument(config, "Customer", customerLink.link_name).catch(() => null);
    if (customer) return customer;
  }

  return null;
}

export async function resolveERPNextDistributorContext({ companyId, account, user, localCustomer = null }) {
  const connection = await resolveERPNextConnection({ companyId });
  if (!connection) return null;

  const config = buildERPNextConfig(connection);
  const overrideCustomerName = normalizeText(account?.erpCustomerName);

  if (overrideCustomerName) {
    const overrideCustomer = await readERPNextDocument(config, "Customer", overrideCustomerName).catch(() => null);
    if (overrideCustomer) {
      return {
        connection,
        config,
        customer: overrideCustomer,
      };
    }
  }

  const candidates = buildAccountCandidates({ account, user, localCustomer });
  if (candidates.length) {
    const customerDocs = await listERPNextDocuments(config, "Customer", {
      fields: ["name", "customer_name", "customer_group", "territory", "mobile_no", "email_id"],
      orFilters: candidates.flatMap((value) => [
        ["Customer", "name", "=", value],
        ["Customer", "customer_name", "=", value],
        ["Customer", "mobile_no", "=", value],
        ["Customer", "email_id", "=", value],
      ]),
      limit: 1,
    }).catch(() => []);

    if (customerDocs[0]?.name) {
      const matchedCustomer = await readERPNextDocument(config, "Customer", customerDocs[0].name).catch(() => customerDocs[0]);
      return {
        connection,
        config,
        customer: matchedCustomer,
      };
    }
  }

  const contactCustomer = await findERPNextCustomerByContact(config, {
    emailAddress: user?.emailAddress || localCustomer?.emailId || "",
    mobileNumber: user?.mobileNumber || localCustomer?.mobileNumber || "",
  });

  return {
    connection,
    config,
    customer: contactCustomer || null,
  };
}

export async function resolveERPNextCustomerByLogin({ companyId, account, emailAddress = "", mobileNumber = "" }) {
  const context = await resolveERPNextDistributorContext({
    companyId,
    account,
    user: {
      emailAddress: normalizeText(emailAddress).toLowerCase(),
      mobileNumber: normalizeText(mobileNumber),
    },
  }).catch(() => null);

  return context?.customer || null;
}
