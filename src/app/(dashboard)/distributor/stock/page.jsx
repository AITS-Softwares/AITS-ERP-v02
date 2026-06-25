import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { stockItems } from "@/components/distributor/mockData";

export default function DistributorStockPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Stock module"
        title="Live stock and warehouse visibility"
        description="This screen will help distributors see availability before ordering and raise stock requests where supply is tight."
        actions={<ActionLink href="/distributor/stock/request">Request stock</ActionLink>}
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Warehouse stock" caption="Designed to remain readable on smaller devices using horizontally scrollable rows." />
        <DataTable
          columns={[
            { key: "item", label: "Item" },
            { key: "warehouse", label: "Warehouse" },
            { key: "available", label: "Available" },
            { key: "reserved", label: "Reserved" },
            { key: "status", label: "Status" },
          ]}
          rows={stockItems.map((item) => ({
            ...item,
            status: <Badge tone={item.status === "Healthy" ? "green" : item.status === "Watch" ? "amber" : "red"}>{item.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
