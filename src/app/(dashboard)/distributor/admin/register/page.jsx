"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialForm = { companyName: "", contactName: "", phone: "", email: "", country: "India", address: "", pinCode: "", password: "", confirmPassword: "" };

export default function DistributorAdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) return setMessage("Passwords do not match.");
    if (!/^\d{10}$/.test(form.phone)) return setMessage("Enter a valid 10-digit phone number.");
    if (!/^\d{6}$/.test(form.pinCode)) return setMessage("Enter a valid 6-digit PIN code.");
    setSaving(true);
    try {
      const response = await fetch("/api/company/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, agreeToTerms: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Registration failed");
      router.replace("/distributor/admin/signin?registered=1");
    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <form onSubmit={submit} className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Distributor App</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Register organisation Admin</h1>
        <p className="mt-2 text-sm text-slate-500">This creates the organisation owner/Admin for the distributor product. Distributor users are added later from the protected Admin workspace.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input required value={form.companyName} onChange={update("companyName")} placeholder="Organisation name" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required value={form.contactName} onChange={update("contactName")} placeholder="Admin full name" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required inputMode="numeric" value={form.phone} onChange={update("phone")} placeholder="10-digit phone" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required type="email" value={form.email} onChange={update("email")} placeholder="Admin email" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required value={form.country} onChange={update("country")} placeholder="Country" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required inputMode="numeric" value={form.pinCode} onChange={update("pinCode")} placeholder="6-digit PIN code" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required value={form.address} onChange={update("address")} placeholder="Address" className="sm:col-span-2 rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required minLength={6} type="password" value={form.password} onChange={update("password")} placeholder="Password (minimum 6 characters)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required minLength={6} type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Confirm password" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        {message ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/distributor/admin/signin" className="font-medium text-slate-600">Back to Admin sign in</Link>
            <Link href="/distributor/signin" className="font-medium text-[#105B92]">Distributor login</Link>
          </div>
          <button disabled={saving} className="rounded-xl bg-[#105B92] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating..." : "Create Admin account"}</button>
        </div>
      </form>
    </main>
  );
}
