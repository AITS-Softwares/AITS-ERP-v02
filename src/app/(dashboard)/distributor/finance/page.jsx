"use client";

import { useState } from "react";
import Link from "next/link";
import { FinancePaymentDesk } from "@/components/distributor/DistributorInteractiveForms";
import { Badge, DataTable, PageIntro, SectionHeading, StatGrid, Surface } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { downloadDistributorFile, printDistributorInvoice } from "@/lib/distributorClientDownloads";

export default function DistributorFinancePage() {
  const { data } = useDistributorAppData();
  const financeSummary = data.financeSummary || [];
  const ledgerEntries = data.ledgerEntries || [];
  const paymentUpdates = data.paymentUpdates || [];
  const invoices = data.invoices || [];
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Finance"
        title="Finance and invoices"
        description="Monitor invoices, outstanding balance, ledger movement, and payment follow-up from one combined mobile workspace."
        actions={(
          <button
            type="button"
            onClick={async () => {
              try {
                setExporting(true);
                setStatus("");
                await downloadDistributorFile("/api/distributor/finance/statement", "distributor-statement.csv");
                setStatus("Ledger statement exported successfully.");
              } catch (error) {
                setStatus(error.message || "Failed to export statement");
              } finally {
                setExporting(false);
              }
            }}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#105B92]"
          >
            {exporting ? "Exporting..." : "Export statement"}
          </button>
        )}
      />

      <StatGrid items={financeSummary} />
      {status ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{status}</div> : null}

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Sales invoices" caption="Open an invoice for document download and its payment-related follow-up." />
        {!invoices.length ? <p className="mb-4 text-sm text-slate-500">No ERPNext Sales Invoice records are available for this distributor yet.</p> : null}
        <DataTable
          columns={[{ key: "id", label: "Sales Invoice" }, { key: "postingDate", label: "Posting Date" }, { key: "dueDate", label: "Due Date" }, { key: "outstanding", label: "Outstanding" }, { key: "status", label: "Payment Status" }, { key: "download", label: "PDF" }]}
          rows={invoices.map((invoice) => ({
            id: <Link href={`/distributor/invoices/${encodeURIComponent(invoice.invoiceNumber || invoice.id)}`} className="font-semibold text-[#105B92] hover:underline">{invoice.invoiceNumber || invoice.id}</Link>,
            postingDate: invoice.postingDate || invoice.date || "-",
            dueDate: invoice.dueDate || invoice.due || "-",
            outstanding: invoice.outstandingAmount || invoice.outstanding || "-",
            status: <Badge tone={(invoice.paymentStatus || invoice.status) === "Paid" ? "green" : (invoice.paymentStatus || invoice.status) === "Overdue" ? "red" : "amber"}>{invoice.paymentStatus || invoice.status || "Pending"}</Badge>,
            download: <button type="button" onClick={() => printDistributorInvoice(`/api/distributor/invoices/${encodeURIComponent(invoice.invoiceNumber || invoice.id)}/print`).catch((error) => setStatus(error.message || "Failed to open invoice print"))} className="text-sm font-semibold text-[#105B92] hover:underline">Print / Save PDF</button>,
          }))}
        />
      </Surface>

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Ledger statement"
          caption="Track invoice, payment, and credit note movement against the running balance."
        />
        {!ledgerEntries.length ? <p className="mb-4 text-sm text-slate-500">No customer ledger movement is available for this distributor yet.</p> : null}
        <DataTable
          columns={[
            { key: "date", label: "Posting Date" },
            { key: "ref", label: "Reference" },
            { key: "type", label: "Voucher Type" },
            { key: "amount", label: "Amount" },
            { key: "balance", label: "Running Balance" },
          ]}
          rows={ledgerEntries.map((entry) => ({
            ...entry,
            type: <Badge tone={entry.type === "Payment" ? "green" : entry.type === "Credit Note" ? "amber" : "blue"}>{entry.type}</Badge>,
          }))}
        />
      </Surface>

      <FinancePaymentDesk />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Recent payment updates"
          caption="Track distributor-submitted payment references and their ERPNext sync status."
        />
        {!paymentUpdates.length ? <p className="mb-4 text-sm text-slate-500">No payment updates have been submitted yet.</p> : null}
        <DataTable
          columns={[
            { key: "updateNumber", label: "Update No." },
            { key: "invoiceNumber", label: "Sales Invoice" },
            { key: "amount", label: "Amount" },
            { key: "paymentMode", label: "Mode" },
            { key: "status", label: "Workflow" },
            { key: "erpSyncStatus", label: "ERP Sync" },
          ]}
          rows={paymentUpdates.map((entry) => ({
            ...entry,
            status: <Badge tone={entry.status === "Acknowledged" ? "green" : "amber"}>{entry.status}</Badge>,
            erpSyncStatus: <Badge tone={entry.erpSyncStatus === "Synced" ? "green" : entry.erpSyncStatus === "Failed" ? "red" : "amber"}>{entry.erpSyncStatus}</Badge>,
          }))}
        />
      </Surface>
    </div>
  );
}
