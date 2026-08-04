"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DistributorListFilters from "@/components/distributor/DistributorListFilters";
import { ActionLink, Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorDispatchPage() {
  const { data } = useDistributorAppData();
  const dispatches = data.dispatches || [];
  const complaints = data.complaints || [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const visibleDispatches = useMemo(() => dispatches.filter((dispatch) => {
    const haystack = [dispatch.documentNumberDelivery, dispatch.id, dispatch.salesOrder, dispatch.order, dispatch.vehicleNumber, dispatch.vehicle].join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!status || dispatch.status === status);
  }), [dispatches, query, status]);
  const statuses = [...new Set(dispatches.map((dispatch) => dispatch.status).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Delivery Notes"
        title="Dispatch and complaints"
        description="Track ERPNext Delivery Notes and raise or follow invoice/delivery issues in one operational support workspace."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Shipment updates"
          caption="Each shipment record includes status, vehicle, and delivery follow-up visibility."
        />
        <div className="mb-4"><DistributorListFilters query={query} onQueryChange={setQuery} placeholder="Search delivery note, order, or vehicle" filterLabel="All delivery statuses" filterValue={status} onFilterChange={setStatus} filterOptions={statuses} /></div>
        {!dispatches.length ? <p className="mb-4 text-sm text-slate-500">No ERPNext Delivery Note records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Delivery Note" },
            { key: "salesOrder", label: "Sales Order" },
            { key: "vehicle", label: "Vehicle No" },
            { key: "deliveryDate", label: "Delivery Date" },
            { key: "status", label: "Status" },
          ]}
          rows={visibleDispatches.map((dispatch) => ({
            salesOrder: dispatch.salesOrder || dispatch.order || "-",
            vehicle: dispatch.vehicleNumber || dispatch.vehicle || "-",
            deliveryDate: dispatch.deliveryDate || dispatch.eta || "-",
            id: (
              <Link href={`/distributor/dispatch/${dispatch.documentNumberDelivery || dispatch.id}`} className="font-semibold text-[#105B92] hover:underline">
                {dispatch.documentNumberDelivery || dispatch.id}
              </Link>
            ),
            status: <Badge tone={dispatch.status === "Delivered" ? "green" : "blue"}>{dispatch.status}</Badge>,
          }))}
        />
      </Surface>

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Complaints and delivery issues" caption="Complaints remain linked to their Sales Invoice while being accessible beside dispatch tracking." action={<ActionLink href="/distributor/complaints/new" tone="dark">Raise complaint</ActionLink>} />
        {!complaints.length ? <p className="mb-4 text-sm text-slate-500">No complaints have been raised for this distributor yet.</p> : null}
        <DataTable
          columns={[{ key: "id", label: "Complaint" }, { key: "invoice", label: "Sales Invoice" }, { key: "type", label: "Issue Type" }, { key: "status", label: "Status" }]}
          rows={complaints.map((complaint) => ({
            id: <Link href={`/distributor/complaints/${complaint.complaintNumber || complaint.id}`} className="font-semibold text-[#105B92] hover:underline">{complaint.complaintNumber || complaint.id}</Link>,
            invoice: complaint.invoiceNumber || "-",
            type: complaint.complaintType || "-",
            status: <Badge tone={complaint.status === "Resolved" ? "green" : "amber"}>{complaint.status || "Open"}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
