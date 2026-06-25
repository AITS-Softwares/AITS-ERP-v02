import { notFound } from "next/navigation";
import { ActionButton, Badge, KeyValueGrid, PageIntro, StatePanel, Surface } from "@/components/distributor/DistributorUI";
import { getProductById } from "@/components/distributor/mockData";

export default function DistributorProductDetailPage({ params }) {
  const product = getProductById(params.id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Product detail" title={product.name} description={product.description} actions={<><ActionButton>Add to cart</ActionButton><Badge tone="green">{product.stock}</Badge></>} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface className="p-6">
          <KeyValueGrid
            items={[
              { label: "Item code", value: product.id },
              { label: "Category", value: product.category },
              { label: "Brand", value: product.brand },
              { label: "Case pack", value: product.pack },
              { label: "MOQ", value: product.moq },
              { label: "Lead time", value: product.leadTime },
            ]}
          />
        </Surface>

        <Surface className="p-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Commercial summary</p>
            <StatePanel tone="blue" title={`Distributor price: ${product.price}`} description={`Current scheme: ${product.scheme}`} />
            <div className="grid gap-3">
              {product.highlights.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
