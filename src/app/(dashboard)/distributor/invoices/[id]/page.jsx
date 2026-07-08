"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { downloadDistributorFile } from "@/lib/distributorClientDownloads";

export default function DistributorInvoiceDetailPage() {
  const params = useParams();
  const { data } = useDistributorAppData();
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const invoice = (data.invoices || []).find((item) => String(item.invoiceNumber || item.id) === String(params.id));

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageIntro eyebrow="Sales Invoice detail" title="Record not found" description="The selected Sales Invoice is not available for this distributor account." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Sales Invoice detail" title={invoice.invoiceNumber || invoice.id} description="Single invoice review with posting date, outstanding amount, due date, and complaint handoff." actions={<Badge tone={(invoice.paymentStatus || invoice.status) === "Overdue" ? "red" : (invoice.paymentStatus || invoice.status) === "Partial" ? "amber" : "blue"}>{invoice.paymentStatus || invoice.status}</Badge>} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Posting date", value: invoice.postingDate || "-" },
              { label: "Sales Order", value: invoice.salesOrder || "-" },
              { label: "Grand total", value: invoice.grandTotal || "-" },
              { label: "Outstanding amount", value: invoice.remainingAmount || invoice.balance || "-" },
              { label: "Due date", value: invoice.dueDate || "-" },
              { label: "Document files", value: `${(invoice.attachments || []).length} attached file(s)` },
            ]}
          />
        </Surface>
        <Surface className="p-6">
          <div className="space-y-4">
            <StatePanel tone={(invoice.paymentStatus || invoice.status) === "Overdue" ? "amber" : "blue"} title="Action zone" description="Download the invoice summary and review any attached document files linked to this invoice." />
            <button
              type="button"
              onClick={async () => {
                try {
                  setDownloading(true);
                  setStatus("");
                  await downloadDistributorFile(`/api/distributor/invoices/${invoice.invoiceNumber || invoice.id}/download`, `${invoice.invoiceNumber || invoice.id}.pdf`);
                  setStatus("Invoice summary downloaded successfully.");
                } catch (error) {
                  setStatus(error.message || "Failed to download invoice summary");
                } finally {
                  setDownloading(false);
                }
              }}
              className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
            >
              {downloading ? "Downloading..." : "Download invoice PDF"}
            </button>
            {(invoice.attachments || []).length ? (
              <div className="space-y-2">
                {(invoice.attachments || []).map((attachment) => (
                  <a key={attachment.id} href={attachment.fileUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-[#105B92] hover:bg-slate-50">
                    {attachment.fileName}
                  </a>
                ))}
              </div>
            ) : null}
            {status ? <StatePanel tone="blue" title="Download status" description={status} /> : null}
          </div>
        </Surface>
      </div>
    </div>
  );
}
