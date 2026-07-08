"use client";

import Link from "next/link";
import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorComplaintsPage() {
  const { data } = useDistributorAppData();
  const complaints = data.complaints || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Complaints"
        title="Invoice complaints and tracking"
        description="Raise Sales Invoice-linked complaints and track their review, remarks, credit note linkage, and resolution status."
        actions={<ActionLink href="/distributor/complaints/new">Raise complaint</ActionLink>}
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Complaint tracker" caption="Clean status tracking for distributor and support teams." />
        {!complaints.length ? <p className="mb-4 text-sm text-slate-500">No complaint records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Complaint ID" },
            { key: "invoice", label: "Sales Invoice" },
            { key: "type", label: "Issue Type" },
            { key: "status", label: "Status" },
            { key: "sync", label: "ERP Sync" },
            { key: "updated", label: "Updated" },
          ]}
          rows={complaints.map((item) => ({
            ...item,
            id: (
              <Link href={`/distributor/complaints/${item.complaintNumber || item.id}`} className="font-semibold text-[#105B92] hover:underline">
                {item.complaintNumber || item.id}
              </Link>
            ),
            status: <Badge tone={item.status === "Resolved" ? "green" : "amber"}>{item.status}</Badge>,
            sync: <Badge tone={item.erpSyncStatus === "Synced" ? "green" : item.erpSyncStatus === "Failed" ? "red" : "blue"}>{item.erpSyncStatus || "Pending"}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
