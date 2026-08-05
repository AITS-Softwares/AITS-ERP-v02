"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiBox, FiClipboard, FiDatabase, FiGrid, FiLink, FiMapPin, FiShoppingCart } from "react-icons/fi";

const navigation = [
  { href: "/wms", label: "Control Center", icon: FiGrid },
  { href: "/wms/items", label: "Items", icon: FiBox },
  { href: "/wms/warehouses", label: "Warehouses", icon: FiMapPin },
  { href: "/wms/uoms", label: "Units of Measure", icon: FiDatabase },
  { href: "/wms/purchase-orders", label: "Purchase Orders", icon: FiShoppingCart },
  { href: "/wms/grn", label: "GRN", icon: FiClipboard },
  { href: "/wms/setup", label: "ERPNext Connection", icon: FiLink },
];

export default function WmsShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Session expired")))
      .then((payload) => setUser(payload.user || null))
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/signin");
      });
  }, [router]);

  if (!user) {
    return <div className="grid min-h-screen place-items-center bg-slate-950"><div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-white md:px-7">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <Link href="/wms" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 font-black text-slate-950">W</span>
            <span><span className="block text-base font-bold tracking-wide">AITSERP WMS</span><span className="block text-xs text-slate-400">ERPNext-connected warehouse operations</span></span>
          </Link>
          <div className="hidden text-right text-sm md:block"><p className="font-semibold">{user.name || user.email}</p><p className="text-xs text-slate-400">Warehouse workspace</p></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-[calc(100vh-73px)] w-64 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
          <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Warehouse</p>
          <nav className="space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = href === "/wms" ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-cyan-50 text-cyan-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon size={17} />{label}</Link>;
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-7">{children}</main>
      </div>
      <nav className="sticky bottom-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
        {navigation.slice(0, 5).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-3 text-[10px] ${pathname === href ? "text-cyan-700" : "text-slate-500"}`}><Icon size={17} /><span className="truncate">{label.split(" ")[0]}</span></Link>)}
      </nav>
    </div>
  );
}

