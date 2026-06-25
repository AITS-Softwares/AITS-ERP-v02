import { Badge, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { offers } from "@/components/distributor/mockData";

export default function DistributorOffersPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Offers module"
        title="Offers, promotions, and newsletters"
        description="Promotional communication needs a dedicated, easy-to-scan screen so distributors do not miss incentive windows."
      />

      <div className="grid gap-5 xl:grid-cols-3">
        {offers.map((offer) => (
          <Surface key={offer.title} className="p-5 sm:p-6">
            <Badge tone="green">{offer.validity}</Badge>
            <SectionHeading title={offer.title} caption={offer.description} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Visual space reserved for offer artwork, PDF circular, or newsletter thumbnail.
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
