"use client";

import { useParams } from "next/navigation";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorOrderDetailPage() {
  const params = useParams();
  const { data } = useDistributorAppData();
  const order = (data.orders || []).find((item) => String(item.documentNumberOrder || item.id) === String(params.id));

  if (!order) {
    return (
      <div className="space-y-6">
        <PageIntro eyebrow="Sales Order detail" title="Record not found" description="The selected Sales Order is not available for this distributor account." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Sales Order detail"
        title={order.documentNumberOrder || order.id}
        description={order.remarks || order.notes || "ERPNext Sales Order detail for distributor review."}
        actions={<Badge tone={order.status === "Delivered" ? "green" : order.status === "Pending Approval" ? "amber" : "blue"}>{order.status}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Customer", value: order.customerName || "Pending sync" },
              { label: "Posting date", value: order.postingDate || "-" },
              { label: "Delivery date", value: order.expectedDeliveryDate || order.deliveryDate || "-" },
              { label: "Ship to address", value: order.shipTo || "Pending sync" },
              { label: "Line items", value: `${order.items?.length || 0} items` },
              { label: "Grand total", value: order.grandTotal || "-" },
            ]}
          />
        </Surface>

        <Surface className="p-6">
          <p className="mb-4 text-sm font-semibold text-slate-900">Sales Order items</p>
          <div className="space-y-3">
            {(order.items || []).map((line, index) => (
              <div key={line.itemCode || line.itemName || index} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{line.itemName}</p>
                    <p className="mt-1 text-sm text-slate-500">{line.itemCode || "Item code pending"} | {line.quantity} qty at {line.unitPrice}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{line.totalAmount}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <StatePanel tone="blue" title="Available actions" description="Use this order to manage repeat purchase, dispatch follow-up, and document access." />
          </div>
        </Surface>
      </div>
    </div>
  );
}
