"use client";

import { useParams } from "next/navigation";
import { WorkflowAttachmentUploader } from "@/components/distributor/DistributorInteractiveForms";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import DistributorSyncRetryButton from "@/components/distributor/DistributorSyncRetryButton";
import { Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorComplaintDetailPage() {
  const params = useParams();
  const { data } = useDistributorAppData();
  const complaint = (data.complaints || []).find((item) => String(item.complaintNumber || item.id) === String(params.id));

  if (!complaint) {
    return (
      <div className="space-y-6">
        <PageIntro eyebrow="Complaint detail" title="Record not found" description="The selected complaint is not available for this distributor account." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Complaint detail" title={complaint.complaintNumber || complaint.id} description="A focused claim view helps distributors understand the linked Sales Invoice, assigned team, and next follow-up point." actions={<Badge tone={complaint.status === "Resolved" ? "green" : "amber"}>{complaint.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Sales Invoice", value: complaint.invoice },
              { label: "Delivery Note", value: complaint.deliveryNote || "-" },
              { label: "Issue type", value: complaint.type },
              { label: "Priority", value: complaint.priority },
              { label: "Assigned team", value: complaint.owner },
              { label: "Last updated", value: complaint.updated },
              { label: "ERP sync status", value: complaint.erpSyncStatus || "Pending" },
              { label: "ERP reference", value: complaint.erpSyncReference || "-" },
              { label: "Credit note", value: complaint.linkedCreditNoteNumber || "-" },
              { label: "Support files", value: `${(complaint.attachments || []).length} attached file(s)` },
            ]}
          />
          {(complaint.attachments || []).length ? (
            <div className="mt-4 space-y-2">
              {(complaint.attachments || []).map((attachment) => (
                <a key={attachment.id} href={attachment.fileUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-[#105B92] hover:bg-slate-50">
                  {attachment.fileName}
                </a>
              ))}
            </div>
          ) : null}
        </Surface>
        <Surface className="p-6">
          <div className="space-y-4">
            <StatePanel tone={complaint.erpSyncStatus === "Synced" ? "blue" : "amber"} title="Resolution trail" description={complaint.erpSyncMessage || complaint.adminNotes || "Workflow updates appear here as the team reviews the issue."} />
            <WorkflowAttachmentUploader type="complaint" number={complaint.complaintNumber || complaint.id} />
            <div className="space-y-3">
              {(complaint.history || []).length ? (
                complaint.history.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{event.title}</p>
                      <span className="text-xs text-slate-400">{event.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{event.actorLabel}</p>
                    {event.description ? <p className="mt-2 text-sm text-slate-600">{event.description}</p> : null}
                  </div>
                ))
              ) : (
                <StatePanel tone="slate" title="No activity yet" description="Workflow events will appear here once the complaint is reviewed or updated." />
              )}
            </div>
            {complaint.erpSyncStatus !== "Synced" ? <DistributorSyncRetryButton type="complaint" number={complaint.complaintNumber || complaint.id} /> : null}
          </div>
        </Surface>
      </div>
    </div>
  );
}
