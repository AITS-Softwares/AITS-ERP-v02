"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

export default function WmsPurchaseOrderForm() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [itemResults, setItemResults] = useState([]);
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState("");
  const [notice, setNotice] = useState(null);
  const minDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch("/api/wms/suppliers?pageSize=100", { headers: authHeaders() }).then((r) => r.json()).then((p) => setSuppliers(p.data?.records || [])).catch(() => {});
    fetch("/api/wms/warehouses?pageSize=100", { headers: authHeaders() }).then((r) => r.json()).then((p) => setWarehouses(p.data?.records || [])).catch(() => {});
    fetch("/api/wms/uoms?pageSize=100", { headers: authHeaders() }).then((r) => r.json()).then((p) => setUoms(p.data?.records || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = new URLSearchParams({ pageSize: "10", search: itemSearch });
      fetch(`/api/wms/items?${query}`, { headers: authHeaders() }).then((r) => r.json()).then((p) => setItemResults(p.data?.records || [])).catch(() => {});
    }, itemSearch ? 250 : 0);
    return () => clearTimeout(timer);
  }, [itemSearch]);

  function addLine(item) {
    setLines((current) => current.some((line) => line.itemCode === item.item_code) ? current : [...current, { id: item.item_code, itemCode: item.item_code, itemName: item.item_name, uom: item.stock_uom || "", qty: 1, rate: 0, warehouse: "" }]);
    setItemSearch("");
  }
  function updateLine(id, patch) { setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line))); }
  function removeLine(id) { setLines((current) => current.filter((line) => line.id !== id)); }

  const total = lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.rate || 0), 0);
  const canSave = Boolean(supplier) && Boolean(scheduleDate) && lines.length > 0 && lines.every((line) => Number(line.qty) > 0 && Number(line.rate) >= 0);

  async function save(shouldSubmit) {
    try {
      setSaving(shouldSubmit ? "submit" : "draft");
      setNotice(null);
      const response = await fetch("/api/wms/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          supplier,
          scheduleDate,
          warehouse,
          submit: shouldSubmit,
          lines: lines.map((line) => ({ itemCode: line.itemCode, qty: line.qty, uom: line.uom, rate: line.rate, warehouse: line.warehouse })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Unable to save the Purchase Order.");
      router.push(`/wms/purchase-orders/${encodeURIComponent(payload.data.name)}`);
    } catch (error) {
      setNotice({ tone: "error", message: error.message || "Unable to save the Purchase Order." });
    } finally {
      setSaving("");
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-lg md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Phase 2 · Procure to receive</p>
        <h1 className="mt-2 text-3xl font-bold">New Purchase Order</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Saves and submits directly against ERPNext's Purchase Order doctype. ERPNext remains the single source of truth for status and stock.</p>
      </section>
      {notice ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{notice.message}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-lg font-bold">Purchase Order details</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Supplier
            <select className={inputClass} value={supplier} onChange={(event) => setSupplier(event.target.value)}>
              <option value="">Select a supplier</option>
              {suppliers.map((item) => <option key={item.name} value={item.name}>{item.supplier_name || item.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Required by
            <input type="date" className={inputClass} min={minDate} value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Target warehouse (optional)
            <select className={inputClass} value={warehouse} onChange={(event) => setWarehouse(event.target.value)}>
              <option value="">No default warehouse</option>
              {warehouses.map((item) => <option key={item.name} value={item.name}>{item.warehouse_name || item.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-lg font-bold">Items</h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <input value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} placeholder="Search item code or item name" className={inputClass} />
          {itemSearch || itemResults.length ? (
            <div className="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl bg-white">
              {itemResults.map((item) => (
                <button type="button" key={item.item_code} onClick={() => addLine(item)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-3 py-3 text-left hover:bg-cyan-50">
                  <span><span className="block truncate text-sm font-semibold text-slate-900">{item.item_name}</span><span className="block truncate text-xs text-slate-500">{item.item_code} · {item.stock_uom || "UOM pending"}</span></span>
                  <span className="text-xs font-semibold text-cyan-700">Add</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {!lines.length ? <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">Search and add one or more items to begin.</p> : null}
          {lines.map((line) => (
            <div key={line.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr_1fr_auto] md:items-center">
              <div><p className="font-semibold text-slate-900">{line.itemName}</p><p className="text-xs text-slate-500">{line.itemCode}</p></div>
              <input type="number" min="0.0001" step="0.0001" className={inputClass} value={line.qty} onChange={(event) => updateLine(line.id, { qty: event.target.value })} placeholder="Qty" />
              <select className={inputClass} value={line.uom} onChange={(event) => updateLine(line.id, { uom: event.target.value })}>
                {!uoms.some((u) => u.name === line.uom) && line.uom ? <option value={line.uom}>{line.uom}</option> : null}
                {uoms.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              <input type="number" min="0" step="0.01" className={inputClass} value={line.rate} onChange={(event) => updateLine(line.id, { rate: event.target.value })} placeholder="Rate" />
              <select className={inputClass} value={line.warehouse} onChange={(event) => updateLine(line.id, { warehouse: event.target.value })}>
                <option value="">Use target warehouse</option>
                {warehouses.map((item) => <option key={item.name} value={item.name}>{item.warehouse_name || item.name}</option>)}
              </select>
              <button type="button" onClick={() => removeLine(line.id)} className="text-sm font-semibold text-rose-600">Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm text-slate-500">Estimated total</p><p className="text-2xl font-bold text-slate-950">{money(total)}</p></div>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!canSave || Boolean(saving)} onClick={() => save(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">{saving === "draft" ? "Saving..." : "Save as draft"}</button>
            <button type="button" disabled={!canSave || Boolean(saving)} onClick={() => save(true)} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving === "submit" ? "Submitting..." : "Submit Purchase Order"}</button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Submitting locks the Purchase Order in ERPNext and makes it available for GRN / receiving. A draft can be submitted later from the Purchase Order detail screen.</p>
      </section>
    </div>
  );
}
