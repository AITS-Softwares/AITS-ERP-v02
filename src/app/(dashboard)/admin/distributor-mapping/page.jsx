"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function Message({ text }) {
  if (!text) return null;
  return <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{text}</div>;
}

function ConnectionTone(status) {
  if (status === "success") return "text-emerald-700";
  if (status === "failure") return "text-rose-700";
  return "text-amber-700";
}

export default function DistributorMappingAdminPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [connection, setConnection] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    accountId: "",
    territory: "",
    preferredWarehouse: "",
    erpCustomerName: "",
    isActive: true,
  });

  async function loadData(accountId = "") {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
      const res = await fetch(`/api/admin/distributor-mapping${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load mapping data");
      setAccounts(data.accounts || []);
      setConnection(data.connection || null);
      setPreview(data.preview || null);
    } catch (error) {
      setMessage(error.message || "Failed to load mapping data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function pickAccount(accountId) {
    const account = accounts.find((row) => row.id === accountId);
    setSelectedId(accountId);
    setForm({
      accountId,
      territory: account?.territory || "",
      preferredWarehouse: account?.preferredWarehouse || "",
      erpCustomerName: account?.erpCustomerName || "",
      isActive: account?.isActive !== false,
    });
    loadData(accountId);
  }

  async function saveMapping() {
    try {
      setSaving(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-mapping", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save distributor mapping");
      setMessage(data.message || "Distributor mapping updated");
      await loadData(form.accountId);
    } catch (error) {
      setMessage(error.message || "Failed to save distributor mapping");
    } finally {
      setSaving(false);
    }
  }

  async function previewMapping() {
    try {
      setPreviewLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-mapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountId: form.accountId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to preview ERPNext mapping");
      setPreview(data.preview || null);
    } catch (error) {
      setMessage(error.message || "Failed to preview ERPNext mapping");
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Mapping</p>
        <h1 className="mt-2 text-3xl font-semibold">ERPNext distributor linking</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">Map each distributor account to the exact ERPNext customer before live app usage.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/distributor-accounts" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor accounts</Link>
        <Link href="/admin/distributor-setup" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Connection setup</Link>
      </div>

      <Message text={message} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">ERPNext connection</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">{connection?.label || "Not configured"}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Connection status</p>
          <p className={`mt-2 text-lg font-semibold ${ConnectionTone(connection?.lastTestStatus)}`}>{connection?.lastTestStatus || "Not tested"}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Last test message</p>
          <p className="mt-2 text-sm font-medium text-gray-900">{connection?.lastTestMessage || "No test result yet"}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Distributor accounts</h2>
        </div>
        {loading ? <div className="px-5 py-6 text-sm text-gray-500">Loading distributor accounts...</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Distributor</th>
                <th className="px-4 py-3 font-medium">ERPNext override</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Users</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  onClick={() => pickAccount(account.id)}
                  className={`cursor-pointer border-t border-gray-100 ${selectedId === account.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-blue-700">{account.displayName}</div>
                    <div className="text-xs text-gray-500">{account.distributorCode}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{account.erpCustomerName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{account.preferredWarehouse || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{account.userCount || 0}</td>
                </tr>
              ))}
              {!accounts.length && !loading ? <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No distributor accounts found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      {form.accountId ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Mapping details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={form.erpCustomerName} onChange={(e) => setForm((s) => ({ ...s, erpCustomerName: e.target.value }))} placeholder="Exact ERPNext customer code/name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={form.territory} onChange={(e) => setForm((s) => ({ ...s, territory: e.target.value }))} placeholder="Territory" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={form.preferredWarehouse} onChange={(e) => setForm((s) => ({ ...s, preferredWarehouse: e.target.value }))} placeholder="Preferred warehouse" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />
                Account active
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={saveMapping} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                {saving ? "Saving..." : "Save mapping"}
              </button>
              <button onClick={previewMapping} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
                {previewLoading ? "Checking..." : "Preview ERPNext match"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">ERPNext preview</h2>
            <p className="mt-1 text-sm text-gray-500">{preview?.message || "Select a distributor and run preview."}</p>
            <div className="mt-4 space-y-3">
              {(preview?.candidates || []).map((candidate) => (
                <div key={candidate.name} className="rounded-2xl border border-gray-200 p-4">
                  <div className="font-semibold text-blue-700">{candidate.name}</div>
                  <div className="mt-1 text-sm text-gray-700">{candidate.customerName || "-"}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {candidate.customerGroup || "-"} | {candidate.territory || "-"} | {candidate.mobileNumber || "-"}
                  </div>
                </div>
              ))}
              {preview && !(preview.candidates || []).length ? <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">No ERPNext customer candidates found yet.</div> : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
