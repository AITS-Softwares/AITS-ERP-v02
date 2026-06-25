import Link from "next/link";

function cx(...items) {
  return items.filter(Boolean).join(" ");
}

const toneClasses = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
};

export function Badge({ children, tone = "blue" }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", toneClasses[tone] || toneClasses.slate)}>
      {children}
    </span>
  );
}

export function Surface({ children, className = "" }) {
  return <section className={cx("rounded-3xl border border-slate-200 bg-white shadow-sm", className)}>{children}</section>;
}

export function PageIntro({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-br from-[#105B92] via-[#146CA9] to-[#D8A534] p-6 text-white shadow-lg sm:p-8">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="max-w-3xl text-sm text-blue-50 sm:text-base">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function ActionLink({ href, children, tone = "light" }) {
  const tones = {
    light: "bg-white text-[#105B92] hover:bg-blue-50",
    dark: "bg-slate-950 text-white hover:bg-slate-800",
    ghost: "border border-white/30 bg-white/10 text-white hover:bg-white/15",
  };
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
        tones[tone] || tones.light
      )}
    >
      {children}
    </Link>
  );
}

export function StatGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Surface key={item.label} className="p-5">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
          {item.change ? <p className="mt-2 text-xs text-slate-500">{item.change}</p> : null}
        </Surface>
      ))}
    </div>
  );
}

export function SectionHeading({ title, caption, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {caption ? <p className="text-sm text-slate-500">{caption}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-top text-slate-700">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormCard({ title, description, children }) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </Surface>
  );
}

export function MockInput({ label, value, hint }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{value}</div>
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function EmptyStateNote() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      Frontend review mode only. All numbers, lists, and actions on this section are mock placeholders for screen approval.
    </div>
  );
}
