import { FormCard, MockInput, PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorStockRequestPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Stock request"
        title="Request additional stock"
        description="A separate request screen gives the distributor a lightweight workflow without forcing them into a full order entry."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <FormCard title="Request details" description="These fields can later map to Material Request or a custom ERPNext request flow.">
          <div className="grid gap-4 sm:grid-cols-2">
            <MockInput label="Item" value="Select item from catalog" />
            <MockInput label="Requested quantity" value="24 cases" />
            <MockInput label="Needed by" value="29 Jun 2026" />
            <MockInput label="Preferred warehouse" value="Pune Main Depot" />
          </div>
          <MockInput label="Reason for request" value="Retail shelf gap expected due to weekend promotion." />
          <button className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white">Submit request</button>
        </FormCard>

        <FormCard title="Approval notes" description="Useful content card for field teams and admin review.">
          <MockInput label="Current availability" value="58 cases in main warehouse" />
          <MockInput label="Transit stock" value="14 cases arriving tomorrow" />
          <MockInput label="Escalation rule" value="Show alert if requested qty exceeds 2-week average" />
        </FormCard>
      </div>
    </div>
  );
}
