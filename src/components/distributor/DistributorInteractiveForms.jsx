"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DistributorSelect from "@/components/distributor/DistributorSelect";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import {
  accessRoles,
  complaintTypeOptions,
  dispatchIssueOptions,
  financePaymentModeOptions,
  otpPolicies,
} from "@/components/distributor/mockData";
import { Badge, StatePanel } from "@/components/distributor/DistributorUI";

function InputField({ label, value, onChange, placeholder, type = "text", ...inputProps }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...inputProps}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#105B92] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <DistributorSelect
        value={value}
        onChange={(nextValue) => onChange({ target: { value: nextValue } })}
        options={options}
        aria-label={label}
      />
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

function getRecordValue(record, keys, fallback = "") {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function toAmount(value) {
  if (typeof value === "number") return value;
  const normalized = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatCurrency(value) {
  return `Rs ${toAmount(value).toLocaleString("en-IN")}`;
}

function getDistributorToken() {
  return typeof window !== "undefined" ? localStorage.getItem("distributor_token") || "" : "";
}

async function submitDistributorAction(path, body) {
  const token = getDistributorToken();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
}

async function uploadDistributorWorkflowAttachment(type, number, file) {
  const token = getDistributorToken();
  const formData = new FormData();
  formData.append("type", type);
  formData.append("number", number);
  formData.append("file", file);

  const res = await fetch("/api/distributor/workflows/attachments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.message || "Attachment upload failed");
  }
  return payload;
}

function resolveDraftInitial(initialValue) {
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

function useDistributorDraftState(key, initialValue) {
  const [state, setState] = useState(() => resolveDraftInitial(initialValue));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored));
      }
    } catch {
      // Ignore invalid stored JSON and continue with the in-memory value.
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage write failures so the form still works normally.
    }
  }, [hydrated, key, state]);

  return [state, setState];
}

function clearDistributorDraftState(keys) {
  if (typeof window === "undefined") return;
  keys.forEach((key) => window.localStorage.removeItem(key));
}

export function DistributorOtpPreview() {
  const [loginMethod, setLoginMethod] = useState("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("request");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("Enter your registered email address or mobile number.");
  const [loading, setLoading] = useState(false);

  const canSend = !loading && !verified && step === "request" && (loginMethod === "email"
    ? /\S+@\S+\.\S+/.test(email.trim())
    : phone.trim().replace(/\D/g, "").length >= 10);
  const canVerify = !loading && !verified && step === "verify" && otp.trim().length >= 4;

  function resetOtpFlow(nextMessage = "Enter your registered email address or mobile number.") {
    setStep("request");
    setOtp("");
    setVerified(false);
    setMessage(nextMessage);
  }

  function handleMethodChange(nextMethod) {
    setLoginMethod(nextMethod);
    resetOtpFlow();
  }

  function handleFieldChange(setter) {
    return (event) => {
      setter(event.target.value);
      if (step !== "request" || verified) {
        resetOtpFlow();
      }
    };
  }

  async function requestOtp() {
    setLoading(true);
    try {
      const res = await fetch("/api/distributor/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginMethod,
          mobileNumber: phone.trim(),
          emailAddress: email.trim(),
          distributorCode: code.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request OTP");
      setStep("verify");
      setOtp("");
      setVerified(false);
      setMessage(data.message || "OTP sent successfully. Enter the code to continue.");
    } catch (error) {
      setVerified(false);
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
        body: JSON.stringify({
          loginMethod,
          mobileNumber: phone.trim(),
          emailAddress: email.trim(),
          distributorCode: code.trim(),
          otp: otp.trim(),
          trustedDevice: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify OTP");
      if (data.token) {
        localStorage.setItem("distributor_token", data.token);
      }
      setVerified(true);
      setStep("verified");
      setMessage(data.message || "Login verified successfully.");
    } catch (error) {
      setVerified(false);
      setMessage(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleMethodChange("email")}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${loginMethod === "email" ? "bg-[#105B92] text-white" : "border border-slate-200 text-slate-700"}`}
        >
          Email OTP
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("mobile")}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${loginMethod === "mobile" ? "bg-[#105B92] text-white" : "border border-slate-200 text-slate-700"}`}
        >
          Mobile OTP
        </button>
      </div>

      {loginMethod === "email" ? (
        <InputField label="Email address" value={email} onChange={handleFieldChange(setEmail)} placeholder="name@company.com" />
      ) : (
        <InputField label="Mobile number" value={phone} onChange={handleFieldChange(setPhone)} placeholder="+91 98765 43210" />
      )}
      <InputField label="Distributor code" value={code} onChange={handleFieldChange(setCode)} placeholder="Optional mapped code" />

      {step === "verify" && !verified ? (
        <InputField label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
      ) : null}

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

      {step === "verify" && !verified ? (
        <button
          type="button"
          onClick={requestOtp}
          disabled={loading}
          className="text-sm font-medium text-[#105B92] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Request a new OTP
        </button>
      ) : null}

      <StatePanel tone={verified ? "blue" : "slate"} title={verified ? "Login verified" : "Login status"} description={message} />
      {verified ? (
        <Link href="/distributor" className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Open distributor dashboard
        </Link>
      ) : null}
    </div>
  );
}

export function CheckoutWorkbench() {
  const { data, refresh } = useDistributorAppData();
  const savedAddresses = data.savedAddresses || [];
  const checkoutDraftKeys = [
    "distributor-draft-checkout-delivery-date",
    "distributor-draft-checkout-ship-to",
    "distributor-draft-checkout-po-reference",
    "distributor-draft-checkout-remarks",
    "distributor-draft-checkout-lines",
  ];
  const [deliveryDate, setDeliveryDate] = useDistributorDraftState("distributor-draft-checkout-delivery-date", "");
  const [shipTo, setShipTo] = useDistributorDraftState("distributor-draft-checkout-ship-to", savedAddresses[0]?.label || "");
  const [poReference, setPoReference] = useDistributorDraftState("distributor-draft-checkout-po-reference", "");
  const [instructions, setInstructions] = useDistributorDraftState("distributor-draft-checkout-remarks", "");
  const [saveStatus, setSaveStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lines, setLines] = useDistributorDraftState("distributor-draft-checkout-lines", []);
  const [itemSearch, setItemSearch] = useState("");
  const [catalogueItems, setCatalogueItems] = useState([]);
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [pricingPreview, setPricingPreview] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");
  const minimumDeliveryDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!shipTo && savedAddresses[0]?.label) {
      setShipTo(savedAddresses[0].label);
    }
  }, [savedAddresses, shipTo]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCatalogueLoading(true);
      try {
        const response = await fetch(`/api/distributor/order-items?${new URLSearchParams({ page: "1", pageSize: "10", search: itemSearch })}`, { headers: { Authorization: `Bearer ${getDistributorToken()}` }, signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) setCatalogueItems(payload.data?.items || []);
      } finally { if (!controller.signal.aborted) setCatalogueLoading(false); }
    }, itemSearch ? 250 : 0);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [itemSearch]);

  useEffect(() => {
    if (!lines.length) {
      setPricingPreview(null);
      setPricingMessage("");
      setPricingLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPricingLoading(true);
      try {
        const response = await fetch("/api/distributor/pricing/preview", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getDistributorToken()}` },
          body: JSON.stringify({ deliveryDate, lines }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "ERPNext pricing preview failed");
        if (!controller.signal.aborted) {
          setPricingPreview(payload.data || null);
          setPricingMessage(payload.data?.mode === "basic" ? "Base ERPNext item rates applied. Cart-level discounts, taxes, and schemes require the authoritative ERPNext pricing endpoint." : "Live ERPNext pricing applied to this cart.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPricingPreview(null);
          setPricingMessage(error.message || "ERPNext pricing preview is unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setPricingLoading(false);
      }
    }, 350);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [deliveryDate, lines]);

  const totals = useMemo(() => {
    const baseTotal = lines.reduce((sum, line) => sum + line.qty * line.rate, 0);
    return {
      subtotal: pricingPreview ? pricingPreview.netTotal : baseTotal,
      tax: pricingPreview ? pricingPreview.totalTaxesAndCharges : 0,
      grandTotal: pricingPreview ? pricingPreview.grandTotal : baseTotal,
    };
  }, [lines, pricingPreview]);

  const pricingByItemCode = useMemo(
    () => new Map((pricingPreview?.items || []).map((item) => [item.itemCode, item])),
    [pricingPreview]
  );

  const unpricedLines = useMemo(() => {
    if (!pricingPreview || pricingLoading) return [];
    return lines.filter((line) => {
      const priced = pricingByItemCode.get(line.itemCode);
      return !priced || Number(priced.priceListRate) <= 0;
    });
  }, [lines, pricingByItemCode, pricingPreview, pricingLoading]);

  const unpricedKey = unpricedLines.map((line) => line.itemCode).sort().join("|");
  const [dismissedUnpricedKey, setDismissedUnpricedKey] = useState("");
  const showUnpricedModal = Boolean(unpricedKey) && unpricedKey !== dismissedUnpricedKey;

  function updateQty(id, delta) {
    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, qty: Math.max(1, line.qty + delta) } : line
      )
    );
  }
  function addItem(product) {
    setLines((current) => current.some((line) => line.itemCode === product.itemCode) ? current : [...current, { id: product.itemCode, itemCode: product.itemCode, itemName: product.itemName, uom: product.stockUom || "Nos", qty: 1, rate: Number(product.rate || 0) }]);
    setItemSearch("");
  }
  function removeItem(id) { setLines((current) => current.filter((line) => line.id !== id)); }

  return (
    <>
    {showUnpricedModal ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Price list not available</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {unpricedLines.length === 1 ? "This item has" : `${unpricedLines.length} items have`} no ERPNext price list entry
          </h3>
          <div className="mt-3 space-y-2">
            {unpricedLines.map((line) => (
              <div key={line.itemCode} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {line.itemName} <span className="text-slate-400">({line.itemCode})</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            ERPNext cannot price {unpricedLines.length === 1 ? "this item" : "these items"} yet. Remove {unpricedLines.length === 1 ? "it" : "them"} from the order or ask your admin to add an Item Price before placing this order.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                unpricedLines.forEach((line) => removeItem(line.id));
                setDismissedUnpricedKey("");
              }}
              className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
            >
              Remove item(s)
            </button>
            <button
              type="button"
              onClick={() => setDismissedUnpricedKey(unpricedKey)}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Keep and continue
            </button>
          </div>
        </div>
      </div>
    ) : null}
    <div className="grid max-w-full gap-6 overflow-x-hidden xl:grid-cols-[1.1fr_0.9fr]">
      <div className="min-w-0 space-y-6">
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Sales Order details</h2>
            <p className="mt-1 text-sm text-slate-500">ERPNext-aligned distributor order fields for schedule date, address, reference, and remarks.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Requested delivery date" type="date" value={deliveryDate} min={minimumDeliveryDate} required onChange={(e) => setDeliveryDate(e.target.value)} />
            <SelectField
              label="Ship to address"
              value={shipTo}
              onChange={(e) => setShipTo(e.target.value)}
              options={savedAddresses.length ? savedAddresses.map((address) => ({ value: address.label, label: address.label })) : [{ value: "", label: "No saved addresses yet" }]}
            />
            <InputField label="Customer PO / reference" value={poReference} onChange={(e) => setPoReference(e.target.value)} placeholder="Optional buyer or branch reference" />
          </div>
          <div className="mt-4">
            <TextAreaField label="Remarks" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Delivery, handling, or invoice remarks" rows={3} />
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Sales Order items</h2>
            <p className="mt-1 text-sm text-slate-500">Search the ERPNext catalogue, add required items, then review the compact order list. Customer-specific prices, discounts, taxes, and schemes are calculated by ERPNext.</p>
          </div>
          <div className="mb-4 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3"><input value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} placeholder="Search item code or item name" className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />{catalogueLoading ? <p className="px-2 pt-2 text-xs text-slate-500">Searching catalogue...</p> : null}{itemSearch || catalogueItems.length ? <div className="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl bg-white">{catalogueItems.map((product) => <button type="button" key={product.itemCode} onClick={() => addItem(product)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left hover:bg-blue-50"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{product.itemName}</span><span className="block truncate text-xs text-slate-500">{product.itemCode} · {product.stockUom || "UOM pending"}</span></span><span className="shrink-0 text-right text-xs font-semibold text-[#105B92]">{product.rate === null ? "Rate on ERPNext" : formatCurrency(product.rate)}<span className="block font-normal">Add</span></span></button>)}</div> : null}</div>
          <div className="space-y-4">
            {!lines.length ? <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">Search and add one or more items to begin.</p> : null}
            {lines.map((line) => {
              const pricedLine = pricingByItemCode.get(line.itemCode);
              return (
              <div key={line.id} className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1.3fr)_0.9fr_0.8fr_auto] sm:items-center sm:p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{line.itemName}</p>
                  <p className="truncate text-sm text-slate-500">{line.itemCode || "Item code pending"} | {line.uom}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateQty(line.id, -1)} className="h-10 w-10 rounded-full border border-slate-200 text-lg text-slate-700">
                    -
                  </button>
                  <div className="min-w-12 rounded-2xl bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-800">
                    {line.qty}
                  </div>
                  <button type="button" onClick={() => updateQty(line.id, 1)} className="h-10 w-10 rounded-full border border-slate-200 text-lg text-slate-700">
                    +
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                  {pricedLine ? formatCurrency(pricedLine.amount) : line.rate ? formatCurrency(line.qty * line.rate) : "ERPNext price"}
                  {pricedLine?.discountPercentage ? <span className="mt-1 block text-xs font-medium text-emerald-700">{pricedLine.discountPercentage}% ERPNext discount</span> : null}
                </div>
                <button type="button" onClick={() => removeItem(line.id)} className="justify-self-start text-sm font-semibold text-rose-600 sm:justify-self-auto">Remove</button>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Order total</h2>
            <p className="mt-1 text-sm text-slate-500">This preview is calculated by ERPNext for the mapped distributor customer. ERPNext recalculates once more when the order is created.</p>
          </div>
          <div className="space-y-3">
            <StatePanel
              tone={pricingPreview ? "blue" : "slate"}
              title={pricingLoading ? "Updating ERPNext pricing..." : `Order total: ${formatCurrency(totals.grandTotal)}`}
              description={pricingPreview ? `${pricingPreview.mode === "basic" ? "Base item-rate preview" : "Authoritative ERPNext preview"} | Items ${formatCurrency(totals.subtotal)} | Taxes ${formatCurrency(totals.tax)}${pricingPreview.sellingPriceList ? ` | ${pricingPreview.sellingPriceList}` : ""}` : "No price preview is available yet."}
            />
            {pricingMessage ? <p className={`text-xs ${pricingPreview ? "text-emerald-700" : "text-amber-700"}`}>{pricingMessage}</p> : null}
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSaveStatus("Sales Order draft saved on this device.")}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={submitting || !deliveryDate || !lines.length}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    if (lines.length && !pricingPreview) {
                      // A failed preview never supplies a client rate. The Sales Order API still asks ERPNext to calculate prices authoritatively.
                      setSaveStatus("Live price preview is unavailable. ERPNext will calculate the final price when the order is created.");
                    }
                    const result = await submitDistributorAction("/api/distributor/orders", {
                      deliveryDate,
                      shipTo,
                      poReference,
                      remarks: instructions,
                      lines,
                    });
                    clearDistributorDraftState(checkoutDraftKeys);
                    setDeliveryDate("");
                    setShipTo(savedAddresses[0]?.label || "");
                    setPoReference("");
                    setInstructions("");
                    setLines([]);
                    setSaveStatus(result.message || "Sales Order created successfully.");
                    await refresh();
                  } catch (error) {
                    setSaveStatus(error.message || "Failed to create Sales Order");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Place order"}
              </button>
            </div>
            {saveStatus ? <StatePanel tone="blue" title="Order action" description={saveStatus} /> : null}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export function StockRequestWorkbench() {
  const { data, refresh } = useDistributorAppData();
  const products = data.products || [];
  const stockDraftKeys = [
    "distributor-draft-stock-item",
    "distributor-draft-stock-qty",
    "distributor-draft-stock-need-by",
    "distributor-draft-stock-remarks",
    "distributor-draft-stock-notify-sales",
  ];
  const [item, setItem] = useDistributorDraftState("distributor-draft-stock-item", products[0]?.itemCode || products[0]?.id || "");
  const [qty, setQty] = useDistributorDraftState("distributor-draft-stock-qty", "");
  const [needBy, setNeedBy] = useDistributorDraftState("distributor-draft-stock-need-by", "");
  const [reason, setReason] = useDistributorDraftState("distributor-draft-stock-remarks", "");
  const [notifySales, setNotifySales] = useDistributorDraftState("distributor-draft-stock-notify-sales", true);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!item && products[0]?.itemCode) {
      setItem(products[0].itemCode);
    }
  }, [item, products]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Material Request details</h2>
          <p className="mt-1 text-sm text-slate-500">Submit an ERPNext-aligned stock request with the item, quantity, required date, and remarks.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Item code"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            options={products.length ? products.map((product) => ({ value: product.itemCode || product.id, label: `${product.itemCode || product.id} - ${product.itemName || product.name}` })) : [{ value: "", label: "No ERPNext Item records connected yet" }]}
          />
          <InputField label="Qty" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="24" type="number" />
          <InputField label="Schedule date" type="date" value={needBy} onChange={(e) => setNeedBy(e.target.value)} />
        </div>
        <div className="mt-4 space-y-4">
          <TextAreaField label="Remarks" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why stock is needed and what triggered the request." rows={4} />
          <ToggleField label="Notify sales coordinator" checked={notifySales} onChange={(e) => setNotifySales(e.target.checked)} hint="Send the request to the assigned sales coordinator for follow-up." />
          <button
            type="button"
            onClick={async () => {
              try {
                setSubmitting(true);
                const selectedProduct = products.find((product) => (product.itemCode || product.id) === item);
                const result = await submitDistributorAction("/api/distributor/material-requests", {
                  itemCode: item,
                  itemName: selectedProduct?.itemName || "",
                  quantity: Number(qty || 0),
                  scheduleDate: needBy,
                  remarks: reason,
                  notifySales,
                });
                clearDistributorDraftState(stockDraftKeys);
                setItem(products[0]?.itemCode || products[0]?.id || "");
                setQty("");
                setNeedBy("");
                setReason("");
                setNotifySales(true);
                setStatus(result.message || "Material Request submitted successfully.");
                await refresh();
              } catch (error) {
                setStatus(error.message || "Failed to submit Material Request");
              } finally {
                setSubmitting(false);
              }
            }}
            className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
          {status ? <StatePanel tone="blue" title="Request status" description={status} /> : null}
        </div>
      </div>

    </div>
  );
}

export function FinancePaymentDesk() {
  const { data, refresh } = useDistributorAppData();
  const invoices = data.invoices || [];
  const financeDraftKeys = [
    "distributor-draft-finance-invoice-id",
    "distributor-draft-finance-payment-mode",
    "distributor-draft-finance-amount",
    "distributor-draft-finance-reference",
    "distributor-draft-finance-follow-up",
  ];
  const [invoiceId, setInvoiceId] = useDistributorDraftState("distributor-draft-finance-invoice-id", invoices[0]?.invoiceNumber || invoices[0]?.id || "");
  const [paymentMode, setPaymentMode] = useDistributorDraftState("distributor-draft-finance-payment-mode", "bank");
  const [amount, setAmount] = useDistributorDraftState("distributor-draft-finance-amount", "");
  const [reference, setReference] = useDistributorDraftState("distributor-draft-finance-reference", "");
  const [followUp, setFollowUp] = useDistributorDraftState("distributor-draft-finance-follow-up", true);
  const [proofFile, setProofFile] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!invoiceId && (invoices[0]?.invoiceNumber || invoices[0]?.id)) {
      setInvoiceId(invoices[0]?.invoiceNumber || invoices[0]?.id || "");
    }
  }, [invoiceId, invoices]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Payment follow-up</h2>
        <p className="mt-1 text-sm text-slate-500">Capture payment updates against ERPNext Sales Invoice records.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Sales Invoice"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          options={invoices.length ? invoices.map((invoice) => ({ value: invoice.invoiceNumber || invoice.id, label: `${invoice.invoiceNumber || invoice.id} - ${invoice.remainingAmount || invoice.openBalance || invoice.balance || "-"}` })) : [{ value: "", label: "No Sales Invoices available" }]}
        />
        <SelectField
          label="Payment mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          options={financePaymentModeOptions}
        />
        <InputField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter payment amount" />
        <InputField label="Reference / UTR / cheque no" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter payment reference" />
      </div>
      <div className="mt-4 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Payment proof</span>
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
          />
        </label>
        <ToggleField label="Notify accounts team" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} hint="Share this payment update with the accounts team for follow-up." />
        <button
          type="button"
          onClick={async () => {
            try {
              setSubmitting(true);
              const result = await submitDistributorAction("/api/distributor/payment-updates", {
                invoiceNumber: invoiceId,
                paymentMode,
                amount: Number(amount || 0),
                reference,
                notifyAccounts: followUp,
              });
              let finalMessage = result.message || `Payment follow-up captured for ${invoiceId}.`;
              if (proofFile && result.updateNumber) {
                try {
                  await uploadDistributorWorkflowAttachment("paymentUpdate", result.updateNumber, proofFile);
                  finalMessage = `${finalMessage} Proof uploaded.`;
                  setProofFile(null);
                } catch (uploadError) {
                  finalMessage = `${finalMessage} Payment proof upload is still pending. ${uploadError.message || ""}`.trim();
                }
              }
              clearDistributorDraftState(financeDraftKeys);
              setInvoiceId(invoices[0]?.invoiceNumber || invoices[0]?.id || "");
              setPaymentMode("bank");
              setAmount("");
              setReference("");
              setFollowUp(true);
              setStatus(finalMessage);
              await refresh();
            } catch (error) {
              setStatus(error.message || "Failed to save payment update");
            } finally {
              setSubmitting(false);
            }
          }}
          className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
        >
          {submitting ? "Saving..." : "Save payment update"}
        </button>
        {status ? <StatePanel tone="blue" title="Payment update" description={status} /> : null}
      </div>
    </div>
  );
}

export function DispatchFeedbackDesk({ dispatchId }) {
  const { data, refresh } = useDistributorAppData();
  const dispatches = data.dispatches || [];
  const invoices = data.invoices || [];
  const dispatch = dispatches.find((item) => [item.documentNumberDelivery, item.deliveryNumber, item.id].includes(dispatchId)) || dispatches[0];
  const dispatchSalesOrder = getRecordValue(dispatch || {}, ["salesOrder", "order", "salesOrderId"]);
  const linkedInvoice = dispatch ? invoices.find((invoice) => getRecordValue(invoice, ["salesOrder", "orderId", "salesOrderId"]) === dispatchSalesOrder) || invoices[0] : null;
  const dispatchDraftPrefix = `distributor-draft-dispatch-${dispatchId || dispatch?.id || "default"}`;
  const dispatchDraftKeys = [
    `${dispatchDraftPrefix}-status`,
    `${dispatchDraftPrefix}-issue-type`,
    `${dispatchDraftPrefix}-remarks`,
    `${dispatchDraftPrefix}-notify-claims`,
  ];
  const [status, setStatus] = useDistributorDraftState(`${dispatchDraftPrefix}-status`, "ok");
  const [issueType, setIssueType] = useDistributorDraftState(`${dispatchDraftPrefix}-issue-type`, "misbill");
  const [remarks, setRemarks] = useDistributorDraftState(`${dispatchDraftPrefix}-remarks`, "");
  const [notifyClaims, setNotifyClaims] = useDistributorDraftState(`${dispatchDraftPrefix}-notify-claims`, true);
  const [saved, setSaved] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-4">
      <StatePanel tone="blue" title={linkedInvoice ? `Linked Sales Invoice: ${linkedInvoice.invoiceNumber || linkedInvoice.id}` : "Linked Sales Invoice: not available"} description="Delivery feedback should remain tied to ERPNext Sales Invoice and Delivery Note records." />
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
          <TextAreaField label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add Delivery Note issue remarks for ERPNext follow-up" rows={4} />
        </>
      ) : (
        <TextAreaField label="Delivery remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional Delivery Note acknowledgement" rows={3} />
      )}
      <ToggleField label="Notify claims / accounts" checked={notifyClaims} onChange={(e) => setNotifyClaims(e.target.checked)} hint="Share delivery issues with the claims and accounts teams." />
      <button
        type="button"
        onClick={async () => {
          try {
            setSubmitting(true);
            const result = await submitDistributorAction("/api/distributor/dispatch-reviews", {
              deliveryNoteNumber: dispatch.documentNumberDelivery || dispatch.id,
              salesOrderNumber: dispatch.salesOrder || dispatch.order || "",
              salesInvoiceNumber: linkedInvoice?.invoiceNumber || linkedInvoice?.id || "",
              reviewStatus: status === "ok" ? "All Ok" : "Issue",
              issueType: status === "issue" ? issueType : "",
              remarks,
              notifyClaims,
            });
            clearDistributorDraftState(dispatchDraftKeys);
            setStatus("ok");
            setIssueType("misbill");
            setRemarks("");
            setNotifyClaims(true);
            setSaved(result.message || `Delivery Note ${dispatch.documentNumberDelivery || dispatch.id} review saved.`);
            await refresh();
          } catch (error) {
            setSaved(error.message || "Failed to save dispatch review");
          } finally {
            setSubmitting(false);
          }
        }}
        className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
      >
        {submitting ? "Saving..." : "Save dispatch feedback"}
      </button>
      {saved ? <StatePanel tone="blue" title="Dispatch review" description={saved} /> : null}
    </div>
  );
}

export function ComplaintFormWorkbench() {
  const { data, refresh } = useDistributorAppData();
  const invoices = data.invoices || [];
  const complaintDraftKeys = [
    "distributor-draft-complaint-invoice-id",
    "distributor-draft-complaint-type",
    "distributor-draft-complaint-remarks",
    "distributor-draft-complaint-attach-proof",
  ];
  const [invoiceId, setInvoiceId] = useDistributorDraftState("distributor-draft-complaint-invoice-id", invoices[0]?.invoiceNumber || invoices[0]?.id || "");
  const [type, setType] = useDistributorDraftState("distributor-draft-complaint-type", complaintTypeOptions[0].value);
  const [remarks, setRemarks] = useDistributorDraftState("distributor-draft-complaint-remarks", "");
  const [attachProof, setAttachProof] = useDistributorDraftState("distributor-draft-complaint-attach-proof", true);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!invoiceId && (invoices[0]?.invoiceNumber || invoices[0]?.id)) {
      setInvoiceId(invoices[0]?.invoiceNumber || invoices[0]?.id || "");
    }
  }, [invoiceId, invoices]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Invoice complaint details</h2>
          <p className="mt-1 text-sm text-slate-500">ERPNext-aligned complaint capture against Sales Invoice and delivery follow-up.</p>
        </div>
        <div className="space-y-4">
          <SelectField
            label="Sales Invoice"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            options={invoices.length ? invoices.map((invoice) => ({ value: invoice.invoiceNumber || invoice.id, label: `${invoice.invoiceNumber || invoice.id} - ${invoice.grandTotal || invoice.amount || "-"}` })) : [{ value: "", label: "No Sales Invoices available" }]}
          />
          <SelectField
            label="Issue category"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={complaintTypeOptions}
          />
          <TextAreaField label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Describe the exact issue seen on invoice or delivery." rows={4} />
          <ToggleField label="Attachment will be added" checked={attachProof} onChange={(e) => setAttachProof(e.target.checked)} hint="Use this when invoice proof or supporting documents are required." />
          {attachProof ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Support file</span>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              try {
                setSubmitting(true);
                const result = await submitDistributorAction("/api/distributor/complaints", {
                  invoiceNumber: invoiceId,
                  complaintType: type,
                  remarks,
                  attachmentExpected: attachProof,
                });
                let finalMessage = result.message || `Complaint submitted for Sales Invoice ${invoiceId}.`;
                if (attachmentFile && result.complaintNumber) {
                  try {
                    await uploadDistributorWorkflowAttachment("complaint", result.complaintNumber, attachmentFile);
                    finalMessage = `${finalMessage} Support file uploaded.`;
                    setAttachmentFile(null);
                  } catch (uploadError) {
                    finalMessage = `${finalMessage} Support file upload is still pending. ${uploadError.message || ""}`.trim();
                  }
                }
                clearDistributorDraftState(complaintDraftKeys);
                setInvoiceId(invoices[0]?.invoiceNumber || invoices[0]?.id || "");
                setType(complaintTypeOptions[0].value);
                setRemarks("");
                setAttachProof(true);
                setStatus(finalMessage);
                await refresh();
              } catch (error) {
                setStatus(error.message || "Failed to submit complaint");
              } finally {
                setSubmitting(false);
              }
            }}
            className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white"
          >
            {submitting ? "Submitting..." : "Submit complaint"}
          </button>
          {status ? <StatePanel tone="blue" title="Complaint action" description={status} /> : null}
        </div>
      </div>

    </div>
  );
}

export function TeamAccessWorkbench() {
  const [selectedRole, setSelectedRole] = useDistributorDraftState("distributor-draft-access-role", accessRoles[1].role);
  const [mobile, setMobile] = useDistributorDraftState("distributor-draft-access-mobile", "");
  const [email, setEmail] = useDistributorDraftState("distributor-draft-access-email", "");
  const [name, setName] = useDistributorDraftState("distributor-draft-access-name", "");
  const [loginEnabled, setLoginEnabled] = useDistributorDraftState("distributor-draft-access-login-enabled", true);
  const [financeAccess, setFinanceAccess] = useDistributorDraftState("distributor-draft-access-finance", false);
  const [status, setStatus] = useState("");

  const activeRole = accessRoles.find((role) => role.role === selectedRole) || accessRoles[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Team user access</h2>
          <p className="mt-1 text-sm text-slate-500">Set up distributor login users and assign role-based access by mobile number.</p>
        </div>
        <div className="space-y-4">
          <InputField label="User name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter team member name" />
          <InputField label="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mapped OTP login mobile" />
          <InputField label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Mapped OTP login email" />
          <SelectField
            label="Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={accessRoles.map((role) => ({ value: role.role, label: role.role }))}
          />
          <ToggleField label="OTP login enabled" checked={loginEnabled} onChange={(e) => setLoginEnabled(e.target.checked)} hint="Allow sign-in for this mapped mobile number." />
          <ToggleField label="Extra finance permission" checked={financeAccess} onChange={(e) => setFinanceAccess(e.target.checked)} hint="Use this only for approved accounts users." />
          <button
            type="button"
            onClick={() => setStatus(`${name || "Team user"} prepared with ${selectedRole} access using ${email ? "email and mobile" : "mobile"} OTP.`)}
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
          <StatePanel tone="slate" title={activeRole.role} description={`${activeRole.scope} - ${activeRole.modules}`} />
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

export function WorkflowAttachmentUploader({ type, number }) {
  const { refresh } = useDistributorAppData();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Add document</p>
        <p className="mt-1 text-xs text-slate-500">Upload invoice proof, payment reference, or supporting PDF/image.</p>
      </div>
      <input
        type="file"
        accept=".pdf,image/png,image/jpeg"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
      />
      <button
        type="button"
        disabled={!file || submitting}
        onClick={async () => {
          try {
            setSubmitting(true);
            const result = await uploadDistributorWorkflowAttachment(type, number, file);
            setStatus(result.message || "Attachment uploaded successfully.");
            setFile(null);
            await refresh();
          } catch (error) {
            setStatus(error.message || "Failed to upload attachment");
          } finally {
            setSubmitting(false);
          }
        }}
        className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Uploading..." : "Upload document"}
      </button>
      {status ? <StatePanel tone="blue" title="Attachment" description={status} /> : null}
    </div>
  );
}
