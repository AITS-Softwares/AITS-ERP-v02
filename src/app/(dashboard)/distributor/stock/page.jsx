"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import DistributorListFilters from "@/components/distributor/DistributorListFilters";
import DistributorSelect from "@/components/distributor/DistributorSelect";
import { ActionLink, Badge, PageIntro, Surface } from "@/components/distributor/DistributorUI";
import { getStoredDistributorToken } from "@/lib/distributorClientSession";

const PAGE_SIZE = 20;
const tone = (status) => status === "Healthy" ? "green" : status === "Watch" ? "amber" : "red";

export default function DistributorStockPage() {
  const [query, setQuery] = useState(""), [warehouse, setWarehouse] = useState(""), [status, setStatus] = useState(""), [page, setPage] = useState(1);
  const [stock, setStock] = useState({ items: [], total: 0, warehouses: [], statuses: [], syncedAt: null });
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { setPage(1); }, [query, warehouse, status]);
  useEffect(() => { const controller = new AbortController(); const timer = setTimeout(async () => { setLoading(true); setError(""); try { const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), search: query, warehouse, status }); const response = await fetch(`/api/distributor/stock?${params}`, { headers: { Authorization: `Bearer ${getStoredDistributorToken()}` }, signal: controller.signal }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Could not load stock"); setStock(payload.data || {}); } catch (requestError) { if (requestError.name !== "AbortError") setError(requestError.message || "Could not load stock"); } finally { if (!controller.signal.aborted) setLoading(false); } }, query ? 250 : 0); return () => { controller.abort(); clearTimeout(timer); }; }, [page, query, warehouse, status]);
  const items = stock.items || [], total = stock.total || 0, pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return <div className="space-y-6">
    <PageIntro eyebrow="Stock" title="ERPNext stock visibility" description="Search all ERPNext Bin records by item and warehouse. Only the current page is loaded on your device." actions={<ActionLink href="/distributor/stock/request">Request stock</ActionLink>} />
    <div className="space-y-3"><DistributorListFilters query={query} onQueryChange={setQuery} placeholder="Search item code or warehouse" filterLabel="All warehouses" filterValue={warehouse} onFilterChange={setWarehouse} filterOptions={stock.warehouses || []} /><div className="flex justify-end"><div className="w-full sm:w-56"><DistributorSelect value={status} onChange={setStatus} aria-label="Stock status" options={[{ value: "", label: "All stock statuses" }, ...(stock.statuses || []).map((value) => ({ value, label: value }))]} /></div></div></div>
    {error ? <Surface className="p-5 text-sm text-rose-600">{error}</Surface> : null}
    {loading ? <Surface className="p-8 text-center text-sm text-slate-500">Loading ERPNext stock...</Surface> : null}
    {!loading && !items.length ? <Surface className="p-6 text-center text-sm text-slate-500">No stock records match the selected filters.</Surface> : null}
    {!loading && items.length ? <Surface className="overflow-hidden"><div className="grid grid-cols-[minmax(0,1fr)_72px_52px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"><span>Item / warehouse</span><span className="text-right">Available</span><span className="text-right">Status</span></div><div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(150px,1fr)_100px_100px_100px_90px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"><span>Item code</span><span>Warehouse</span><span>Actual</span><span>Reserved</span><span>Projected</span><span>Status</span></div><div className="divide-y divide-slate-100">{items.map((item) => <div key={`${item.itemCode}-${item.warehouseCode}`}><div className="grid grid-cols-[minmax(0,1fr)_72px_52px] items-center gap-2 px-3 py-3 md:hidden"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{item.itemCode}</span><span className="block truncate text-xs text-slate-500">{item.warehouseCode}</span></span><span className="text-right text-sm font-semibold text-slate-800">{item.availableQty}</span><span className="justify-self-end"><Badge tone={tone(item.status)}>{item.status}</Badge></span></div><div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(150px,1fr)_100px_100px_100px_90px] items-center gap-4 px-5 py-4 text-sm md:grid"><span className="font-semibold text-slate-900">{item.itemCode}</span><span className="truncate text-slate-600">{item.warehouseCode}</span><span>{item.actualQty}</span><span>{item.reservedQty}</span><span>{item.projectedQty}</span><Badge tone={tone(item.status)}>{item.status}</Badge></div></div>)}</div></Surface> : null}
    {!loading && total ? <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row"><span className="text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} Bin records</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><FiChevronLeft /></button><span className="min-w-20 text-center font-semibold">{page} / {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><FiChevronRight /></button></div></div> : null}
  </div>;
}
