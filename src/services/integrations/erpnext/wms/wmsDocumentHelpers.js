import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

// Frappe REST insert always creates a draft (docstatus 0). Submitting a
// document is a separate, explicit action via frappe.client.submit — this
// keeps "create" and "commit to ERPNext's ledger" as two distinct steps.
export async function insertERPNextDoc(config, doctype, body) {
  const payload = await erpnextRequestWithConfig(config, `/api/resource/${encodeURIComponent(doctype)}`, { method: "POST", body });
  return payload?.data || null;
}

export async function getERPNextDoc(config, doctype, name) {
  if (!name) return null;
  const payload = await erpnextRequestWithConfig(config, `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`, { method: "GET" });
  return payload?.data || null;
}

export async function submitERPNextDoc(config, doc) {
  const payload = await erpnextRequestWithConfig(config, "/api/method/frappe.client.submit", { method: "POST", body: { doc } });
  return payload?.message || payload?.data || doc;
}

export async function insertAndSubmitERPNextDoc(config, doctype, body) {
  const draft = await insertERPNextDoc(config, doctype, body);
  if (!draft?.name) throw new Error(`ERPNext did not return a saved ${doctype}`);
  return submitERPNextDoc(config, draft);
}
