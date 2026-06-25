import {
  ActionLink,
  Badge,
  DataTable,
  EmptyStateNote,
  PageIntro,
  SectionHeading,
  StatGrid,
  Surface,
} from "@/components/distributor/DistributorUI";
import { dashboardStats, notifications, offers, orders, quickActions } from "@/components/distributor/mockData";

export default function DistributorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Phase 1 review"
        title="Distributor dashboard"
        description="This home screen gives the distributor one place to see open orders, stock-sensitive items, outstanding balance, promotions, and quick actions."
        actions={quickActions.map((action) => (
          <ActionLink key={action.href} href={action.href}>
            {action.label}
          </ActionLink>
        ))}
      />

      <EmptyStateNote />
      <StatGrid items={dashboardStats} />

      {!orders.length && !notifications.length && !offers.length ? (
        <Surface className="p-5 sm:p-6">
          <p className="text-sm text-slate-500">No distributor dashboard data is connected yet. Link distributor accounts, orders, notifications, and offers to populate this view.</p>
        </Surface>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Surface className="p-5 sm:p-6">
          <SectionHeading title="Recent orders" caption="High-visibility order tracking for mobile users." action={<ActionLink href="/distributor/orders/new" tone="dark">New order</ActionLink>} />
          <DataTable
            columns={[
              { key: "id", label: "Order" },
              { key: "date", label: "Date" },
              { key: "status", label: "Status" },
              { key: "amount", label: "Amount" },
            ]}
            rows={orders.map((order) => ({
              ...order,
              status: <Badge tone={order.status === "Delivered" ? "green" : order.status === "Pending Approval" ? "amber" : "blue"}>{order.status}</Badge>,
            }))}
          />
        </Surface>

        <div className="space-y-6">
          <Surface className="p-5 sm:p-6">
            <SectionHeading title="Alert center" caption="Push notification content block for mobile and web." />
            <div className="space-y-4">
              {notifications.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <Badge tone={item.tone}>{item.time}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <SectionHeading title="Live offers" caption="Promotions block that later pulls from ERPNext or a custom source." />
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.title} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{offer.title}</p>
                    <Badge tone="green">{offer.validity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{offer.description}</p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
