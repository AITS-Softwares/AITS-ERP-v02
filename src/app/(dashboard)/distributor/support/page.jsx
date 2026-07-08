import { PageIntro, SectionHeading, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { supportChannels } from "@/components/distributor/mockData";

export default function DistributorSupportPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Support"
        title="Help and support"
        description="Give distributors a direct path to the right support team for operational, finance, and account issues."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Support channels"
          caption="Support teams can be reached from a dedicated distributor help center."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {supportChannels.map((item) => (
            <StatePanel key={item.title} tone="blue" title={item.title} description={`${item.detail} - ${item.note}`} />
          ))}
        </div>
      </Surface>
    </div>
  );
}
