"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiBell,
  FiBox,
  FiClipboard,
  FiCreditCard,
  FiGift,
  FiGrid,
  FiKey,
  FiHeadphones,
  FiMenu,
  FiPackage,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";
import { distributorUser } from "@/components/distributor/mockData";

const navGroups = [
  { title: "Overview", items: [{ label: "Dashboard", href: "/distributor", icon: FiGrid }] },
  {
    title: "Commerce",
    items: [
      { label: "Products", href: "/distributor/products", icon: FiBox },
      { label: "Orders", href: "/distributor/orders", icon: FiPackage },
      { label: "Stock", href: "/distributor/stock", icon: FiClipboard },
      { label: "Invoices", href: "/distributor/invoices", icon: FiCreditCard },
      { label: "Finance", href: "/distributor/finance", icon: FiCreditCard },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Complaints", href: "/distributor/complaints", icon: FiClipboard },
      { label: "Credit Notes", href: "/distributor/credit-notes", icon: FiCreditCard },
      { label: "Dispatch", href: "/distributor/dispatch", icon: FiTruck },
      { label: "Notifications", href: "/distributor/notifications", icon: FiBell },
      { label: "Offers", href: "/distributor/offers", icon: FiGift },
      { label: "Access", href: "/distributor/access", icon: FiKey },
      { label: "Support", href: "/distributor/support", icon: FiHeadphones },
      { label: "Profile", href: "/distributor/profile", icon: FiUser },
    ],
  },
];

const mobileNav = [
  { label: "Home", href: "/distributor", icon: FiGrid },
  { label: "Products", href: "/distributor/products", icon: FiBox },
  { label: "Orders", href: "/distributor/orders", icon: FiPackage },
  { label: "Profile", href: "/distributor/profile", icon: FiUser },
];

function navIsActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DistributorShell({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900">
      {open ? <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" /> : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <Link href="/distributor" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#105B92] text-lg font-semibold text-white">EX</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">ERPExpress</p>
              <p className="text-lg font-semibold text-slate-900">Distributor App</p>
            </div>
          </Link>
          <button className="rounded-xl p-2 text-slate-500 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <FiX size={20} />
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Account</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{distributorUser.name || "Distributor account"}</p>
          <p className="mt-1 text-xs text-slate-500">
            {distributorUser.code || "No distributor code linked"}{distributorUser.city ? ` • ${distributorUser.city}` : ""}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">{distributorUser.userRole || "Role not assigned"}</p>
        </div>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pb-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{group.title}</p>
              <div className="mt-3 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = navIsActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                        active ? "bg-[#105B92] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
                <FiMenu size={20} />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Distributor App</p>
                <h1 className="text-base font-semibold text-slate-900 sm:text-lg">Distributor workspace</h1>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Setup mode</div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{distributorUser.route || "No route mapped"}</p>
                <p className="text-xs text-slate-500">{distributorUser.preferredWarehouse || "No warehouse mapped"}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                  active ? "bg-blue-50 text-[#105B92]" : "text-slate-500",
                ].join(" ")}
              >
                <Icon size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
