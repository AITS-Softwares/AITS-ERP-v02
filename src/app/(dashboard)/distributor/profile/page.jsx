import { FormCard, MockInput, PageIntro, Surface } from "@/components/distributor/DistributorUI";
import { distributorUser } from "@/components/distributor/mockData";

export default function DistributorProfilePage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Profile module"
        title="Distributor profile and account controls"
        description="The profile area keeps business identity, contact details, credit overview, and future login/security settings together."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface className="p-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#105B92] to-[#0B2034] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Mapped distributor</p>
            <h2 className="mt-3 text-2xl font-semibold">{distributorUser.name}</h2>
            <p className="mt-2 text-sm text-blue-100">{distributorUser.code} • {distributorUser.city}</p>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Available credit</p>
              <p className="mt-1 font-semibold text-slate-900">{distributorUser.availableCredit}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Credit limit</p>
              <p className="mt-1 font-semibold text-slate-900">{distributorUser.creditLimit}</p>
            </div>
          </div>
        </Surface>

        <FormCard title="Business details" description="Static profile fields for approval.">
          <div className="grid gap-4 sm:grid-cols-2">
            <MockInput label="Business name" value={distributorUser.name} />
            <MockInput label="Distributor code" value={distributorUser.code} />
            <MockInput label="Primary phone" value={distributorUser.phone} />
            <MockInput label="Territory route" value={distributorUser.route} />
            <MockInput label="Preferred warehouse" value={distributorUser.preferredWarehouse} />
            <MockInput label="Login mode" value="Mobile OTP" />
          </div>
          <MockInput label="Address" value="Pune city trade hub, Maharashtra" />
        </FormCard>
      </div>
    </div>
  );
}
