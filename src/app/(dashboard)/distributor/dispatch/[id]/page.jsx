import { notFound } from "next/navigation";
import { DispatchFeedbackDesk } from "@/components/distributor/DistributorInteractiveForms";
import { Badge, KeyValueGrid, PageIntro, Surface } from "@/components/distributor/DistributorUI";
import { getDispatchById } from "@/components/distributor/mockData";

export default function DistributorDispatchDetailPage({ params }) {
  const dispatch = getDispatchById(params.id);
  if (!dispatch) notFound();

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Dispatch detail" title={dispatch.id} description="Dispatch detail is important in the mobile app because users often check driver and ETA while on the move." actions={<Badge tone={dispatch.status === "Delivered" ? "green" : "blue"}>{dispatch.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Order", value: dispatch.order },
              { label: "Vehicle", value: dispatch.vehicle },
              { label: "Driver", value: dispatch.driver },
              { label: "Contact", value: dispatch.contact },
              { label: "ETA", value: dispatch.eta },
              { label: "POD", value: "Available after delivery confirmation" },
            ]}
          />
        </Surface>
        <Surface className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Dispatch review</h2>
            <p className="mt-1 text-sm text-slate-500">Working distributor feedback flow for all ok or issue-based dispatch response.</p>
          </div>
          <DispatchFeedbackDesk dispatchId={dispatch.id} />
        </Surface>
      </div>
    </div>
  );
}
