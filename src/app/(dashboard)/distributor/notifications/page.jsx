"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { Badge, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorNotificationsPage() {
  const router = useRouter();
  const { data, markNotificationRead, markAllNotificationsRead } = useDistributorAppData();
  const notifications = data.notifications || [];
  const offers = data.offers || [];
  const unreadNotifications = notifications.filter((item) => !item.isRead);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Notification module"
        title="Notification center"
        description="This screen will collect order alerts, dispatch updates, finance reminders, and offer announcements in one place."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Active schemes and offers" caption="Only ERPNext promotional schemes currently valid for this distributor are shown. Final eligibility is confirmed by ERPNext at order pricing." />
        {offers.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {offers.map((offer) => (
              <div key={offer.id || offer.title} className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{offer.schemeTag || "Offer"}</p>
                <p className="mt-2 font-semibold text-slate-900">{offer.title}</p>
                <p className="mt-2 text-sm text-slate-600">{offer.description || "Eligibility is calculated by ERPNext."}</p>
                <p className="mt-3 text-xs font-semibold text-slate-500">{offer.validity || "Currently active"}</p>
                <Link href="/distributor/products" className="mt-4 inline-flex text-sm font-semibold text-[#105B92]">View eligible products</Link>
              </div>
            ))}
          </div>
        ) : <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">No active ERPNext promotional schemes apply to this distributor today.</p>}
      </Surface>

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Recent notifications"
          caption="Unread alerts stay highlighted until opened or marked as read."
          action={unreadNotifications.length ? (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-sm font-semibold text-[#105B92]"
            >
              Mark all as read
            </button>
          ) : null}
        />
        <div className="space-y-4">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                markNotificationRead(item.id);
                router.push(item.href || "/distributor/notifications");
              }}
              className={[
                "block w-full rounded-2xl border p-4 text-left transition hover:bg-slate-50",
                item.isRead
                  ? "border-slate-200 bg-slate-50/60 opacity-75"
                  : "border-blue-200 bg-blue-50/70 shadow-sm",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.type || "alert"}</p>
                  <p className="mt-1 font-semibold text-slate-900">{item.title}</p>
                </div>
                <Badge tone={item.tone}>{item.time}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.body}</p>
              <p className="mt-3 text-xs font-semibold text-[#105B92]">Open related record</p>
            </button>
          ))}
        </div>
      </Surface>
    </div>
  );
}
