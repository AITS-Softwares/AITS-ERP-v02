import { ComplaintFormWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorNewComplaintPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Complaint form"
        title="Raise invoice complaint"
        description="This form is designed for fast capture on phone screens, with invoice-first selection and the ability to attach photos later."
      />

      <ComplaintFormWorkbench />
    </div>
  );
}
