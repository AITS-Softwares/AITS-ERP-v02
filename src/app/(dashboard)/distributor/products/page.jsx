"use client";

import { ActionLink, Badge, EmptyStateNote, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorProductsPage() {
  const { data } = useDistributorAppData();
  const categories = data.categories || [];
  const products = data.products || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Products"
        title="Products and price discovery"
        description="Browse ERPNext Item records with item code, item group, UOM, distributor pricing, and stock-facing fields before placing an order."
      />

      <Surface className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 lg:min-w-[320px]">
            Search by item code, item name, or item group
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} tone="slate">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </Surface>

      {!products.length ? <EmptyStateNote /> : null}

      {!products.length ? (
        <Surface className="p-5 sm:p-6">
          <p className="text-sm text-slate-500">No ERPNext Item records are available for this distributor yet.</p>
        </Surface>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {products.map((product) => {
          const stockLabel = product.stock || product.projectedQty || "Stock pending";
          const stockValue = Number(String(stockLabel).replace(/[^\d.-]/g, ""));
          const stockTone = Number.isFinite(stockValue) && stockValue <= 0 ? "amber" : "green";

          return (
            <Surface key={product.itemCode || product.id} className="overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="blue">{product.itemGroup || product.category || "Item"}</Badge>
                  <Badge tone={stockTone}>
                    {stockLabel}
                  </Badge>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{product.itemName || product.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{product.itemCode || product.id} | {product.itemGroup || product.category || "Item group pending"}</p>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-500">Standard rate</p>
                    <p className="mt-1 font-semibold text-slate-900">{product.standardRate ?? product.price ?? "Pending"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-500">Stock UOM</p>
                    <p className="mt-1 font-semibold text-slate-900">{product.stockUom || product.pack || "Pending"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pricing and scheme</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{product.scheme || "Pricing notes will appear after ERPNext sync."}</p>
                </div>
                <ActionLink href={`/distributor/products/${product.itemCode || product.id}`} tone="dark">
                  View details
                </ActionLink>
              </div>
            </Surface>
          );
        })}
      </div>

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Product detail access"
          caption="Open each ERPNext Item to review item master, pricing, tax, and stock-ready fields in one place."
        />
      </Surface>
    </div>
  );
}
