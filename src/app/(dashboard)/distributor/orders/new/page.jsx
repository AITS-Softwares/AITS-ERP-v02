import { FormCard, MockInput, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { cartLines } from "@/components/distributor/mockData";

export default function DistributorCheckoutPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Checkout screen"
        title="Create order"
        description="Frontend-only checkout preview with delivery notes, cart summary, pricing blocks, and approval-ready fields."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <FormCard title="Order details" description="Core header fields for the order creation screen.">
            <div className="grid gap-4 sm:grid-cols-2">
              <MockInput label="Delivery date" value="27 Jun 2026" />
              <MockInput label="Preferred slot" value="Afternoon route" />
              <MockInput label="Ship to" value="Pune retail warehouse" />
              <MockInput label="PO reference" value="Optional distributor reference" />
            </div>
            <MockInput label="Special instructions" value="Handle monsoon-sensitive stock separately." />
          </FormCard>

          <Surface className="p-5 sm:p-6">
            <SectionHeading title="Cart lines" caption="Large touch-friendly rows for mobile bundle ordering." />
            <div className="space-y-4">
              {cartLines.map((line) => (
                <div key={line.name} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
                  <div>
                    <p className="font-semibold text-slate-900">{line.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Editable quantity, scheme note, and availability badge can sit here later.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Qty: {line.qty}</div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Rate: {line.rate}</div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-900">Total: {line.total}</div>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <FormCard title="Summary and approval" description="Sticky-style card on desktop and stacked card on mobile.">
          <MockInput label="Subtotal" value="Rs 10,124" />
          <MockInput label="Scheme discount" value="- Rs 324" />
          <MockInput label="Estimated tax" value="Rs 1,836" />
          <MockInput label="Grand total" value="Rs 11,636" />
          <MockInput label="Payment mode" value="Credit against approved limit" hint="Later this will depend on role, credit check, and ERPNext customer settings." />
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Save draft</button>
            <button className="rounded-2xl bg-[#105B92] px-4 py-3 text-sm font-semibold text-white">Place order</button>
          </div>
        </FormCard>
      </div>
    </div>
  );
}
