import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { invoices } from "@/components/distributor/mockData";

export default function DistributorInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Invoice module"
        title="Invoices and PDF access"
        description="Invoice list, detail preview, and future PDF download actions live here. The layout is optimized for quick lookup on mobile."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Invoice listing" caption="Later we can add filters for paid, unpaid, due this week, and invoice-wise complaints." />
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
            status: <Badge tone={invoice.status === "Open" ? "blue" : invoice.status === "Overdue" ? "red" : "amber"}>{invoice.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
