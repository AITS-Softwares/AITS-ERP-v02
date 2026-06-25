import Link from "next/link";
import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { complaints } from "@/components/distributor/mockData";

export default function DistributorComplaintsPage() {
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Phase 2 - Complaint module" title="Invoice complaints and tracking" description="This phase adds detail drill-down so each claim can later hold comments, evidence, and credit note linkage." actions={<ActionLink href="/distributor/complaints/new">Raise complaint</ActionLink>} />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Complaint tracker" caption="Clean status tracking for distributor and support teams." />
        {!complaints.length ? <p className="mb-4 text-sm text-slate-500">No complaints are available yet.</p> : null}
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
            id: <Link href={`/distributor/complaints/${item.id}`} className="font-semibold text-[#105B92] hover:underline">{item.id}</Link>,
            status: <Badge tone={item.status === "Resolved" ? "green" : "amber"}>{item.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
