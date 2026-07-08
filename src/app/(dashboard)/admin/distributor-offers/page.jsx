"use client";

import { useEffect, useMemo, useState } from "react";

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  );
}

export default function DistributorOffersAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [offers, setOffers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    schemeTag: "",
    itemCode: "",
    minQty: "",
    rateNote: "",
    bannerUrl: "",
    validityLabel: "",
    startDate: "",
    endDate: "",
    targetType: "all",
    distributorAccountId: "",
    isActive: true,
  });

  async function loadData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-offers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load offers");
      setOffers(data.offers || []);
      setAccounts(data.distributorAccounts || []);
    } catch (error) {
      setMessage(error.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createOffer(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create offer");
      setMessage(data.message || "Offer created");
      setForm({
        title: "",
        description: "",
        schemeTag: "",
        itemCode: "",
        minQty: "",
        rateNote: "",
        bannerUrl: "",
        validityLabel: "",
        startDate: "",
        endDate: "",
        targetType: "all",
        distributorAccountId: "",
        isActive: true,
      });
      await loadData();
    } catch (error) {
      setMessage(error.message || "Failed to create offer");
    } finally {
      setSaving(false);
    }
  }

  async function toggleOffer(offerId, isActive) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-offers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offerId, isActive: !isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update offer");
      setMessage(data.message || "Offer updated");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Failed to update offer");
    }
  }

  const activeOffers = useMemo(() => offers.filter((offer) => offer.isActive).length, [offers]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Offers</p>
        <h1 className="mt-2 text-3xl font-semibold">Offer and scheme manager</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">Create promotions for all distributors or publish them only for a selected distributor account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Offers" value={offers.length} note="Published and draft-like records" />
        <StatCard label="Active Offers" value={activeOffers} note="Visible to distributor app" />
        <StatCard label="Distributor Accounts" value={accounts.length} note="Available targeting options" />
      </div>

      {message ? <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div> : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Create offer</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={createOffer}>
          <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Offer title" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.validityLabel} onChange={(e) => setForm((s) => ({ ...s, validityLabel: e.target.value }))} placeholder="Validity label" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.startDate} onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))} type="date" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.endDate} onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))} type="date" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.schemeTag} onChange={(e) => setForm((s) => ({ ...s, schemeTag: e.target.value }))} placeholder="Scheme tag" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.itemCode} onChange={(e) => setForm((s) => ({ ...s, itemCode: e.target.value }))} placeholder="Item code (optional)" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.minQty} onChange={(e) => setForm((s) => ({ ...s, minQty: e.target.value }))} placeholder="Minimum qty" type="number" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.rateNote} onChange={(e) => setForm((s) => ({ ...s, rateNote: e.target.value }))} placeholder="Rate note" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <select value={form.targetType} onChange={(e) => setForm((s) => ({ ...s, targetType: e.target.value, distributorAccountId: "" }))} className="rounded-xl border border-gray-200 px-4 py-3 text-sm">
            <option value="all">All distributors</option>
            <option value="specific">Specific distributor</option>
          </select>
          <select value={form.distributorAccountId} onChange={(e) => setForm((s) => ({ ...s, distributorAccountId: e.target.value }))} disabled={form.targetType !== "specific"} className="rounded-xl border border-gray-200 px-4 py-3 text-sm disabled:bg-gray-50">
            <option value="">Select distributor</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.label}</option>
            ))}
          </select>
          <input value={form.bannerUrl} onChange={(e) => setForm((s) => ({ ...s, bannerUrl: e.target.value }))} placeholder="Banner/image URL" className="rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2" />
          <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Offer description, scheme detail, or invoice condition" rows={4} className="rounded-xl border border-gray-200 px-4 py-3 text-sm md:col-span-2" />
          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />
              Active on save
            </label>
            <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "Saving..." : "Create offer"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Published offers</h2>
        </div>
        {loading ? <div className="px-5 py-6 text-sm text-gray-500">Loading offers...</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Validity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{offer.title}</div>
                    <div className="text-xs text-gray-500">{offer.description || "-"}</div>
                    <div className="mt-1 text-xs text-gray-400">{[offer.schemeTag, offer.itemCode, offer.minQty ? `Min qty ${offer.minQty}` : "", offer.rateNote].filter(Boolean).join(" | ") || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{offer.targetLabel}</td>
                  <td className="px-4 py-3 text-gray-700">{offer.validityLabel || [offer.startDate, offer.endDate].filter(Boolean).join(" to ") || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${offer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleOffer(offer.id, offer.isActive)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {offer.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {!offers.length && !loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No distributor offers created yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
