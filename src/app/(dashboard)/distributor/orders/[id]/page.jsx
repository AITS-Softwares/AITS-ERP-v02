import { notFound } from "next/navigation";
import { Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { cartLines, getOrderById } from "@/components/distributor/mockData";

export default function DistributorOrderDetailPage({ params }) {
  const order = getOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Order detail" title={order.id} description={order.notes} actions={<Badge tone={order.status === "Delivered" ? "green" : order.status === "Pending Approval" ? "amber" : "blue"}>{order.status}</Badge>} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Order date", value: order.date },
              { label: "Ship to", value: order.shipTo },
              { label: "Payment mode", value: order.paymentMode },
              { label: "Line items", value: `${order.items} items` },
              { label: "Order amount", value: order.amount },
              { label: "Route", value: "West Urban Belt" },
            ]}
          />
        </Surface>

        <Surface className="p-6">
          <p className="mb-4 text-sm font-semibold text-slate-900">Order lines</p>
          <div className="space-y-3">
            {cartLines.map((line) => (
              <div key={line.name} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{line.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{line.qty} units at {line.rate}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{line.total}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <StatePanel tone="blue" title="Next step" description="This screen is ready for future actions like reorder, download order copy, and dispatch tracking." />
          </div>
        </Surface>
      </div>
    </div>
  );
}
