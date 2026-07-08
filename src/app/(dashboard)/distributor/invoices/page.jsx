"use client";

import Link from "next/link";
import { Badge, DataTable, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

export default function DistributorInvoicesPage() {
  const { data } = useDistributorAppData();
  const invoices = data.invoices || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Sales Invoices"
        title="Invoices and document access"
        description="Review ERPNext Sales Invoices with posting date, due date, payment status, and outstanding amount from one screen."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Invoice listing"
          caption="Invoice records stay grouped by status, due date, and amount for faster finance review."
        />
        {!invoices.length ? <p className="mb-4 text-sm text-slate-500">No ERPNext Sales Invoice records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "id", label: "Sales Invoice" },
            { key: "postingDate", label: "Posting Date" },
            { key: "grandTotal", label: "Grand Total" },
            { key: "dueDate", label: "Due Date" },
            { key: "status", label: "Payment Status" },
          ]}
          rows={invoices.map((invoice) => ({
            postingDate: invoice.postingDate || invoice.date || "-",
            grandTotal: invoice.grandTotal || invoice.amount || "-",
            dueDate: invoice.dueDate || invoice.due || "-",
            id: (
              <Link href={`/distributor/invoices/${invoice.invoiceNumber || invoice.id}`} className="font-semibold text-[#105B92] hover:underline">
                {invoice.invoiceNumber || invoice.id}
              </Link>
            ),
            status: <Badge tone={(invoice.paymentStatus || invoice.status) === "Paid" ? "green" : (invoice.paymentStatus || invoice.status) === "Overdue" ? "red" : "amber"}>{invoice.paymentStatus || invoice.status}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
