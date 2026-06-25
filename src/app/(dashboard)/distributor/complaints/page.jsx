import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { complaints } from "@/components/distributor/mockData";

export default function DistributorComplaintsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Complaint module"
        title="Invoice complaints and tracking"
        description="This screen covers misbilling, rate issues, short quantity, and follow-up status for claims linked to invoices."
        actions={<ActionLink href="/distributor/complaints/new">Raise complaint</ActionLink>}
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Complaint tracker" caption="Clean status tracking for distributor and support teams." />
        <DataTable
          columns={[
            { key: "id", label: "Complaint" },
            { key: "invoice", label: "Invoice" },
            { key: "type", label: "Type" },
            { key: "status", label: "Status" },
            { key: "updated", label: "Updated" },
          ]}
          rows={complaints.map((item) => ({
            ...item,
            status: <Badge tone={item.status === "Resolved" ? "green" : "amber"}>{item.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
