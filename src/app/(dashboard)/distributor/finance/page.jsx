import { FinancePaymentDesk } from "@/components/distributor/DistributorInteractiveForms";
import { Badge, DataTable, PageIntro, SectionHeading, StatGrid, Surface } from "@/components/distributor/DistributorUI";
import { financeSummary, ledgerEntries } from "@/components/distributor/mockData";

export default function DistributorFinancePage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Finance module"
        title="Outstanding, ledger, and payments"
        description="This screen keeps the finance view simple for a distributor: balance health, payment history, and ledger movement."
      />

      <StatGrid items={financeSummary} />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Ledger statement" caption="Good candidate for PDF export and filter controls in the next pass." />
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "ref", label: "Reference" },
            { key: "type", label: "Type" },
            { key: "amount", label: "Amount" },
            { key: "balance", label: "Balance" },
          ]}
          rows={ledgerEntries.map((entry) => ({
            ...entry,
            type: <Badge tone={entry.type === "Payment" ? "green" : entry.type === "Credit Note" ? "amber" : "blue"}>{entry.type}</Badge>,
          }))}
        />
      </Surface>

      <FinancePaymentDesk />
    </div>
  );
}
