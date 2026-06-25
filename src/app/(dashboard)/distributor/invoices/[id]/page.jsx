import { notFound } from "next/navigation";
import { Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { getInvoiceById } from "@/components/distributor/mockData";

export default function DistributorInvoiceDetailPage({ params }) {
  const invoice = getInvoiceById(params.id);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Invoice detail" title={invoice.id} description="Single invoice review with amount, balance, due date, and complaint handoff." actions={<Badge tone={invoice.status === "Overdue" ? "red" : invoice.status === "Part Paid" ? "amber" : "blue"}>{invoice.status}</Badge>} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Invoice date", value: invoice.date },
              { label: "Linked order", value: invoice.orderId },
              { label: "Invoice value", value: invoice.amount },
              { label: "Outstanding balance", value: invoice.balance },
              { label: "Due date", value: invoice.due },
              { label: "PDF document", value: "Available after invoice sync" },
            ]}
          />
        </Surface>
        <Surface className="p-6">
          <StatePanel tone={invoice.status === "Overdue" ? "amber" : "blue"} title="Action zone" description="Next pass can place download PDF, share invoice, pay now, and raise complaint actions here." />
        </Surface>
      </div>
    </div>
  );
}
