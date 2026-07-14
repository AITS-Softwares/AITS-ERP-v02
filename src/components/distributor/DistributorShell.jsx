"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiBell,
  FiChevronLeft,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import {
  distributorNavGroups,
  distributorMobileNav,
  getDistributorHeaderMeta,
  getParentDistributorPath,
  getRouteLabel,
  navIsActive,
} from "@/components/distributor/distributorNav";

export default function DistributorShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [previousPath, setPreviousPath] = useState("");
  const { loading, data, markNotificationRead, markAllNotificationsRead } = useDistributorAppData();
  const profile = data.profile || {};
  const notifications = data.notifications || [];
  const latestNotifications = notifications.slice(0, 5);
  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const source = data.source || null;
  const headerMeta = useMemo(() => getDistributorHeaderMeta(pathname), [pathname]);
  const sourceTone = source?.mode === "erpnext"
    ? "emerald"
    : ["erpnext-error", "erpnext-not-mapped", "erpnext-not-configured"].includes(source?.mode)
      ? "amber"
      : "slate";
  const sourceLabel = loading
    ? "Loading"
    : source?.mode === "erpnext"
      ? "Live ERPNext"
      : source?.mode === "erpnext-error"
        ? "Sync issue"
        : ["erpnext-not-mapped", "erpnext-not-configured"].includes(source?.mode)
          ? "Setup required"
          : "Workspace";
  const sourceDetail = source?.mode === "erpnext"
    ? profile.preferredWarehouse || "ERPNext customer linked"
    : source?.mode === "erpnext-not-mapped"
      ? "Map this distributor to an ERPNext customer"
      : source?.mode === "erpnext-not-configured"
        ? "Complete ERPNext connection setup"
        : source?.mode === "erpnext-error"
          ? "Check ERPNext field mapping and sync"
          : profile.preferredWarehouse || "Distributor workspace";
  const mobileBackPath = useMemo(() => {
    if (previousPath && previousPath.startsWith("/distributor") && previousPath !== pathname) {
      return previousPath;
    }
    return getParentDistributorPath(pathname);
  }, [pathname, previousPath]);
  const mobileBackLabel = useMemo(() => {
    if (!mobileBackPath) return "";
    return `Back to ${getRouteLabel(mobileBackPath)}`;
  }, [mobileBackPath]);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname?.startsWith("/distributor")) return;

    const currentPath = window.sessionStorage.getItem("distributor-current-path") || "";
    const storedPreviousPath = window.sessionStorage.getItem("distributor-previous-path") || "";

    if (currentPath && currentPath !== pathname) {
      window.sessionStorage.setItem("distributor-previous-path", currentPath);
      setPreviousPath(currentPath);
    } else {
      setPreviousPath(storedPreviousPath);
    }

    window.sessionStorage.setItem("distributor-current-path", pathname);
  }, [pathname]);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

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
          <p className="mt-2 text-sm font-semibold text-slate-900">{profile.name || "Distributor account"}</p>
          <p className="mt-1 text-xs text-slate-500">
            {profile.code || "No distributor code linked"}{profile.city ? ` | ${profile.city}` : ""}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">{profile.userRole || "Role not assigned"}</p>
        </div>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pb-6">
          {distributorNavGroups.map((group) => (
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{headerMeta.eyebrow}</p>
                <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{headerMeta.title}</h1>
                {mobileBackPath ? (
                  <button
                    type="button"
                    onClick={() => router.push(mobileBackPath)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#105B92] lg:hidden"
                  >
                    <FiChevronLeft size={14} />
                    <span>{mobileBackLabel}</span>
                  </button>
                ) : null}
                <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                  {headerMeta.breadcrumbs.map((crumb, index) => (
                    <span key={`${crumb.href}-${crumb.label}`} className="inline-flex items-center gap-1">
                      {index > 0 ? <span>/</span> : null}
                      {index === headerMeta.breadcrumbs.length - 1 ? (
                        <span className="font-semibold text-slate-700">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="transition hover:text-[#105B92]">
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  className="relative rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
                  aria-label="Open notifications"
                >
                  <FiBell size={18} />
                  {unreadNotifications.length ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#105B92] px-1 text-[10px] font-semibold text-white">
                      {Math.min(unreadNotifications.length, 9)}
                    </span>
                  ) : null}
                </button>
                {notificationsOpen ? (
                  <div className="absolute right-0 top-12 z-40 w-[320px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:w-[360px]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Recent alerts</p>
                        <p className="text-xs text-slate-500">Latest invoice, order, dispatch, and offer updates.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadNotifications.length ? (
                          <button
                            type="button"
                            onClick={markAllNotificationsRead}
                            className="text-xs font-semibold text-slate-500 transition hover:text-[#105B92]"
                          >
                            Mark all as read
                          </button>
                        ) : null}
                        <Link href="/distributor/notifications" className="text-xs font-semibold text-[#105B92]">
                          View all
                        </Link>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {latestNotifications.length ? latestNotifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(item.id);
                            router.push(item.href || "/distributor/notifications");
                          }}
                          className={[
                            "block w-full rounded-2xl border p-3 text-left transition hover:bg-slate-50",
                            item.isRead
                              ? "border-slate-200 bg-slate-50/60 opacity-75"
                              : "border-blue-200 bg-blue-50/70 shadow-sm",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.type || "alert"}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">{item.time}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{item.body}</p>
                          <p className="mt-2 text-xs font-semibold text-[#105B92]">Open item</p>
                        </button>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                          No alerts available yet.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                sourceTone === "emerald"
                  ? "bg-emerald-100 text-emerald-700"
                  : sourceTone === "amber"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700",
              ].join(" ")}>{sourceLabel}</div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{profile.route || "No territory mapped"}</p>
                <p className="text-xs text-slate-500">{sourceDetail}</p>
              </div>
            </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {distributorMobileNav.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-w-[72px] flex-col items-center rounded-2xl px-3 py-2 text-[11px] font-medium transition",
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
