"use client";

import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { Badge, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorOffersPage() {
  const { data } = useDistributorAppData();
  const offers = data.offers || [];

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
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {offer.bannerUrl ? offer.bannerUrl : "Artwork or circular can be linked here."}
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                {[offer.schemeTag, offer.itemCode ? `Item ${offer.itemCode}` : "", offer.minQty ? `Min qty ${offer.minQty}` : "", offer.rateNote].filter(Boolean).join(" | ") || "General offer for distributor network."}
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
