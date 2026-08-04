import { PageIntro, StatePanel } from "@/components/distributor/DistributorUI";

export default function DistributorOffersPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Automated communication"
        title="ERPNext notifications"
        description="Manual offer and newsletter publishing is not available in the distributor app. Approved ERPNext notifications will appear in the Alert Center."
      />
      <StatePanel tone="blue" title="No manual offers page" description="Use the Alert Center for system-generated messages after ERPNext notification rules are configured in a later phase." />
    </div>
  );
}
