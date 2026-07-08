"use client";

import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorCreditNotesPage() {
  const { data } = useDistributorAppData();
  const creditNotes = data.creditNotes || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Credit Notes"
        title="Credit notes and adjustment status"
        description="Track ERPNext Credit Note records, linked Sales Invoices, and adjustment status in one finance view."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Credit note tracker"
          caption="Credit note records remain visible alongside their status and invoice reference."
        />
        {!creditNotes.length ? <p className="mb-4 text-sm text-slate-500">No Credit Note records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Credit note" },
            { key: "against", label: "Against invoice" },
            { key: "postingDate", label: "Posting Date" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
          ]}
          rows={creditNotes.map((note) => ({
            ...note,
            postingDate: note.postingDate || note.date || "-",
            status: <Badge tone={note.status === "Issued" ? "blue" : "green"}>{note.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
