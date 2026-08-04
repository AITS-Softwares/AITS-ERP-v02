"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DistributorSelect from "@/components/distributor/DistributorSelect";

function Message({ tone = "info", text }) {
  if (!text) return null;
  const styles = tone === "error"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-blue-200 bg-blue-50 text-blue-700";
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{text}</div>;
}

export default function DistributorSetupPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [testingErpNext, setTestingErpNext] = useState(false);
  const [savingSection, setSavingSection] = useState("");
  const [erpForm, setErpForm] = useState({
    id: "",
    label: "Primary ERPNext",
    baseUrl: "",
    apiKey: "",
    apiSecret: "",
    isDefault: true,
    isActive: true,
    apiKeyPreview: "",
    hasApiSecret: false,
    lastTestStatus: "",
    lastTestMessage: "",
  });
  const [otpForm, setOtpForm] = useState({
    brandName: "ERPExpress Distributor App",
    email: { host: "smtp.gmail.com", port: 465, secure: true, user: "", pass: "", from: "", hasPass: false, ready: false, missing: [] },
    mobile: {
      provider: "twilio",
      channel: "sms",
      accountSid: "",
      authToken: "",
      apiKeySid: "",
      apiKeySecret: "",
      phoneNumber: "",
      messagingServiceSid: "",
      whatsappFrom: "",
      hasAuthToken: false,
      hasApiKeySecret: false,
      ready: false,
      missing: [],
    },
  });

  async function loadSetup() {
    try {
      setLoading(true);
      const token = localStorage.getItem("distributor-admin-token");
      const res = await fetch("/api/distributor/admin/setup", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load distributor setup");
      if (data.erpNext) {
        setErpForm((current) => ({ ...current, ...data.erpNext, apiKey: "", apiSecret: "" }));
      }
      if (data.otp) {
        setOtpForm((current) => ({
          brandName: data.otp.brandName || "ERPExpress Distributor App",
          email: { ...current.email, ...data.otp.email, pass: "" },
          mobile: { ...current.mobile, ...data.otp.mobile, authToken: "", apiKeySecret: "" },
        }));
      }
    } catch (error) {
      setMessageTone("error");
      setMessage(error.message || "Failed to load distributor setup");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSetup();
  }, []);

  async function saveSetup(section, payload) {
    try {
      setSavingSection(section);
      setMessage("");
      const token = localStorage.getItem("distributor-admin-token");
      const res = await fetch("/api/distributor/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save setup");
      setMessageTone("info");
      setMessage(data.message || "Setup saved");
      await loadSetup();
    } catch (error) {
      setMessageTone("error");
      setMessage(error.message || "Failed to save setup");
    } finally {
      setSavingSection("");
    }
  }

  async function testErpNext() {
    try {
      setTestingErpNext(true);
      setMessage("");
      const token = localStorage.getItem("distributor-admin-token");
      const body = erpForm.id
        ? { connectionId: erpForm.id }
        : {
            baseUrl: erpForm.baseUrl,
            apiKey: erpForm.apiKey,
            apiSecret: erpForm.apiSecret,
          };
      const res = await fetch("/api/integrations/erpnext/connections/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "ERPNext test failed");
      setMessageTone("info");
      setMessage(data.message || "ERPNext connection verified");
      await loadSetup();
    } catch (error) {
      setMessageTone("error");
      setMessage(error.message || "ERPNext test failed");
    } finally {
      setTestingErpNext(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Setup</p>
        <h1 className="mt-2 text-3xl font-semibold">Live connection settings</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">Manage ERPNext and OTP delivery settings from the admin panel.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/distributor/admin/accounts" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor accounts</Link>
        <Link href="/distributor/admin/users" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor users</Link>
        <Link href="/distributor/admin/otp" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">OTP readiness</Link>
        <Link href="/distributor/admin/mapping" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor mapping</Link>
      </div>

      <Message tone={messageTone} text={message} />
      {loading ? <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">Loading setup...</div> : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ERPNext connection</h2>
            <p className="mt-1 text-sm text-gray-500">Save the base URL and API credentials for the distributor data sync.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={testErpNext} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700">
              {testingErpNext ? "Testing..." : "Test connection"}
            </button>
            <button type="button" onClick={() => saveSetup("erpnext", erpForm)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {savingSection === "erpnext" ? "Saving..." : "Save ERPNext"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input value={erpForm.label} onChange={(e) => setErpForm((s) => ({ ...s, label: e.target.value }))} placeholder="Connection label" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={erpForm.baseUrl} onChange={(e) => setErpForm((s) => ({ ...s, baseUrl: e.target.value }))} placeholder="https://your-site.frappe.cloud" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={erpForm.apiKey} onChange={(e) => setErpForm((s) => ({ ...s, apiKey: e.target.value }))} placeholder={erpForm.apiKeyPreview || "API key"} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={erpForm.apiSecret} onChange={(e) => setErpForm((s) => ({ ...s, apiSecret: e.target.value }))} placeholder={erpForm.hasApiSecret ? "API secret saved. Enter only to replace." : "API secret"} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
        </div>
        {erpForm.lastTestStatus || erpForm.lastTestMessage ? (
          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {erpForm.lastTestStatus ? `Status: ${erpForm.lastTestStatus}. ` : ""}{erpForm.lastTestMessage}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">OTP delivery setup</h2>
            <p className="mt-1 text-sm text-gray-500">Save email OTP and mobile OTP credentials without editing code.</p>
          </div>
          <button type="button" onClick={() => saveSetup("otp", otpForm)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {savingSection === "otp" ? "Saving..." : "Save OTP settings"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input value={otpForm.brandName} onChange={(e) => setOtpForm((s) => ({ ...s, brandName: e.target.value }))} placeholder="Brand name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <DistributorSelect value={otpForm.mobile.channel} onChange={(value) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, channel: value } }))} options={[{ value: "sms", label: "SMS OTP" }, { value: "whatsapp", label: "WhatsApp OTP" }]} aria-label="Mobile OTP channel" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-gray-900">Email OTP</h3>
              <span className={`text-sm font-medium ${otpForm.email.ready ? "text-emerald-700" : "text-amber-700"}`}>{otpForm.email.ready ? "Ready" : "Needs setup"}</span>
            </div>
            <div className="mt-4 grid gap-3">
              <input value={otpForm.email.host} onChange={(e) => setOtpForm((s) => ({ ...s, email: { ...s.email, host: e.target.value } }))} placeholder="SMTP host" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={otpForm.email.port} onChange={(e) => setOtpForm((s) => ({ ...s, email: { ...s.email, port: e.target.value } }))} placeholder="Port" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" checked={otpForm.email.secure} onChange={(e) => setOtpForm((s) => ({ ...s, email: { ...s.email, secure: e.target.checked } }))} />
                  Secure connection
                </label>
              </div>
              <input value={otpForm.email.user} onChange={(e) => setOtpForm((s) => ({ ...s, email: { ...s.email, user: e.target.value } }))} placeholder="SMTP user / email" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.email.pass} onChange={(e) => setOtpForm((s) => ({ ...s, email: { ...s.email, pass: e.target.value } }))} placeholder={otpForm.email.hasPass ? "Password saved. Enter only to replace." : "SMTP password / app password"} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.email.from} onChange={(e) => setOtpForm((s) => ({ ...s, email: { ...s.email, from: e.target.value } }))} placeholder="Sender name <email@domain.com>" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-gray-900">Mobile OTP</h3>
              <span className={`text-sm font-medium ${otpForm.mobile.ready ? "text-emerald-700" : "text-amber-700"}`}>{otpForm.mobile.ready ? "Ready" : "Needs setup"}</span>
            </div>
            <div className="mt-4 grid gap-3">
              <input value={otpForm.mobile.accountSid} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, accountSid: e.target.value } }))} placeholder="Twilio account SID" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.mobile.authToken} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, authToken: e.target.value } }))} placeholder={otpForm.mobile.hasAuthToken ? "Auth token saved. Enter only to replace." : "Twilio auth token"} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.mobile.apiKeySid} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, apiKeySid: e.target.value } }))} placeholder="Twilio API key SID (optional)" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.mobile.apiKeySecret} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, apiKeySecret: e.target.value } }))} placeholder={otpForm.mobile.hasApiKeySecret ? "API key secret saved. Enter only to replace." : "Twilio API key secret (optional)"} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.mobile.phoneNumber} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, phoneNumber: e.target.value } }))} placeholder="Twilio phone number" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.mobile.messagingServiceSid} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, messagingServiceSid: e.target.value } }))} placeholder="Messaging service SID (optional)" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input value={otpForm.mobile.whatsappFrom} onChange={(e) => setOtpForm((s) => ({ ...s, mobile: { ...s.mobile, whatsappFrom: e.target.value } }))} placeholder="WhatsApp sender (optional)" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
