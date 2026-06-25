import { StockRequestWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro } from "@/components/distributor/DistributorUI";

export default function DistributorStockRequestPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Stock request"
        title="Request additional stock"
        description="A separate request screen gives the distributor a lightweight workflow without forcing them into a full order entry."
      />

      <StockRequestWorkbench />
    </div>
  );
}
