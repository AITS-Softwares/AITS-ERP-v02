import { ActionLink, Badge, EmptyStateNote, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { categories, products } from "@/components/distributor/mockData";

export default function DistributorProductsPage() {
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Phase 2 - Product module" title="Products and price discovery" description="This phase adds product detail readiness so distributors can review pricing, pack size, MOQ, and schemes before placing an order." />

      <Surface className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 lg:min-w-[320px]">Search by item name, item code, or brand</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} tone="slate">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </Surface>

      <EmptyStateNote />

      {!products.length ? (
        <Surface className="p-5 sm:p-6">
          <p className="text-sm text-slate-500">No product catalog is connected yet.</p>
        </Surface>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {products.map((product) => (
          <Surface key={product.id} className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="blue">{product.category}</Badge>
                <Badge tone={product.stock.includes("36") || product.stock.includes("58") ? "amber" : "green"}>{product.stock}</Badge>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">{product.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{product.id} • {product.brand}</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Price</p>
                  <p className="mt-1 font-semibold text-slate-900">{product.price}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">MOQ</p>
                  <p className="mt-1 font-semibold text-slate-900">{product.moq}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current scheme</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{product.scheme}</p>
              </div>
              <ActionLink href={`/distributor/products/${product.id}`} tone="dark">
                View details
              </ActionLink>
            </div>
          </Surface>
        ))}
      </div>

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="What this phase improves" caption="Products now have a dedicated detail drill-down so the mobile app can feel more complete and easier to approve." />
      </Surface>
    </div>
  );
}
