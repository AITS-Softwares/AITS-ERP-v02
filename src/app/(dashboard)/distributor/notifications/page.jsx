import { Badge, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { notifications } from "@/components/distributor/mockData";

export default function DistributorNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Notification module"
        title="Notification center"
        description="This screen will collect order alerts, dispatch updates, finance reminders, and offer announcements in one place."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Recent notifications" caption="Cards stay large and readable for mobile users." />
        <div className="space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <Badge tone={item.tone}>{item.time}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
