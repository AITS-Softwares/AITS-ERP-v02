import { TeamAccessWorkbench } from "@/components/distributor/DistributorInteractiveForms";
import { PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";
import { accessRoles } from "@/components/distributor/mockData";

export default function DistributorAccessPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Access"
        title="Distributor user access and OTP mapping"
        description="Configure distributor users, OTP login access, and role-wise permissions linked to the mapped ERPNext account."
      />

      <Surface className="p-5 sm:p-6">
        <SectionHeading
          title="Role model"
          caption="Role definitions keep access clear across ordering, finance, and account actions."
        />
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
