"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  accessRoles,
  cartLines,
  complaintTypeOptions,
  complaints,
  dispatchIssueOptions,
  dispatches,
  financePaymentModeOptions,
  invoices,
  otpPolicies,
  paymentModeOptions,
  products,
  requestTypeOptions,
  savedAddresses,
  stockItems,
} from "@/components/distributor/mockData";
import { Badge, StatePanel } from "@/components/distributor/DistributorUI";

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#105B92] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#105B92] focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#105B92] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function ToggleField({ label, checked, onChange, hint }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#105B92]" />
    </label>
  );
}

export function DistributorOtpPreview() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [trusted, setTrusted] = useState(true);
  const [step, setStep] = useState("request");
  const [message, setMessage] = useState("Enter distributor mobile details to request OTP.");
  const [loading, setLoading] = useState(false);

  const canSend = phone.trim().length >= 10;
  const canVerify = otp.trim().length >= 4;

  async function requestOtp() {
    setLoading(true);
    try {
      const res = await fetch("/api/distributor/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phone.trim(), distributorCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request OTP");
      setStep("verify");
      setMessage(data.message || "OTP requested successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const res = await fetch("/api/distributor/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phone.trim(), distributorCode: code.trim(), otp: otp.trim(), trustedDevice: trusted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify OTP");
      if (data.token) {
        localStorage.setItem("distributor_token", data.token);
      }
      setMessage(data.message || "OTP verified successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <InputField label="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
      <InputField label="Distributor code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Optional mapped code" />

      {step === "verify" ? (
        <InputField label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 4 or 6 digit OTP" />
      ) : null}

      <ToggleField label="Trust this device" checked={trusted} onChange={(e) => setTrusted(e.target.checked)} hint="Later this can reduce repeated OTP prompts for known devices." />

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!canSend}
          onClick={requestOtp}
          className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && step === "request" ? "Sending..." : "Send OTP"}
        </button>
        <button
          type="button"
          disabled={!canVerify}
          onClick={verifyOtp}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && step === "verify" ? "Verifying..." : "Verify OTP"}
        </button>
      </div>

      <StatePanel tone="blue" title="Login status" description={message} />
      <Link href="/distributor" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        Open distributor dashboard
      </Link>
    </div>
  );
}

export function CheckoutWorkbench() {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [slot, setSlot] = useState("afternoon");
  const [shipTo, setShipTo] = useState(savedAddresses[0]?.label || "");
  const [poReference, setPoReference] = useState("");
  const [instructions, setInstructions] = useState("");
  const [paymentMode, setPaymentMode] = useState("credit");
  const [utr, setUtr] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [lines, setLines] = useState(
    cartLines.map((line, index) => ({
      id: index + 1,
      name: line.name,
      qty: line.qty,
      rate: Number(line.rate.replace(/[^\d]/g, "")),
    }))
  );

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.qty * line.rate, 0);
    const discount = Math.round(subtotal * 0.03);
    const tax = Math.round((subtotal - discount) * 0.18);
    return {
      subtotal,
      discount,
      tax,
      grand: subtotal - discount + tax,
    };
  }, [lines]);

  function updateQty(id, delta) {
    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, qty: Math.max(1, line.qty + delta) } : line
      )
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Order details</h2>
            <p className="mt-1 text-sm text-slate-500">Editable distributor order form with daily-use fields.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Delivery date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            <SelectField
              label="Preferred slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              options={[
                { value: "morning", label: "Morning route" },
                { value: "afternoon", label: "Afternoon route" },
                { value: "evening", label: "Evening route" },
              ]}
            />
            <SelectField
              label="Ship to"
              value={shipTo}
              onChange={(e) => setShipTo(e.target.value)}
              options={savedAddresses.length ? savedAddresses.map((address) => ({ value: address.label, label: address.label })) : [{ value: "", label: "No saved addresses yet" }]}
            />
            <InputField label="PO reference" value={poReference} onChange={(e) => setPoReference(e.target.value)} placeholder="Optional buyer or branch ref" />
          </div>
          <div className="mt-4">
            <TextAreaField label="Special instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Delivery, handling, or invoice remarks" rows={3} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Cart lines</h2>
            <p className="mt-1 text-sm text-slate-500">Touch-friendly quantity controls for the mobile app.</p>
          </div>
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.id} className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1.3fr_0.9fr_0.8fr]">
                <div>
                  <p className="font-semibold text-slate-900">{line.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Rate: Rs {line.rate.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <button type="button" onClick={() => updateQty(line.id, -1)} className="h-10 w-10 rounded-full border border-slate-200 text-lg text-slate-700">
                    -
                  </button>
                  <div className="min-w-[72px] rounded-2xl bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-800">
                    {line.qty}
                  </div>
                  <button type="button" onClick={() => updateQty(line.id, 1)} className="h-10 w-10 rounded-full border border-slate-200 text-lg text-slate-700">
                    +
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                  Rs {(line.qty * line.rate).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Summary and payment</h2>
            <p className="mt-1 text-sm text-slate-500">This is where production payment options will sit.</p>
          </div>
          <div className="space-y-3">
            <StatePanel tone="slate" title={`Subtotal: Rs ${totals.subtotal.toLocaleString("en-IN")}`} description={`Scheme discount: Rs ${totals.discount.toLocaleString("en-IN")}`} />
            <StatePanel tone="slate" title={`Tax: Rs ${totals.tax.toLocaleString("en-IN")}`} description={`Grand total: Rs ${totals.grand.toLocaleString("en-IN")}`} />
          </div>
          <div className="mt-4 space-y-4">
            <SelectField
              label="Payment mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              options={paymentModeOptions}
            />
            {paymentMode !== "credit" ? (
              <InputField label="UTR / reference number" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="Enter payment reference" />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSaveStatus("Draft saved on this device.")}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => setSaveStatus(`Order prepared with ${paymentMode} payment mode.`)}
                className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
              >
                Place order
              </button>
            </div>
            {saveStatus ? <StatePanel tone="blue" title="Order action" description={saveStatus} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StockRequestWorkbench() {
  const [item, setItem] = useState(products[0]?.id || "");
  const [qty, setQty] = useState("");
  const [needBy, setNeedBy] = useState("");
  const [warehouse, setWarehouse] = useState(stockItems[0]?.warehouse || "");
  const [requestType, setRequestType] = useState("urgent-replenishment");
  const [reason, setReason] = useState("");
  const [notifySales, setNotifySales] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Material request style form</h2>
          <p className="mt-1 text-sm text-slate-500">Designed to later map into ERPNext material request or a custom distributor request doctype.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            options={products.length ? products.map((product) => ({ value: product.id, label: `${product.name} (${product.id})` })) : [{ value: "", label: "No product catalog connected yet" }]}
          />
          <InputField label="Requested quantity" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="24" type="number" />
          <InputField label="Needed by" type="date" value={needBy} onChange={(e) => setNeedBy(e.target.value)} />
          <SelectField
            label="Preferred warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={stockItems.length ? stockItems.map((stock) => ({ value: stock.warehouse, label: stock.warehouse })) : [{ value: "", label: "No warehouse data connected yet" }]}
          />
          <SelectField
            label="Request type"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            options={requestTypeOptions}
          />
        </div>
        <div className="mt-4 space-y-4">
          <TextAreaField label="Reason for request" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why stock is needed and what trigger created the demand." rows={4} />
          <ToggleField label="Notify sales coordinator" checked={notifySales} onChange={(e) => setNotifySales(e.target.checked)} hint="This later becomes mail + ERPNext notification trigger." />
          <button
            type="button"
            onClick={() => setStatus("Stock request captured. ERPNext submission and notifications can be enabled next.")}
            className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
          >
            Submit request
          </button>
          {status ? <StatePanel tone="blue" title="Request status" description={status} /> : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Trigger notes</h2>
          <p className="mt-1 text-sm text-slate-500">These are the ERPNext-side events we should wire later.</p>
        </div>
        <div className="space-y-3">
          <StatePanel tone="amber" title="Low stock alert" description="Trigger when available stock falls below distributor-specific threshold or reorder level." />
          <StatePanel tone="blue" title="Ledger notification" description="Trigger mail and ERPNext notification when request is submitted or approved." />
          <StatePanel tone="slate" title="Audit trail" description="Keep request type, remarks, and linked warehouse visible for review." />
        </div>
      </div>
    </div>
  );
}

export function FinancePaymentDesk() {
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || "");
  const [paymentMode, setPaymentMode] = useState("bank");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [followUp, setFollowUp] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Payment intent</h2>
        <p className="mt-1 text-sm text-slate-500">Visible payment options for daily distributor use.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Invoice"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          options={invoices.length ? invoices.map((invoice) => ({ value: invoice.id, label: `${invoice.id} - ${invoice.balance}` })) : [{ value: "", label: "No invoices available" }]}
        />
        <SelectField
          label="Payment mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          options={financePaymentModeOptions}
        />
        <InputField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter payment amount" />
        <InputField label="Reference / UTR" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter UTR or cheque number" />
      </div>
      <div className="mt-4 space-y-4">
        <ToggleField label="Notify accounts team" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} hint="Backend phase will trigger ERPNext + email follow-up." />
        <button
          type="button"
          onClick={() => setStatus(`Payment intent captured for ${invoiceId} using ${paymentMode}.`)}
          className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
        >
          Save payment update
        </button>
        {status ? <StatePanel tone="blue" title="Payment update" description={status} /> : null}
      </div>
    </div>
  );
}

export function DispatchFeedbackDesk({ dispatchId }) {
  const dispatch = dispatches.find((item) => item.id === dispatchId) || dispatches[0];
  const linkedInvoice = dispatch ? invoices.find((invoice) => invoice.orderId === dispatch.order) || invoices[0] : null;
  const [status, setStatus] = useState("ok");
  const [issueType, setIssueType] = useState("misbill");
  const [remarks, setRemarks] = useState("");
  const [notifyClaims, setNotifyClaims] = useState(true);
  const [saved, setSaved] = useState("");

  return (
    <div className="space-y-4">
      <StatePanel tone="blue" title={linkedInvoice ? `Linked invoice: ${linkedInvoice.id}` : "Linked invoice: not available"} description="Dispatch review should remain tied to ERPNext invoice and delivery records." />
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setStatus("ok")}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${status === "ok" ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"}`}
        >
          All ok
        </button>
        <button
          type="button"
          onClick={() => setStatus("issue")}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${status === "issue" ? "bg-amber-500 text-white" : "border border-slate-200 text-slate-700"}`}
        >
          Has issues
        </button>
      </div>
      {status === "issue" ? (
        <>
          <SelectField
            label="Issue type"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            options={dispatchIssueOptions}
          />
          <TextAreaField label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add field-level delivery feedback" rows={4} />
        </>
      ) : (
        <TextAreaField label="Delivery remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional dispatch acknowledgement note" rows={3} />
      )}
      <ToggleField label="Notify claims / accounts" checked={notifyClaims} onChange={(e) => setNotifyClaims(e.target.checked)} hint="This later becomes notification + complaint trigger from dispatch review." />
      <button
        type="button"
        onClick={() => setSaved(`Dispatch ${dispatch.id} review saved with status: ${status === "ok" ? "All ok" : issueType}.`)}
        className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
      >
        Save dispatch feedback
      </button>
      {saved ? <StatePanel tone="blue" title="Dispatch review" description={saved} /> : null}
    </div>
  );
}

export function ComplaintFormWorkbench() {
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || "");
  const [type, setType] = useState(complaintTypeOptions[0].value);
  const [remarks, setRemarks] = useState("");
  const [attachProof, setAttachProof] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Complaint details</h2>
          <p className="mt-1 text-sm text-slate-500">Working complaint inputs for invoice-linked claim capture.</p>
        </div>
        <div className="space-y-4">
          <SelectField
            label="Invoice number"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            options={invoices.length ? invoices.map((invoice) => ({ value: invoice.id, label: `${invoice.id} - ${invoice.amount}` })) : [{ value: "", label: "No invoices available" }]}
          />
          <SelectField
            label="Complaint type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={complaintTypeOptions}
          />
          <TextAreaField label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Describe the exact issue seen on invoice or delivery." rows={4} />
          <ToggleField label="Attachment will be added" checked={attachProof} onChange={(e) => setAttachProof(e.target.checked)} hint="Backend phase will support image, PDF, and invoice proof upload." />
          <button
            type="button"
            onClick={() => setStatus(`Complaint prepared for ${invoiceId} under ${type}.`)}
            className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
          >
            Submit complaint
          </button>
          {status ? <StatePanel tone="blue" title="Complaint action" description={status} /> : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Submission guidance</h2>
          <p className="mt-1 text-sm text-slate-500">Useful support hints for faster resolution.</p>
        </div>
        <div className="space-y-3">
          <StatePanel tone="slate" title="Expected proof" description="Invoice copy, rate screenshot, delivery proof, or received quantity note." />
          <StatePanel tone="amber" title="Resolution routing" description="Rate and misbill issues go to accounts. Qty issues go to claims and dispatch review." />
        </div>
      </div>
    </div>
  );
}

export function TeamAccessWorkbench() {
  const [selectedRole, setSelectedRole] = useState(accessRoles[1].role);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loginEnabled, setLoginEnabled] = useState(true);
  const [financeAccess, setFinanceAccess] = useState(false);
  const [status, setStatus] = useState("");

  const activeRole = accessRoles.find((role) => role.role === selectedRole) || accessRoles[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Team user access</h2>
          <p className="mt-1 text-sm text-slate-500">Frontend setup for multi-user distributor login and role assignment.</p>
        </div>
        <div className="space-y-4">
          <InputField label="User name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter team member name" />
          <InputField label="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mapped OTP login mobile" />
          <SelectField
            label="Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={accessRoles.map((role) => ({ value: role.role, label: role.role }))}
          />
          <ToggleField label="OTP login enabled" checked={loginEnabled} onChange={(e) => setLoginEnabled(e.target.checked)} hint="Later this will activate distributor app access for the mapped mobile number." />
          <ToggleField label="Extra finance permission" checked={financeAccess} onChange={(e) => setFinanceAccess(e.target.checked)} hint="Use this only for approved accounts users." />
          <button
            type="button"
            onClick={() => setStatus(`${name || "Team user"} prepared with ${selectedRole} access.`)}
            className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
          >
            Save access setup
          </button>
          {status ? <StatePanel tone="blue" title="Access setup" description={status} /> : null}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Selected role scope</h2>
          </div>
          <StatePanel tone="slate" title={activeRole.role} description={`${activeRole.scope} • ${activeRole.modules}`} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">OTP and ERPNext mapping</h2>
          </div>
          <div className="space-y-3">
            {otpPolicies.map((policy) => (
              <StatePanel key={policy.title} tone="amber" title={policy.title} description={policy.detail} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
