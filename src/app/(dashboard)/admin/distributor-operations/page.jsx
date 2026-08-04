"use client";

import { useEffect, useMemo, useState } from "react";
import DistributorSelect from "@/components/distributor/DistributorSelect";

const statusOptions = {
  complaint: ["Open", "Under Review", "Resolved"],
  materialRequest: ["Submitted", "In Review", "Approved", "Rejected"],
  paymentUpdate: ["Submitted", "Acknowledged"],
  dispatchReview: ["Submitted", "Reviewed"],
};

function toneClass(value) {
  if (value === "Synced" || value === "Resolved" || value === "Approved" || value === "Acknowledged" || value === "Reviewed") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (value === "Failed" || value === "Rejected") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-amber-100 text-amber-700";
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  );
}

function Badge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass(value)}`}>{value}</span>;
}

function TableSection({ title, rows, onStatusChange, savingKey }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Distributor</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Summary</th>
              <th className="px-4 py-3 font-medium">Workflow</th>
              <th className="px-4 py-3 font-medium">Owner / Notes</th>
              <th className="px-4 py-3 font-medium">ERP Sync</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = `${row.type}:${row.number}`;
              return (
                <tr key={key} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-semibold text-blue-700">{row.number}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{row.distributor}</div>
                    <div className="text-xs text-gray-500">{row.distributorCode}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.user}</td>
                  <td className="px-4 py-3 text-gray-700">{row.primaryRef}</td>
                  <td className="px-4 py-3 text-gray-700">{row.summary}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <DistributorSelect value={row.status} onChange={(value) => onStatusChange(row.type, row.number, { status: value })} options={statusOptions[row.type] || [row.status]} aria-label={`Workflow status for ${row.number}`} />
                      {row.type === "complaint" ? (
                        <input
                          value={row.linkedCreditNoteNumber || ""}
                          onChange={(e) => onStatusChange(row.type, row.number, { linkedCreditNoteNumber: e.target.value }, true)}
                          placeholder="Credit note no."
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <input
                        value={row.internalOwner || ""}
                        onChange={(e) => onStatusChange(row.type, row.number, { internalOwner: e.target.value }, true)}
                        placeholder="Internal owner"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      <textarea
                        value={row.adminNotes || ""}
                        onChange={(e) => onStatusChange(row.type, row.number, { adminNotes: e.target.value }, true)}
                        placeholder="Admin notes"
                        rows={2}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      <button onClick={() => onStatusChange(row.type, row.number, row)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
                        {savingKey === key ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Badge value={row.erpSyncStatus} />
                      {row.erpSyncReference ? <div className="text-xs text-gray-500">{row.erpSyncReference}</div> : null}
                    </div>
                  </td>
                <td className="px-4 py-3 text-gray-700">{row.updatedAt}</td>
              </tr>
            );
          })}
            {!rows.length ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">No records found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DistributorOperationsPage() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState({ total: 0, complaints: 0, materialRequests: 0, paymentUpdates: 0, dispatchReviews: 0, failedSync: 0 });
  const [records, setRecords] = useState({ complaints: [], materialRequests: [], paymentUpdates: [], dispatchReviews: [] });

  async function loadData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("distributor-admin-token");
      const res = await fetch("/api/distributor/admin/operations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load records");
      setSummary(data.summary || {});
      setRecords(data.records || {});
    } catch (error) {
      setMessage(error.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onStatusChange(type, number, patch, localOnly = false) {
    const key = `${type}:${number}`;
    if (localOnly) {
      setRecords((current) => {
        const next = { ...current };
        for (const section of Object.keys(next)) {
          next[section] = (next[section] || []).map((row) =>
            row.type === type && row.number === number ? { ...row, ...patch } : row
          );
        }
        return next;
      });
      return;
    }

    try {
      setSavingKey(key);
      setMessage("");
      const token = localStorage.getItem("distributor-admin-token");
      const res = await fetch("/api/distributor/admin/operations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, number, ...patch }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setMessage(data.message || "Status updated");
      setRecords((current) => {
        const next = { ...current };
        for (const section of Object.keys(next)) {
          next[section] = (next[section] || []).map((row) =>
            row.type === type && row.number === number ? { ...row, ...patch } : row
          );
        }
        return next;
      });
    } catch (error) {
      setMessage(error.message || "Failed to update status");
    } finally {
      setSavingKey("");
    }
  }

  const allCount = useMemo(() => summary.total || 0, [summary]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Distributor workflow review</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">
          Review complaints, stock requests, payment updates, and dispatch feedback submitted from the distributor app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total" value={allCount} note="All distributor workflow records" />
        <StatCard label="Complaints" value={summary.complaints || 0} note="Invoice-linked issues" />
        <StatCard label="Stock Requests" value={summary.materialRequests || 0} note="Material request submissions" />
        <StatCard label="Payment Updates" value={summary.paymentUpdates || 0} note="Finance follow-ups" />
        <StatCard label="Failed Sync" value={summary.failedSync || 0} note="Needs ERPNext attention" />
      </div>

      {message ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div> : null}
      {loading ? <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">Loading distributor workflow records...</div> : null}

      <TableSection title="Complaints" rows={records.complaints || []} onStatusChange={onStatusChange} savingKey={savingKey} />
      <TableSection title="Stock Requests" rows={records.materialRequests || []} onStatusChange={onStatusChange} savingKey={savingKey} />
      <TableSection title="Payment Updates" rows={records.paymentUpdates || []} onStatusChange={onStatusChange} savingKey={savingKey} />
      <TableSection title="Dispatch Reviews" rows={records.dispatchReviews || []} onStatusChange={onStatusChange} savingKey={savingKey} />
    </div>
  );
}
