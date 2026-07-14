"use client";

import { useRouter } from "next/navigation";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { Badge, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorNotificationsPage() {
  const router = useRouter();
  const { data, markNotificationRead, markAllNotificationsRead } = useDistributorAppData();
  const notifications = data.notifications || [];
  const unreadNotifications = notifications.filter((item) => !item.isRead);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Notification module"
        title="Notification center"
        description="This screen will collect order alerts, dispatch updates, finance reminders, and offer announcements in one place."
      />

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
