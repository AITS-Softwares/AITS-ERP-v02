import { PageIntro, SectionHeading, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { supportChannels } from "@/components/distributor/mockData";

export default function DistributorSupportPage() {
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Phase 2 - Support module" title="Help and support" description="A dedicated support screen is useful in production because mobile users need a fast path to contact the right team without searching through menus." />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Support channels" caption="Each team can later map to call, email, WhatsApp, or ticket actions." />
        <div className="grid gap-4 lg:grid-cols-3">
          {supportChannels.map((item) => (
            <StatePanel key={item.title} tone="blue" title={item.title} description={`${item.detail} • ${item.note}`} />
          ))}
        </div>
      </Surface>
    </div>
  );
}
