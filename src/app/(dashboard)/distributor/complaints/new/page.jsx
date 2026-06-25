import { FormCard, MockInput, PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorNewComplaintPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Complaint form"
        title="Raise invoice complaint"
        description="This form is designed for fast capture on phone screens, with invoice-first selection and the ability to attach photos later."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <FormCard title="Complaint details" description="Mapped for invoice-linked complaints only.">
          <MockInput label="Invoice number" value="INV-8764" />
          <MockInput label="Complaint type" value="Rate Issue / Short Quantity / Misbilling" />
          <MockInput label="Remarks" value="Difference noticed between approved scheme and billed rate." />
          <MockInput label="Attachment" value="Photo or PDF upload slot" hint="Frontend placeholder. Upload flow comes in the next phase." />
          <button className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white">Submit complaint</button>
        </FormCard>

        <FormCard title="Review guidance" description="Helper content block to reduce poor-quality submissions.">
          <MockInput label="Expected proof" value="Invoice copy, received quantity proof, rate screenshot" />
          <MockInput label="Response target" value="Initial acknowledgement within 24 hours" />
        </FormCard>
      </div>
    </div>
  );
}
