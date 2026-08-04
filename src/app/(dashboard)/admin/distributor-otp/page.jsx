"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DistributorOtpAdminPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const token = localStorage.getItem("distributor-admin-token");
        const res = await fetch("/api/distributor/admin/otp", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load OTP config");
        setConfig(data.config || null);
      } catch (error) {
        setMessage(error.message || "Failed to load OTP config");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor OTP</p>
        <h1 className="mt-2 text-3xl font-semibold">OTP delivery readiness</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">Live OTP sending is now wired. This page shows whether the sender config is ready for production use.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/distributor/admin/setup" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Connection setup</Link>
        <Link href="/distributor/admin/users" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor users</Link>
      </div>

      {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}
      {loading ? <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">Loading OTP config...</div> : null}

      {config ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Email OTP</p>
            <p className={`mt-2 text-xl font-semibold ${config.channels?.email?.ready ? "text-emerald-700" : "text-amber-700"}`}>{config.channels?.email?.ready ? "Ready" : "Missing setup"}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Mobile OTP</p>
            <p className={`mt-2 text-xl font-semibold ${config.channels?.mobile?.ready ? "text-emerald-700" : "text-amber-700"}`}>{config.channels?.mobile?.ready ? "Ready" : "Missing setup"}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Mobile channel</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{config.channels?.mobile?.channel || "-"}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Ready</p>
            <p className={`mt-2 text-xl font-semibold ${config.ready ? "text-emerald-700" : "text-amber-700"}`}>{config.ready ? "Yes" : "No"}</p>
          </div>
        </div>
      ) : null}

      {config ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Channel checks</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <div className="mt-2 space-y-2">
                {(config.channels?.email?.missing || []).length ? config.channels.email.missing.map((item) => (
                  <div key={`email-${item}`} className="rounded-xl bg-amber-50 px-4 py-3 text-amber-700">{item}</div>
                )) : <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">Email OTP is ready.</div>}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Mobile</p>
              <div className="mt-2 space-y-2">
                {(config.channels?.mobile?.missing || []).length ? config.channels.mobile.missing.map((item) => (
                  <div key={`mobile-${item}`} className="rounded-xl bg-amber-50 px-4 py-3 text-amber-700">{item}</div>
                )) : <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">Mobile OTP is ready.</div>}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
