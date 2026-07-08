"use client";

import { useParams } from "next/navigation";
import { DispatchFeedbackDesk } from "@/components/distributor/DistributorInteractiveForms";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { Badge, KeyValueGrid, PageIntro, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorDispatchDetailPage() {
  const params = useParams();
  const { data } = useDistributorAppData();
  const dispatch = (data.dispatches || []).find((item) => String(item.documentNumberDelivery || item.id) === String(params.id));

  if (!dispatch) {
    return (
      <div className="space-y-6">
        <PageIntro eyebrow="Delivery Note detail" title="Record not found" description="The selected Delivery Note is not available for this distributor account." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Delivery Note detail" title={dispatch.documentNumberDelivery || dispatch.id} description="ERPNext Delivery Note detail helps distributors track vehicle movement, contact details, and delivery feedback on the move." actions={<Badge tone={dispatch.status === "Delivered" ? "green" : "blue"}>{dispatch.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Sales Order", value: dispatch.salesOrder || dispatch.order || "-" },
              { label: "Delivery date", value: dispatch.deliveryDate || dispatch.eta || "-" },
              { label: "Vehicle no", value: dispatch.vehicleNumber || dispatch.vehicle || "-" },
              { label: "Driver", value: dispatch.driver || "-" },
              { label: "Contact", value: dispatch.contact || "-" },
              { label: "POD", value: "Available after delivery confirmation" },
            ]}
          />
        </Surface>
        <Surface className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Dispatch review</h2>
            <p className="mt-1 text-sm text-slate-500">Working distributor feedback flow for all ok or issue-based dispatch response.</p>
          </div>
          <DispatchFeedbackDesk dispatchId={dispatch.documentNumberDelivery || dispatch.id} />
        </Surface>
      </div>
    </div>
  );
}
