"use client";

import { useParams } from "next/navigation";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { ActionButton, Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorProductDetailPage() {
  const params = useParams();
  const { data } = useDistributorAppData();
  const product = (data.products || []).find((item) => String(item.itemCode || item.id) === String(params.id));

  if (!product) {
    return (
      <div className="space-y-6">
        <PageIntro eyebrow="Item detail" title="Record not found" description="The selected Item is not available for this distributor account." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Item detail"
        title={product.itemName || product.name}
        description={product.description || "ERPNext Item detail for distributor pricing and stock review."}
        actions={<><ActionButton>Add to cart</ActionButton><Badge tone="green">{product.stock || product.projectedQty || "Stock pending"}</Badge></>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Item code", value: product.itemCode || product.id },
              { label: "Item group", value: product.itemGroup || "Pending" },
              { label: "Stock UOM", value: product.stockUom || "Pending" },
              { label: "Standard rate", value: product.standardRate || "Pending" },
              { label: "Reorder level", value: product.reorderLevel || "Pending" },
              { label: "GST rate", value: product.gstRate ? `${product.gstRate}%` : "Pending" },
            ]}
          />
        </Surface>

        <Surface className="p-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Commercial summary</p>
            <StatePanel tone="blue" title={`Distributor rate: ${product.standardRate || "Pending"}`} description={`Scheme: ${product.scheme || "Available after pricing sync"}`} />
            <div className="grid gap-3">
              {(product.highlights || []).map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
              {!(product.highlights || []).length ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Item-level pricing notes, scheme tags, and stock notes will appear after ERPNext sync.
                </div>
              ) : null}
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
