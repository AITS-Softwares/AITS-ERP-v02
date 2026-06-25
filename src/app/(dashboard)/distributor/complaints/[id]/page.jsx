import { notFound } from "next/navigation";
import { Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { getComplaintById } from "@/components/distributor/mockData";

export default function DistributorComplaintDetailPage({ params }) {
  const complaint = getComplaintById(params.id);
  if (!complaint) notFound();

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Complaint detail" title={complaint.id} description="A focused claim view helps distributors understand ownership and the next follow-up point." actions={<Badge tone={complaint.status === "Resolved" ? "green" : "amber"}>{complaint.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Invoice", value: complaint.invoice },
              { label: "Type", value: complaint.type },
              { label: "Priority", value: complaint.priority },
              { label: "Assigned to", value: complaint.owner },
              { label: "Last updated", value: complaint.updated },
              { label: "Attachment state", value: "Available after document upload is enabled" },
            ]}
          />
        </Surface>
        <Surface className="p-6">
          <StatePanel tone="blue" title="Resolution trail" description="Next pass can place comments, attachment history, and final credit note linkage here." />
        </Surface>
      </div>
    </div>
  );
}
