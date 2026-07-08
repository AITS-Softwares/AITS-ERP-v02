import { CheckoutWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorCheckoutPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Sales Order form"
        title="Create Sales Order"
        description="Distributor order workspace aligned to ERPNext Sales Order, item, shipping, and payment-related fields."
      />

      <CheckoutWorkbench />
    </div>
  );
}
