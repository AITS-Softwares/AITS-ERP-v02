import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { creditNotes } from "@/components/distributor/mockData";

export default function DistributorCreditNotesPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Credit note module"
        title="Credit notes and adjustment status"
        description="Credit note visibility helps the distributor connect complaints, invoice adjustments, and ledger impact in one place."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Credit note tracker" caption="Useful for finance follow-up and complaint resolution." />
        <DataTable
          columns={[
            { key: "id", label: "Credit note" },
            { key: "against", label: "Against invoice" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
            { key: "date", label: "Date" },
          ]}
          rows={creditNotes.map((note) => ({
            ...note,
            status: <Badge tone={note.status === "Issued" ? "blue" : "green"}>{note.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
