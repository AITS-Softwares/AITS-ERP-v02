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
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
});

const NOTIFICATION_READS_KEY = "distributor-notification-reads";

function getStoredReadNotificationIds() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_READS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeReadNotificationIds(ids) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(NOTIFICATION_READS_KEY, JSON.stringify([...new Set(ids.filter(Boolean))]));
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}

function applyNotificationReadState(payload) {
  const readIds = new Set(getStoredReadNotificationIds());
  return {
    ...payload,
    notifications: (payload.notifications || []).map((item) => ({
      ...item,
      isRead: readIds.has(item.id),
    })),
  };
}

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
      setData(applyNotificationReadState(payload.data || defaultData));
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

  function markNotificationRead(notificationId) {
    if (!notificationId) return;

    const nextReadIds = [...new Set([...getStoredReadNotificationIds(), notificationId])];
    storeReadNotificationIds(nextReadIds);

    setData((current) => ({
      ...current,
      notifications: (current.notifications || []).map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      ),
    }));
  }

  function markAllNotificationsRead() {
    const allIds = (data.notifications || []).map((item) => item.id).filter(Boolean);
    if (!allIds.length) return;

    const nextReadIds = [...new Set([...getStoredReadNotificationIds(), ...allIds])];
    storeReadNotificationIds(nextReadIds);

    setData((current) => ({
      ...current,
      notifications: (current.notifications || []).map((item) => ({ ...item, isRead: true })),
    }));
  }

  const value = useMemo(
    () => ({ loading, data, refresh, markNotificationRead, markAllNotificationsRead }),
    [loading, data]
  );

  return <DistributorDataContext.Provider value={value}>{children}</DistributorDataContext.Provider>;
}

export function useDistributorAppData() {
  return useContext(DistributorDataContext);
}
