import { ComplaintFormWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorNewComplaintPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Complaint form"
        title="Raise invoice complaint"
        description="Distributor complaint form aligned to Sales Invoice-led issue capture, remarks, and supporting proof."
      />

      <ComplaintFormWorkbench />
    </div>
  );
}
