"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiGrid, FiList } from "react-icons/fi";
import DistributorListFilters from "@/components/distributor/DistributorListFilters";
import { ActionLink, Badge, EmptyStateNote, PageIntro, Surface } from "@/components/distributor/DistributorUI";
import { getStoredDistributorToken } from "@/lib/distributorClientSession";

const PAGE_SIZE = 20;
function productMeta(product) { const label = product.stock || "Stock checked on detail"; return { stockLabel: label, stockTone: label === "Stock checked on detail" ? "blue" : Number(String(label).replace(/[^\d.-]/g, "")) <= 0 ? "amber" : "green" }; }
function ProductThumb({ product }) { return product.imageUrl ? <img src={product.imageUrl} alt="" className="h-9 w-9 rounded-md border border-slate-200 object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">{(product.itemName || product.itemCode || "?").slice(0, 1).toUpperCase()}</span>; }

export default function DistributorProductsPage() {
  const [query, setQuery] = useState(""), [category, setCategory] = useState(""), [view, setView] = useState("list"), [page, setPage] = useState(1);
  const [catalogue, setCatalogue] = useState({ items: [], categories: [], total: 0, page: 1, pageSize: PAGE_SIZE, syncedAt: null });
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { setPage(1); }, [query, category]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), search: query, itemGroup: category });
        const response = await fetch(`/api/distributor/products?${params}`, { headers: { Authorization: `Bearer ${getStoredDistributorToken()}` }, signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Could not load products");
        setCatalogue(payload.data || {});
      } catch (requestError) { if (requestError.name !== "AbortError") setError(requestError.message || "Could not load products"); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, query ? 250 : 0);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [page, query, category]);
  const products = catalogue.items || [], total = catalogue.total || 0, pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return <div className="space-y-6">
    <PageIntro eyebrow="Products" title="Products and price discovery" description="The catalogue is paged from the server, so every ERPNext Item remains available without loading the full catalogue into your device." />
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div className="min-w-0 flex-1"><DistributorListFilters query={query} onQueryChange={setQuery} placeholder="Search by item code, item name, or group" filterLabel="All item groups" filterValue={category} onFilterChange={setCategory} filterOptions={catalogue.categories || []} /></div><div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"><span className="text-sm font-medium text-slate-500">{total} products</span><div className="flex rounded-xl bg-slate-100 p-1"><button type="button" title="List view" onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-white text-[#105B92] shadow-sm" : "text-slate-500"}`}><FiList /></button><button type="button" title="Tile view" onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-white text-[#105B92] shadow-sm" : "text-slate-500"}`}><FiGrid /></button></div></div></div>
    {error ? <Surface className="p-5 text-sm text-rose-600">{error}</Surface> : null}
    {loading ? <Surface className="p-8 text-center text-sm text-slate-500">Loading catalogue...</Surface> : null}
    {!loading && !products.length ? <><EmptyStateNote /><Surface className="p-5 text-sm text-slate-500">No products match the selected filters.</Surface></> : null}
    {!loading && products.length && (view === "list" ? <Surface className="overflow-hidden"><div className="grid grid-cols-[36px_64px_minmax(0,1fr)_46px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"><span>Img</span><span>SKU</span><span>Item name</span><span className="text-right">Qty</span></div><div className="hidden grid-cols-[minmax(0,1.8fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid"><span>Product</span><span>UOM</span><span>Availability</span><span /></div><div className="divide-y divide-slate-100">{products.map((product) => { const { stockLabel, stockTone } = productMeta(product); return <div key={product.itemCode}><Link href={`/distributor/products/${encodeURIComponent(product.itemCode)}`} className="grid grid-cols-[36px_64px_minmax(0,1fr)_46px] items-center gap-2 px-3 py-2.5 md:hidden"><ProductThumb product={product} /><span className="truncate font-mono text-[11px] text-slate-600">{product.itemCode}</span><span className="truncate text-sm font-medium text-slate-900">{product.itemName}</span><span className="text-right text-sm font-semibold text-slate-700">{product.availableQty ?? "-"}</span></Link><div className="hidden gap-3 px-5 py-4 md:grid md:grid-cols-[minmax(0,1.8fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_auto] md:items-center md:gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-slate-900">{product.itemName}</p><Badge tone="blue">{product.itemGroup || "Item"}</Badge></div><p className="mt-1 text-sm text-slate-500">{product.itemCode}</p></div><p className="font-semibold text-slate-800">{product.stockUom || "Pending"}</p><Badge tone={stockTone}>{stockLabel}</Badge><ActionLink href={`/distributor/products/${encodeURIComponent(product.itemCode)}`} tone="dark">Details</ActionLink></div></div>; })}</div></Surface> : <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{products.map((product) => { const { stockLabel, stockTone } = productMeta(product); return <Surface key={product.itemCode} className="overflow-hidden"><div className="bg-gradient-to-br from-blue-50 to-amber-50 p-5"><div className="flex items-center justify-between gap-3"><Badge tone="blue">{product.itemGroup || "Item"}</Badge><Badge tone={stockTone}>{stockLabel}</Badge></div><h2 className="mt-4 text-xl font-semibold text-slate-900">{product.itemName}</h2><p className="mt-2 text-sm text-slate-500">{product.itemCode} - {product.stockUom || "UOM pending"}</p></div><div className="p-5"><ActionLink href={`/distributor/products/${encodeURIComponent(product.itemCode)}`} tone="dark">View details</ActionLink></div></Surface>; })}</div>)}
    {!loading && total > 0 ? <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row"><p className="text-sm text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}{catalogue.syncedAt ? " cached ERPNext Items" : ""}</p><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><FiChevronLeft /></button><span className="min-w-20 text-center text-sm font-semibold text-slate-700">Page {page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"><FiChevronRight /></button></div></div> : null}
  </div>;
}
