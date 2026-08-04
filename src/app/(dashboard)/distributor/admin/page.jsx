import Link from "next/link";

const actions = [
  ["ERPNext connection", "Save the encrypted service connection used by the distributor product.", "/distributor/admin/setup"],
  ["Distributor accounts", "Fetch ERPNext Customers and create the local distributor mapping record.", "/distributor/admin/accounts"],
  ["Customer mapping", "Confirm the exact ERPNext Customer linked to each distributor.", "/distributor/admin/mapping"],
  ["Distributor users", "Assign OTP users, roles, and finance access to a distributor.", "/distributor/admin/users"],
];

export default function DistributorAdminHomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#105B92] to-cyan-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor product</p>
        <h1 className="mt-2 text-3xl font-semibold">Distributor administration</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">This workspace is separate from AITSERP. It controls only the ERPNext connection, distributor-to-customer mapping, and distributor app access.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {actions.map(([title, description, href]) => (
          <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
