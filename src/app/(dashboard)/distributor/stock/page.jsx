"use client";

import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorStockPage() {
  const { data } = useDistributorAppData();
  const stockItems = data.stockItems || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Stock"
        title="Live stock and warehouse visibility"
        description="Review ERPNext stock visibility by item and warehouse, including actual, reserved, and projected quantity fields."
        actions={<ActionLink href="/distributor/stock/request">Request stock</ActionLink>}
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Warehouse stock"
          caption="Warehouse-wise quantities stay visible across desktop and mobile layouts."
        />
        {!stockItems.length ? <p className="mb-4 text-sm text-slate-500">No stock records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "itemCode", label: "Item Code" },
            { key: "warehouse", label: "Warehouse" },
            { key: "actualQty", label: "Actual Qty" },
            { key: "reservedQty", label: "Reserved Qty" },
            { key: "projectedQty", label: "Projected Qty" },
            { key: "status", label: "Status" },
          ]}
          rows={stockItems.map((item) => ({
            itemCode: item.itemCode || item.item || "-",
            warehouse: item.warehouseCode || item.warehouse || "-",
            actualQty: item.actualQty ?? item.available ?? "-",
            reservedQty: item.reservedQty ?? item.reserved ?? "-",
            projectedQty: item.projectedQty ?? "-",
            status: <Badge tone={item.status === "Healthy" ? "green" : item.status === "Watch" ? "amber" : "red"}>{item.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
