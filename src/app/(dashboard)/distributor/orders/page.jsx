"use client";

import Link from "next/link";
import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, StatGrid, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorOrdersPage() {
  const { data } = useDistributorAppData();
  const orders = data.orders || [];
  const orderStats = [
    { label: "Open Sales Orders", value: String(orders.length), change: "Distributor-linked orders" },
    { label: "Pending Approval", value: String(orders.filter((order) => order.status === "Pending Approval").length), change: "Commercial review" },
    { label: "Delivery In Progress", value: String(orders.filter((order) => ["Ready To Dispatch", "Dispatched"].includes(order.status)).length), change: "Delivery note planning active" },
    { label: "Completed", value: String(orders.filter((order) => order.status === "Delivered").length), change: "Closed Sales Orders" },
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Sales Orders"
        title="Order history and reordering"
        description="Track ERPNext Sales Orders, review posting and delivery dates, and reopen repeat purchases from a single workflow."
        actions={<ActionLink href="/distributor/orders/new">Open checkout</ActionLink>}
      />

      <StatGrid items={orderStats} />

      {!orders.length ? (
        <Surface className="p-5 sm:p-6">
          <p className="text-sm text-slate-500">No ERPNext Sales Order records are available for this distributor yet.</p>
        </Surface>
      ) : null}

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Recent order timeline"
          caption="Review recent orders with status, quantity, and value in a compact mobile-friendly layout."
        />
        <DataTable
          columns={[
            { key: "id", label: "Sales Order" },
            { key: "postingDate", label: "Posting Date" },
            { key: "deliveryDate", label: "Delivery Date" },
            { key: "status", label: "Status" },
            { key: "grandTotal", label: "Grand Total" },
          ]}
          rows={orders.map((order) => ({
            ...order,
            postingDate: order.postingDate || order.date || "-",
            deliveryDate: order.expectedDeliveryDate || order.deliveryDate || "-",
            grandTotal: order.grandTotal || order.amount || "-",
            id: (
              <Link href={`/distributor/orders/${order.documentNumberOrder || order.id}`} className="font-semibold text-[#105B92] hover:underline">
                {order.documentNumberOrder || order.id}
              </Link>
            ),
            status: (
              <Badge tone={order.status === "Delivered" ? "green" : order.status === "Pending Approval" ? "amber" : "blue"}>
                {order.status}
              </Badge>
            ),
          }))}
        />
      </Surface>
    </div>
  );
}
