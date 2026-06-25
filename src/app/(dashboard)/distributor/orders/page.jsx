import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, StatGrid, Surface } from "@/components/distributor/DistributorUI";
import { orders } from "@/components/distributor/mockData";

const orderStats = [
  { label: "Draft Orders", value: "3", change: "Awaiting confirmation" },
  { label: "Pending Approval", value: "2", change: "Company side review" },
  { label: "Ready To Dispatch", value: "5", change: "Vehicle planning started" },
  { label: "Delivered This Week", value: "8", change: "On-time rate 96%" },
];

export default function DistributorOrdersPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Order module"
        title="Order history and reordering"
        description="This screen is meant for fast repeat ordering on mobile, with large status blocks and quick access to checkout."
        actions={<ActionLink href="/distributor/orders/new">Open checkout preview</ActionLink>}
      />

      <StatGrid items={orderStats} />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Recent order timeline" caption="The mobile version can stack these cards vertically without losing important status information." />
        <DataTable
          columns={[
            { key: "id", label: "Order ID" },
            { key: "date", label: "Placed On" },
            { key: "items", label: "Items" },
            { key: "status", label: "Status" },
            { key: "amount", label: "Amount" },
          ]}
          rows={orders.map((order) => ({
            ...order,
            status: <Badge tone={order.status === "Delivered" ? "green" : order.status === "Pending Approval" ? "amber" : "blue"}>{order.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
