import Link from "next/link";
import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { invoices } from "@/components/distributor/mockData";

export default function DistributorInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Phase 2 - Invoice module" title="Invoices and PDF access" description="Invoice list, detail view, and future PDF download actions live here. This phase adds detail drill-down for a more complete finance flow." />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Invoice listing" caption="Later we can add filters for paid, unpaid, due this week, and invoice-wise complaints." />
        {!invoices.length ? <p className="mb-4 text-sm text-slate-500">No invoices are available yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Invoice" },
            { key: "date", label: "Date" },
            { key: "amount", label: "Amount" },
            { key: "due", label: "Due date" },
            { key: "status", label: "Status" },
          ]}
          rows={invoices.map((invoice) => ({
            ...invoice,
            id: <Link href={`/distributor/invoices/${invoice.id}`} className="font-semibold text-[#105B92] hover:underline">{invoice.id}</Link>,
            status: <Badge tone={invoice.status === "Open" ? "blue" : invoice.status === "Overdue" ? "red" : "amber"}>{invoice.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
