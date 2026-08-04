"use client";

import { useEffect, useMemo, useState } from "react";

const mappingRules = [
  ["customerCategory", "Customer", "Distributor category / eligibility"],
  ["creditLimit", "Customer", "Credit limit"],
  ["creditDays", "Customer", "Credit days / overdue control"],
  ["itemEligibility", "Item", "Item eligibility category"],
  ["pricingRuleCondition", "Pricing Rule", "Distributor pricing condition"],
  ["salesOrderWorkflow", "Sales Order", "Order approval workflow state"],
];

export default function DistributorDataContractPage() {
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [message, setMessage] = useState("");
  const [connection, setConnection] = useState(null), [doctypes, setDoctypes] = useState([]), [query, setQuery] = useState(""), [selected, setSelected] = useState("Item"), [mappings, setMappings] = useState({});
  const token = () => window.localStorage.getItem("distributor-admin-token");

  async function load() {
    setLoading(true); setMessage("");
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [fieldsResponse, mappingResponse] = await Promise.all([fetch("/api/distributor/admin/data-contract", { headers }), fetch("/api/distributor/admin/data-contract/mapping", { headers })]);
      const fieldsPayload = await fieldsResponse.json().catch(() => ({})), mappingPayload = await mappingResponse.json().catch(() => ({}));
      if (!fieldsResponse.ok) throw new Error(fieldsPayload.message || "Failed to inspect ERPNext fields");
      if (!mappingResponse.ok) throw new Error(mappingPayload.message || "Failed to load saved mappings");
      setConnection(fieldsPayload.connection || null); setDoctypes(fieldsPayload.doctypes || []); setMappings(mappingPayload.mappings || {});
    } catch (error) { setMessage(error.message || "Failed to inspect ERPNext fields"); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const active = doctypes.find((item) => item.doctype === selected) || doctypes[0];
  const rows = useMemo(() => (active?.fields || []).filter((field) => [field.fieldname, field.label, field.fieldtype, field.options].join(" ").toLowerCase().includes(query.toLowerCase())), [active, query]);
  const fieldsFor = (doctype) => doctypes.find((item) => item.doctype === doctype)?.fields || [];
  function setField(key, doctype, fieldname) { const field = fieldsFor(doctype).find((item) => item.fieldname === fieldname); setMappings((value) => ({ ...value, [key]: field ? { doctype, fieldname, label: field.label } : undefined })); }
  async function save() { setSaving(true); setMessage(""); try { const response = await fetch("/api/distributor/admin/data-contract/mapping", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify({ mappings }) }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Could not save mappings"); setMappings(payload.mappings || {}); setMessage("Mappings saved. They will be used when pricing, credit and approval rules are enabled."); } catch (error) { setMessage(error.message || "Could not save mappings"); } finally { setSaving(false); } }

  return <div className="space-y-6">
    <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#105B92] to-cyan-700 p-6 text-white shadow-lg"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Phase 4A</p><h1 className="mt-2 text-3xl font-semibold">ERPNext field mapping</h1><p className="mt-2 max-w-3xl text-sm text-blue-50">Choose the client’s actual custom fields once. The distributor app can then use the correct ERPNext category, credit, pricing and approval values without hard-coded guesses.</p><button onClick={load} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#105B92]">{loading ? "Refreshing..." : "Refresh fields"}</button></section>
    {connection ? <p className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">Connected to {connection.label} ({connection.baseUrl})</p> : null}
    {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-900">Rule field selections</h2><p className="mt-1 text-sm text-slate-500">Leave a selection blank until the ERPNext owner confirms it.</p></div><button onClick={save} disabled={saving} className="rounded-xl bg-[#105B92] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save mappings"}</button></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{mappingRules.map(([key, doctype, title]) => <label key={key} className="rounded-2xl border border-slate-200 p-4"><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="mt-1 block text-xs text-slate-500">{doctype}</span><select value={mappings[key]?.fieldname || ""} onChange={(event) => setField(key, doctype, event.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="">Not mapped yet</option>{fieldsFor(doctype).map((field) => <option key={field.fieldname} value={field.fieldname}>{field.label} ({field.fieldname})</option>)}</select></label>)}</div></section>
    <div className="flex gap-2 overflow-x-auto pb-1">{doctypes.map((item) => <button key={item.doctype} onClick={() => setSelected(item.doctype)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium ${active?.doctype === item.doctype ? "bg-[#105B92] text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item.doctype} ({item.fields.length})</button>)}</div>
    {active?.warning ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{active.warning}</p> : null}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search field name, label, type, or options" className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" /><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="px-3 py-2">Label</th><th className="px-3 py-2">Fieldname</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Options</th><th className="px-3 py-2">Source</th></tr></thead><tbody>{rows.map((field) => <tr key={`${field.source}-${field.fieldname}`} className="border-b border-slate-100"><td className="px-3 py-3 font-medium">{field.label}</td><td className="px-3 py-3 font-mono text-xs">{field.fieldname}</td><td className="px-3 py-3">{field.fieldtype}</td><td className="px-3 py-3">{field.options || "-"}</td><td className="px-3 py-3">{field.source}</td></tr>)}</tbody></table></div>{!loading && active && !rows.length ? <p className="py-6 text-center text-sm text-slate-500">No accessible fields found.</p> : null}</section>
  </div>;
}
