"use client";

import Link from "next/link";
import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorDispatchPage() {
  const { data } = useDistributorAppData();
  const dispatches = data.dispatches || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Delivery Notes"
        title="Dispatch and delivery tracking"
        description="View ERPNext Delivery Note progress, vehicle details, delivery contact, and expected arrival without opening the full order history."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Shipment updates"
          caption="Each shipment record includes status, vehicle, and delivery follow-up visibility."
        />
        {!dispatches.length ? <p className="mb-4 text-sm text-slate-500">No ERPNext Delivery Note records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Delivery Note" },
            { key: "salesOrder", label: "Sales Order" },
            { key: "vehicle", label: "Vehicle No" },
            { key: "deliveryDate", label: "Delivery Date" },
            { key: "status", label: "Status" },
          ]}
          rows={dispatches.map((dispatch) => ({
            salesOrder: dispatch.salesOrder || dispatch.order || "-",
            vehicle: dispatch.vehicleNumber || dispatch.vehicle || "-",
            deliveryDate: dispatch.deliveryDate || dispatch.eta || "-",
            id: (
              <Link href={`/distributor/dispatch/${dispatch.documentNumberDelivery || dispatch.id}`} className="font-semibold text-[#105B92] hover:underline">
                {dispatch.documentNumberDelivery || dispatch.id}
              </Link>
            ),
            status: <Badge tone={dispatch.status === "Delivered" ? "green" : "blue"}>{dispatch.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
