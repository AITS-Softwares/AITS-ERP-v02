"use client";

import { useEffect, useState } from "react";

function toneClass(value) {
  if (value === "Synced") return "bg-emerald-100 text-emerald-700";
  if (value === "Failed") return "bg-rose-100 text-rose-700";
  if (value === "Not Configured") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-700";
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function DistributorSyncLogsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState({ total: 0, synced: 0, failed: 0, pending: 0, notConfigured: 0 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("distributor-admin-token");
        const res = await fetch("/api/distributor/admin/sync-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load logs");
        setSummary(data.summary || {});
        setLogs(data.logs || []);
      } catch (error) {
        setMessage(error.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Sync Logs</p>
        <h1 className="mt-2 text-3xl font-semibold">ERPNext sync history</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">
          Review recent workflow sync attempts, failures, and ERP references from the distributor app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total" value={summary.total || 0} />
        <StatCard label="Synced" value={summary.synced || 0} />
        <StatCard label="Failed" value={summary.failed || 0} />
        <StatCard label="Pending" value={summary.pending || 0} />
        <StatCard label="Not Configured" value={summary.notConfigured || 0} />
      </div>

      {message ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div> : null}
      {loading ? <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">Loading distributor sync logs...</div> : null}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Workflow</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 text-gray-700">
                    <div className="font-semibold text-blue-700">{log.workflowNumber}</div>
                    <div className="text-xs text-gray-500">{log.workflowType}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.provider}</td>
                  <td className="px-4 py-3 text-gray-700">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass(log.status)}`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.reference || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{log.message || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{log.createdAt}</td>
                </tr>
              ))}
              {!logs.length && !loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">No sync logs found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
