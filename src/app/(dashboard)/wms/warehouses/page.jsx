"use client";

import WmsMasterTable from "@/components/wms/WmsMasterTable";

export default function WmsWarehousesPage() {
  return <WmsMasterTable title="Warehouses" description="Live warehouses from ERPNext. WMS does not create a duplicate warehouse list, so every stock transaction will use the same ERPNext location." resource="warehouses" columns={[{ label: "Warehouse", key: "warehouse_name" }, { label: "Company", key: "company" }, { label: "Parent Warehouse", key: "parent_warehouse" }, { label: "Type", render: (row) => row.is_group ? "Group" : "Storage" }, { label: "ERPNext Name", key: "name" }]} />;
}
