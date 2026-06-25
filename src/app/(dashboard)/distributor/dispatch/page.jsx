import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { dispatches } from "@/components/distributor/mockData";

export default function DistributorDispatchPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dispatch module"
        title="Dispatch and delivery tracking"
        description="Dispatch status, vehicle details, and ETA should be immediately visible without drilling into a long transaction history."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Shipment updates" caption="This can later expand into a timeline with proof-of-delivery and contact actions." />
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
            status: <Badge tone={dispatch.status === "Delivered" ? "green" : "blue"}>{dispatch.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
