"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DistributorListFilters from "@/components/distributor/DistributorListFilters";
import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorComplaintsPage() {
  const { data } = useDistributorAppData();
  const complaints = data.complaints || [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const visibleComplaints = useMemo(() => complaints.filter((complaint) => {
    const haystack = [complaint.complaintNumber, complaint.id, complaint.invoiceNumber, complaint.complaintType, complaint.remarks].join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!status || complaint.status === status);
  }), [complaints, query, status]);
  const statuses = [...new Set(complaints.map((complaint) => complaint.status).filter(Boolean))];

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
        <div className="mb-4"><DistributorListFilters query={query} onQueryChange={setQuery} placeholder="Search complaint, invoice, or issue type" filterLabel="All complaint statuses" filterValue={status} onFilterChange={setStatus} filterOptions={statuses} /></div>
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
          rows={visibleComplaints.map((item) => ({
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
