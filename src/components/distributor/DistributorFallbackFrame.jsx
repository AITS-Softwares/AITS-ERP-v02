"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiHome, FiRefreshCw } from "react-icons/fi";
import { distributorMobileNav, navIsActive } from "@/components/distributor/distributorNav";
import {
  getDistributorRecoveryLabel,
  getDistributorRecoveryTarget,
} from "@/lib/distributorClientSession";

export default function DistributorFallbackFrame({
  title,
  message,
  primaryHref = "auto",
  primaryLabel = "",
  onRetry,
  showBottomNav = true,
}) {
  const pathname = usePathname();
  const [resolvedPrimaryHref, setResolvedPrimaryHref] = useState(primaryHref === "auto" ? "/distributor/signin" : primaryHref);
  const [resolvedPrimaryLabel, setResolvedPrimaryLabel] = useState(primaryLabel || "Go to distributor login");

  useEffect(() => {
    if (primaryHref === "auto") {
      setResolvedPrimaryHref(getDistributorRecoveryTarget());
      setResolvedPrimaryLabel(primaryLabel || getDistributorRecoveryLabel());
      return;
    }

    setResolvedPrimaryHref(primaryHref);
    setResolvedPrimaryLabel(primaryLabel || "Continue");
  }, [primaryHref, primaryLabel]);

  return (
    <main className={`min-h-screen px-4 py-8 ${showBottomNav ? "bg-[radial-gradient(circle_at_top,_#1a75b5,_#105B92_45%,_#0b2034_100%)] text-white" : "bg-transparent text-slate-900"}`}>
      <div className={`mx-auto flex ${showBottomNav ? "min-h-[calc(100vh-7rem)] max-w-md" : "max-w-3xl"} flex-col justify-center`}>
        <section className={`rounded-[2rem] p-6 shadow-2xl sm:p-8 ${showBottomNav ? "border border-white/15 bg-white/10 backdrop-blur" : "border border-slate-200 bg-white"}`}>
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${showBottomNav ? "bg-white/15 text-white" : "bg-[#105B92] text-white"}`}>
            <FiAlertCircle size={28} />
          </div>
          <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.24em] ${showBottomNav ? "text-blue-100" : "text-slate-400"}`}>Distributor App</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">{title}</h1>
          <p className={`mt-3 text-sm ${showBottomNav ? "text-blue-50" : "text-slate-600"}`}>{message}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={resolvedPrimaryHref}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${showBottomNav ? "bg-white text-[#105B92]" : "bg-[#105B92] text-white"}`}
            >
              <FiHome size={16} />
              <span>{resolvedPrimaryLabel}</span>
            </Link>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${showBottomNav ? "border border-white/20 bg-white/10 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
              >
                <FiRefreshCw size={16} />
                <span>Try again</span>
              </button>
            ) : null}
          </div>
        </section>
      </div>

      {showBottomNav ? (
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b2034]/90 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {distributorMobileNav.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(pathname || "", item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-w-[72px] flex-col items-center rounded-2xl px-3 py-2 text-[11px] font-medium transition",
                  active ? "bg-white text-[#105B92]" : "text-blue-100",
                ].join(" ")}
              >
                <Icon size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      ) : null}
    </main>
  );
}
