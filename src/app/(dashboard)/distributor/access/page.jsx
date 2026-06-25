import { TeamAccessWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { accessRoles } from "@/components/distributor/mockData";

export default function DistributorAccessPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Phase 2 - Identity and access"
        title="Distributor user access and OTP mapping"
        description="This phase defines how multiple distributor users will log in, what each role can do, and how the app should map users back into ERPNext."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading title="Role model" caption="Recommended frontend role structure before backend and ERPNext mapping." />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {accessRoles.map((role) => (
            <div key={role.role} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{role.role}</p>
              <p className="mt-2 text-sm text-slate-500">{role.scope}</p>
              <p className="mt-2 text-xs text-slate-400">{role.modules}</p>
            </div>
          ))}
        </div>
      </Surface>

      <TeamAccessWorkbench />
    </div>
  );
}
