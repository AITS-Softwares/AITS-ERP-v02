import Link from "next/link";
import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { dispatches } from "@/components/distributor/mockData";

export default function DistributorDispatchPage() {
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Phase 2 - Dispatch module" title="Dispatch and delivery tracking" description="Dispatch status, vehicle details, and ETA should be immediately visible without drilling into a long transaction history." />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Shipment updates" caption="This phase adds a detail screen for driver and contact visibility on mobile." />
        {!dispatches.length ? <p className="mb-4 text-sm text-slate-500">No dispatch records are available yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Dispatch" },
            { key: "order", label: "Order" },
            { key: "vehicle", label: "Vehicle" },
            { key: "eta", label: "ETA" },
            { key: "status", label: "Status" },
          ]}
          rows={dispatches.map((dispatch) => ({
            ...dispatch,
            id: <Link href={`/distributor/dispatch/${dispatch.id}`} className="font-semibold text-[#105B92] hover:underline">{dispatch.id}</Link>,
            status: <Badge tone={dispatch.status === "Delivered" ? "green" : "blue"}>{dispatch.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
