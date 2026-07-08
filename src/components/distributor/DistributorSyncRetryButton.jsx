"use client";

import { useState } from "react";
import { StatePanel } from "@/components/distributor/DistributorUI";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";

function getDistributorToken() {
  return typeof window !== "undefined" ? localStorage.getItem("distributor_token") || "" : "";
}

export default function DistributorSyncRetryButton({ type, number, label = "Retry ERPNext sync" }) {
  const { refresh } = useDistributorAppData();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onRetry() {
    try {
      setLoading(true);
      const token = getDistributorToken();
      const res = await fetch("/api/distributor/workflows/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, number }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || "Retry failed");
      setMessage(payload.message || "ERPNext sync retried successfully.");
      await refresh();
    } catch (error) {
      setMessage(error.message || "Retry failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onRetry}
        disabled={loading}
        className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Retrying..." : label}
      </button>
      {message ? <StatePanel tone="blue" title="ERPNext sync" description={message} /> : null}
    </div>
  );
}
