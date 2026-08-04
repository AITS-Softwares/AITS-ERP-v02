"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function DistributorAdminSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/company/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.token) throw new Error(payload.message || "Unable to sign in");
      window.localStorage.setItem("distributor-admin-token", payload.token);
      router.replace("/distributor/admin");
    } catch (error) {
      setMessage(error.message || "Unable to sign in");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1a75b5,_#105B92_42%,_#0b2034_100%)] p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Distributor App</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Use the organisation Admin account. Distributor OTP users cannot access setup screens.</p>
        <div className="mt-6 space-y-4">
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          {message ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}
          <button disabled={saving} className="w-full rounded-xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Signing in..." : "Continue"}</button>
          <p className="text-center text-sm text-slate-500">New organisation? <Link href="/distributor/admin/register" className="font-semibold text-[#105B92]">Register the Admin account</Link></p>
          <p className="text-center text-sm text-slate-500">Distributor user? <Link href="/distributor/signin" className="font-semibold text-[#105B92]">Go to OTP login</Link></p>
        </div>
      </form>
    </main>
  );
}
