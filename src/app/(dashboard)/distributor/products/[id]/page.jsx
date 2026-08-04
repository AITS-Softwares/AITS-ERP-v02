"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStoredDistributorToken } from "@/lib/distributorClientSession";
import { ActionButton, Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null), [message, setMessage] = useState("Loading item detail...");
  useEffect(() => { const controller = new AbortController(); (async () => { try { const response = await fetch(`/api/distributor/products/${encodeURIComponent(params.id)}`, { headers: { Authorization: `Bearer ${getStoredDistributorToken()}` }, signal: controller.signal }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Product not found"); setProduct(payload.product); setMessage(""); } catch (error) { if (error.name !== "AbortError") setMessage(error.message || "Could not load product"); } })(); return () => controller.abort(); }, [params.id]);
  if (!product) return <div className="space-y-6"><PageIntro eyebrow="Item detail" title={message === "Loading item detail..." ? "Loading item" : "Record not found"} description={message} /></div>;
  return <div className="space-y-6"><PageIntro eyebrow="Item detail" title={product.itemName} description={product.description || "ERPNext Item detail for distributor pricing and stock review."} actions={<><ActionButton>Add to cart</ActionButton><Badge tone="green">{product.stock || "Stock pending"}</Badge></>} /><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><Surface className="p-6"><KeyValueGrid items={[{ label: "Item code", value: product.itemCode }, { label: "Item group", value: product.itemGroup || "Pending" }, { label: "Stock UOM", value: product.stockUom || "Pending" }, { label: "Standard rate", value: product.standardRate ?? "Pending" }, { label: "Projected quantity", value: product.projectedQty ?? "Pending" }, { label: "GST rate", value: product.gstRate ? `${product.gstRate}%` : "Pending" }]} /></Surface><Surface className="p-6"><div className="space-y-3"><p className="text-sm font-semibold text-slate-900">Commercial summary</p><StatePanel tone="blue" title={`Distributor rate: ${product.standardRate ?? "Pending"}`} description={product.priceList ? `Price list: ${product.priceList}` : "Pricing rules will be applied in the next phase."} /><div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Stock, price and master data are requested only for this item when you open it.</div></div></Surface></div></div>;
}
