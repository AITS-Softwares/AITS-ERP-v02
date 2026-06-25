import { CheckoutWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorCheckoutPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Checkout screen"
        title="Create order"
        description="Checkout workspace with delivery notes, cart summary, pricing blocks, and payment selection."
      />

      <CheckoutWorkbench />
    </div>
  );
}
