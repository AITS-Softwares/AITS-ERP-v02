"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["Overview", "/distributor/admin"],
  ["ERPNext connection", "/distributor/admin/setup"],
  ["Distributor accounts", "/distributor/admin/accounts"],
  ["Customer mapping", "/distributor/admin/mapping"],
  ["Distributor users", "/distributor/admin/users"],
  ["OTP readiness", "/distributor/admin/otp"],
  ["Operations", "/distributor/admin/operations"],
  ["Sync logs", "/distributor/admin/sync-logs"],
  ["ERPNext fields", "/distributor/admin/data-contract"],
  ["Bulk management", "/distributor/admin/bulk-management"],
];

export default function DistributorAdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isPublicAdminRoute = pathname === "/distributor/admin/signin" || pathname === "/distributor/admin/register";

  useEffect(() => {
    if (isPublicAdminRoute) {
      setReady(true);
      return;
    }
    if (!window.localStorage.getItem("distributor-admin-token")) {
      router.replace("/distributor/admin/signin");
      return;
    }
    setReady(true);
  }, [isPublicAdminRoute, router]);

  if (!ready) return <div className="min-h-screen bg-slate-50" />;
  if (isPublicAdminRoute) return children;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/distributor/admin" className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Distributor App</p>
            <p className="text-lg font-semibold text-[#105B92]">Administration</p>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/distributor/signin" className="text-sm font-medium text-slate-600 hover:text-[#105B92]">Distributor login</Link>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              onClick={() => {
                window.localStorage.removeItem("distributor-admin-token");
                router.replace("/distributor/admin/signin");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium ${pathname === href ? "bg-[#105B92] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
