"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearStoredDistributorToken,
  getStoredDistributorToken,
  hasValidDistributorSession,
} from "@/lib/distributorClientSession";

const defaultData = {
  profile: null,
  categories: [],
  products: [],
  stockItems: [],
  orders: [],
  invoices: [],
  dispatches: [],
  creditNotes: [],
  financeSummary: [],
  ledgerEntries: [],
  dashboardStats: [],
  notifications: [],
  offers: [],
  complaints: [],
  materialRequests: [],
  paymentUpdates: [],
  dispatchReviews: [],
  teamMembers: [],
  savedAddresses: [],
  source: null,
};

const DistributorDataContext = createContext({
  loading: true,
  data: defaultData,
  refresh: async () => {},
});

export function DistributorDataProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(defaultData);

  async function refresh() {
    if (!hasValidDistributorSession()) {
      clearStoredDistributorToken();
      setData(defaultData);
      setLoading(false);
      router.replace("/distributor/signin");
      return;
    }

    const token = getStoredDistributorToken();
    setLoading(true);
    try {
      const res = await fetch("/api/distributor/app", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 401) {
        clearStoredDistributorToken();
        setData(defaultData);
        router.replace("/distributor/signin");
        return;
      }
      if (!res.ok) throw new Error(payload.message || "Failed to load distributor data");
      setData(payload.data || defaultData);
    } catch (error) {
      console.error("Distributor app data client error:", error);
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!pathname?.startsWith("/distributor")) return;
    refresh();
  }, [pathname]);

  const value = useMemo(() => ({ loading, data, refresh }), [loading, data]);

  return <DistributorDataContext.Provider value={value}>{children}</DistributorDataContext.Provider>;
}

export function useDistributorAppData() {
  return useContext(DistributorDataContext);
}
