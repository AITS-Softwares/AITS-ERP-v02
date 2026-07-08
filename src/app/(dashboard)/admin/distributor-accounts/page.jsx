"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function Message({ tone = "info", text }) {
  if (!text) return null;
  const styles = tone === "error"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-blue-200 bg-blue-50 text-blue-700";
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{text}</div>;
}

function emptyForm() {
  return {
    displayName: "",
    distributorCode: "",
    territory: "",
    preferredWarehouse: "",
    erpCustomerName: "",
    isActive: true,
  };
}

export default function DistributorAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("info");
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [erpSearch, setErpSearch] = useState("");
  const [erpResults, setErpResults] = useState([]);
  const [erpMessage, setErpMessage] = useState("");
  const [form, setForm] = useState(emptyForm());

  async function loadData(search = "") {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/distributor-accounts${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load distributor accounts");
      setAccounts(data.accounts || []);
      setErpResults(data.erpnext?.customers || []);
      setErpMessage(data.erpnext?.message || "");
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Failed to load distributor accounts");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createAccount() {
    try {
      setSaving(true);
      setMessage("");
      if (!form.displayName || !form.distributorCode) {
        throw new Error("Display name and distributor code are required");
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create distributor account");
      setTone("info");
      setMessage(data.message || "Distributor account created");
      setForm(emptyForm());
      await loadData(erpSearch);
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Failed to create distributor account");
    } finally {
      setSaving(false);
    }
  }

  function useErpCandidate(row) {
    setForm({
      displayName: row.name || "",
      distributorCode: row.code || "",
      territory: row.territory || "",
      preferredWarehouse: "",
      erpCustomerName: row.code || "",
      isActive: true,
    });
    setTone("info");
    setMessage("ERPNext customer copied into the create form. Review and save.");
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Accounts</p>
        <h1 className="mt-2 text-3xl font-semibold">Create or import distributor accounts</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">Create the local distributor accounts required before OTP users and mapping can work.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/distributor-setup" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Connection setup</Link>
        <Link href="/admin/distributor-mapping" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor mapping</Link>
        <Link href="/admin/distributor-users" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor users</Link>
      </div>

      <Message tone={tone} text={message} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Create distributor account</h2>
          <p className="mt-1 text-sm text-gray-500">This record is what appears in the distributor user dropdown.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={form.displayName} onChange={(e) => setForm((s) => ({ ...s, displayName: e.target.value }))} placeholder="Distributor name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            <input value={form.distributorCode} onChange={(e) => setForm((s) => ({ ...s, distributorCode: e.target.value.toUpperCase() }))} placeholder="Distributor code" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            <input value={form.erpCustomerName} onChange={(e) => setForm((s) => ({ ...s, erpCustomerName: e.target.value }))} placeholder="Exact ERPNext customer code/name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            <input value={form.territory} onChange={(e) => setForm((s) => ({ ...s, territory: e.target.value }))} placeholder="Territory" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            <input value={form.preferredWarehouse} onChange={(e) => setForm((s) => ({ ...s, preferredWarehouse: e.target.value }))} placeholder="Preferred warehouse" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />
              Account active
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={createAccount} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              {saving ? "Saving..." : "Create account"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Import from ERPNext customer</h2>
              <p className="mt-1 text-sm text-gray-500">Search ERPNext, then copy the selected customer into the create form.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearching(true);
                loadData(erpSearch);
              }}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-4">
            <input value={erpSearch} onChange={(e) => setErpSearch(e.target.value)} placeholder="Search by ERPNext customer code, name, or mobile number" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">{erpMessage || "Search to fetch ERPNext customers."}</div>

          <div className="mt-4 space-y-3">
            {erpResults.map((row) => (
              <div key={`${row.code}-${row.mobileNumber}`} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-blue-700">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.code}</div>
                    <div className="mt-2 text-sm text-gray-700">{row.territory || "-"} | {row.mobileNumber || "-"}</div>
                  </div>
                  <button type="button" onClick={() => useErpCandidate(row)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    Use
                  </button>
                </div>
              </div>
            ))}
            {!erpResults.length ? <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500">No ERPNext customers loaded yet.</div> : null}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Existing distributor accounts</h2>
        </div>
        {loading ? <div className="px-5 py-6 text-sm text-gray-500">Loading accounts...</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Distributor</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">ERPNext customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-900">{account.displayName}</td>
                  <td className="px-4 py-3 text-gray-700">{account.distributorCode}</td>
                  <td className="px-4 py-3 text-gray-700">{account.erpCustomerName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{account.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
              {!accounts.length && !loading ? <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No distributor accounts found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
