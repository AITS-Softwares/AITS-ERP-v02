"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeIndianRupee,
  Bell,
  Briefcase,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Filter,
  Flag,
  Gift,
  GraduationCap,
  History,
  Hourglass,
  IndianRupee,
  LayoutDashboard,
  ListFilter,
  Mail,
  MapPin,
  NotebookTabs,
  PencilLine,
  Phone,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";

const HR_LINKS = [
  { href: "/admin/hr", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/hr/Dashboard", label: "Dashboard", icon: Activity },
  { href: "/admin/hr/employees", label: "Employees", icon: Users },
  { href: "/admin/hr/employee-onboarding", label: "Onboarding", icon: UserPlus },
  { href: "/admin/hr/attendance", label: "Attendance", icon: Clock3 },
  { href: "/admin/hr/leaves", label: "Leaves", icon: CalendarClock },
  { href: "/admin/hr/payroll", label: "Payroll", icon: IndianRupee },
  { href: "/admin/hr/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/admin/hr/settings", label: "Settings", icon: Settings2 },
];

const EMPLOYEES = [
  {
    id: "EMP-0001",
    name: "Aarav Sharma",
    department: "Sales",
    designation: "Senior Sales Executive",
    branch: "Mumbai HQ",
    status: "Active",
    shift: "General Shift",
    employmentType: "Full Time",
    reportsTo: "Ritika Nair",
    grade: "G6",
    leaveApprover: "Ritika Nair",
    expenseApprover: "Anil Mehra",
    companyEmail: "aarav.sharma@erpexpress.in",
    personalEmail: "aarav.sharma@gmail.com",
    phone: "+91 98765 43210",
    joiningDate: "2024-04-15",
    confirmationDate: "2024-10-15",
    location: "Mumbai",
    attendanceDeviceId: "BIO-MUM-013",
    salaryStructure: "Sales India - Monthly",
    pan: "ABCDE1234F",
    aadhaar: "XXXX XXXX 2468",
    bank: "HDFC Bank / 9812",
    emergency: "Pooja Sharma / Sister",
  },
  {
    id: "EMP-0002",
    name: "Ritika Nair",
    department: "Sales",
    designation: "Regional Sales Manager",
    branch: "Mumbai HQ",
    status: "Active",
    shift: "General Shift",
    employmentType: "Full Time",
    reportsTo: "Anil Mehra",
    grade: "M2",
    leaveApprover: "Anil Mehra",
    expenseApprover: "Anil Mehra",
    companyEmail: "ritika.nair@erpexpress.in",
    personalEmail: "ritika.nair@gmail.com",
    phone: "+91 99887 66554",
    joiningDate: "2022-01-10",
    confirmationDate: "2022-07-10",
    location: "Mumbai",
    attendanceDeviceId: "BIO-MUM-002",
    salaryStructure: "Manager India - Monthly",
    pan: "AABCD2098P",
    aadhaar: "XXXX XXXX 5931",
    bank: "ICICI Bank / 1170",
    emergency: "Deepa Nair / Mother",
  },
  {
    id: "EMP-0003",
    name: "Kunal Verma",
    department: "Operations",
    designation: "Warehouse Supervisor",
    branch: "Delhi Warehouse",
    status: "Active",
    shift: "Warehouse Shift",
    employmentType: "Full Time",
    reportsTo: "Prerna Kaul",
    grade: "G5",
    leaveApprover: "Prerna Kaul",
    expenseApprover: "Prerna Kaul",
    companyEmail: "kunal.verma@erpexpress.in",
    personalEmail: "kunal.verma@gmail.com",
    phone: "+91 98111 77442",
    joiningDate: "2023-06-05",
    confirmationDate: "2023-12-05",
    location: "Delhi",
    attendanceDeviceId: "BIO-DEL-221",
    salaryStructure: "Operations India - Monthly",
    pan: "BBBCD9831T",
    aadhaar: "XXXX XXXX 7783",
    bank: "Axis Bank / 4125",
    emergency: "Vikas Verma / Brother",
  },
  {
    id: "EMP-0004",
    name: "Nisha Gupta",
    department: "HR",
    designation: "HR Business Partner",
    branch: "Mumbai HQ",
    status: "Probation",
    shift: "General Shift",
    employmentType: "Full Time",
    reportsTo: "Anil Mehra",
    grade: "M1",
    leaveApprover: "Anil Mehra",
    expenseApprover: "Anil Mehra",
    companyEmail: "nisha.gupta@erpexpress.in",
    personalEmail: "nisha.gupta@gmail.com",
    phone: "+91 98989 55001",
    joiningDate: "2025-01-06",
    confirmationDate: "2025-07-06",
    location: "Mumbai",
    attendanceDeviceId: "BIO-MUM-098",
    salaryStructure: "HR India - Monthly",
    pan: "CCCDD2011R",
    aadhaar: "XXXX XXXX 0192",
    bank: "SBI / 5921",
    emergency: "Rohit Gupta / Spouse",
  },
];

const ATTENDANCE_LOG = [
  { employee: "Aarav Sharma", date: "25 Jun 2026", shift: "General Shift", in: "09:08", out: "18:32", hours: "09:11", status: "Present", request: "None" },
  { employee: "Ritika Nair", date: "25 Jun 2026", shift: "General Shift", in: "09:22", out: "18:14", hours: "08:36", status: "Present", request: "Late Entry Pending" },
  { employee: "Kunal Verma", date: "25 Jun 2026", shift: "Warehouse Shift", in: "07:03", out: "16:11", hours: "08:49", status: "Present", request: "None" },
  { employee: "Nisha Gupta", date: "25 Jun 2026", shift: "General Shift", in: "-", out: "-", hours: "-", status: "On Leave", request: "Approved Leave" },
];

const LEAVE_REQUESTS = [
  { employee: "Nisha Gupta", type: "Earned Leave", from: "25 Jun 2026", to: "26 Jun 2026", days: 2, approver: "Anil Mehra", status: "Approved" },
  { employee: "Aarav Sharma", type: "Sick Leave", from: "28 Jun 2026", to: "28 Jun 2026", days: 1, approver: "Ritika Nair", status: "Pending" },
  { employee: "Kunal Verma", type: "Casual Leave", from: "01 Jul 2026", to: "03 Jul 2026", days: 3, approver: "Prerna Kaul", status: "Pending" },
];

const SHIFTS = [
  { name: "General Shift", start: "09:00", end: "18:00", grace: "15 min", workingHours: "8.5 hrs", weeklyOff: "Sunday", type: "Office" },
  { name: "Warehouse Shift", start: "07:00", end: "16:00", grace: "10 min", workingHours: "8.5 hrs", weeklyOff: "Sunday", type: "Operations" },
  { name: "Support Evening", start: "13:00", end: "22:00", grace: "15 min", workingHours: "8.5 hrs", weeklyOff: "Rotational", type: "Support" },
];

const HOLIDAYS = [
  { name: "Independence Day", date: "15 Aug 2026", holidayList: "National Holidays 2026", type: "National" },
  { name: "Ganesh Chaturthi", date: "17 Sep 2026", holidayList: "Maharashtra Regional", type: "Regional" },
  { name: "Diwali", date: "08 Nov 2026", holidayList: "National Holidays 2026", type: "Festival" },
  { name: "Christmas", date: "25 Dec 2026", holidayList: "National Holidays 2026", type: "National" },
];

const DEPARTMENTS = [
  { name: "Sales", manager: "Ritika Nair", employees: 18, costCenter: "CC-SALES-MUM", company: "ERPExpress India", leavePolicy: "Sales Annual Policy" },
  { name: "Operations", manager: "Prerna Kaul", employees: 34, costCenter: "CC-OPS-DEL", company: "ERPExpress India", leavePolicy: "Operations Policy" },
  { name: "Human Resources", manager: "Anil Mehra", employees: 6, costCenter: "CC-HR-MUM", company: "ERPExpress India", leavePolicy: "Corporate Policy" },
];

const DESIGNATIONS = [
  { title: "Regional Sales Manager", department: "Sales", level: "M2", reportsTo: "Director Sales", openings: 0 },
  { title: "Senior Sales Executive", department: "Sales", level: "G6", reportsTo: "Regional Sales Manager", openings: 2 },
  { title: "Warehouse Supervisor", department: "Operations", level: "G5", reportsTo: "Operations Manager", openings: 1 },
  { title: "HR Business Partner", department: "Human Resources", level: "M1", reportsTo: "Head HR", openings: 0 },
];

const PAYROLL_ROWS = [
  { employee: "Aarav Sharma", structure: "Sales India - Monthly", branch: "Mumbai HQ", gross: 78500, deductions: 6800, net: 71700, status: "Submitted" },
  { employee: "Ritika Nair", structure: "Manager India - Monthly", branch: "Mumbai HQ", gross: 138000, deductions: 15850, net: 122150, status: "Approved" },
  { employee: "Kunal Verma", structure: "Operations India - Monthly", branch: "Delhi Warehouse", gross: 64200, deductions: 5200, net: 59000, status: "Draft" },
];

const APPRAISALS = [
  { employee: "Aarav Sharma", cycle: "FY 2026 - H1", template: "Sales Performance Review", score: "4.3 / 5", reviewer: "Ritika Nair", status: "Self Review Pending" },
  { employee: "Ritika Nair", cycle: "FY 2026 - H1", template: "Leadership Review", score: "4.6 / 5", reviewer: "Anil Mehra", status: "Manager Review" },
  { employee: "Kunal Verma", cycle: "FY 2026 - H1", template: "Operations Review", score: "4.1 / 5", reviewer: "Prerna Kaul", status: "Completed" },
];

const REPORTS = [
  { name: "Monthly Attendance Sheet", owner: "HR Operations", updated: "Today, 09:24", type: "Attendance" },
  { name: "Leave Ledger By Department", owner: "Nisha Gupta", updated: "Today, 08:55", type: "Leaves" },
  { name: "Salary Register", owner: "Payroll", updated: "Yesterday", type: "Payroll" },
  { name: "Employee Birthday List", owner: "HR Desk", updated: "Yesterday", type: "Employee" },
];

const SETTINGS_BLOCKS = [
  { title: "Attendance Rules", items: ["Enable auto attendance", "Late entry grace period", "Half day threshold", "Missing punch regularization"] },
  { title: "Leave Controls", items: ["Allow leave backdating", "Enable leave encashment", "Optional holiday selection", "Compensatory leave flow"] },
  { title: "Payroll Defaults", items: ["Default payroll frequency", "Salary withholding account", "Payroll payable account", "Include unclaimed benefits"] },
  { title: "Notifications", items: ["Approval reminders", "Birthday announcements", "Probation alerts", "Policy acknowledgement reminders"] },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold", tones[tone])}>
      {children}
    </span>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function Select({ label, value, onChange, options, className = "" }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, className = "" }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-indigo-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </label>
  );
}

function SectionCard({ title, subtitle, icon: Icon, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon size={18} />
            </div>
          ) : null}
          <div>
            <h3 className="text-sm font-black text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, hint, icon: Icon, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{value}</h3>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AvatarChip({ name, subline }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
        {initials(name)}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{name}</p>
        {subline ? <p className="text-xs text-slate-500">{subline}</p> : null}
      </div>
    </div>
  );
}

function TableShell({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px]">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((column) => (
              <th key={column} className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function Modal({ open, title, subtitle, children, onClose, wide = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className={cn("max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl", wide ? "w-full max-w-5xl" : "w-full max-w-2xl")}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">HRMS Demo</p>
            <h2 className="mt-1 text-lg font-black text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function HrmsQuickNav() {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex min-w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {HR_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Icon size={13} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function DemoShell({ eyebrow, title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        <HrmsQuickNav />
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

export function HrmsHomeDemo() {
  const modules = [
    { href: "/admin/hr/Dashboard", label: "HR Dashboard", desc: "Headcount, approvals, attendance insights, payroll checkpoints and alerts.", icon: LayoutDashboard },
    { href: "/admin/hr/employees", label: "Employee Master", desc: "Complete employee profile, job, payroll, documents and lifecycle setup.", icon: Users },
    { href: "/admin/hr/employee-onboarding", label: "Employee Onboarding", desc: "Desktop-ready onboarding wizard with identity, joining and policy capture.", icon: UserPlus },
    { href: "/admin/hr/attendance", label: "Attendance", desc: "Daily attendance, shift allocation, regularization and late-entry controls.", icon: Clock3 },
    { href: "/admin/hr/leaves", label: "Leave Management", desc: "Leave types, balances, approval queue and calendar-driven planning.", icon: CalendarClock },
    { href: "/admin/hr/payroll", label: "Payroll", desc: "Payroll entry, salary calculation, approval and payout readiness.", icon: IndianRupee },
    { href: "/admin/hr/reports", label: "Reports", desc: "Attendance sheet, salary register, leave ledger and analytics previews.", icon: FileBarChart2 },
    { href: "/admin/hr/settings", label: "HR Settings", desc: "Attendance policies, leave rules, payroll defaults and notification controls.", icon: Settings2 },
    { href: "/admin/hr/performance", label: "Performance", desc: "Appraisal cycles, KRAs, feedback checkpoints and rating views.", icon: Target },
    { href: "/admin/hr/profile", label: "Employee Self Service", desc: "Profile, my attendance, my leaves, my salary and payslip navigation.", icon: UserCog },
  ];

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS"
      title="HRMS Demo Module"
      subtitle="These are desktop-first, responsive HRMS screens designed to freeze the UX before API and ERPNext data integration. Fields, actions, forms and reports are structured around ERPNext HRMS patterns."
      actions={[
        <Link key="dashboard" href="/admin/hr/Dashboard" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">
          Open Dashboard <ArrowRight size={14} />
        </Link>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Employees" value="58" hint="6 on probation, 3 upcoming joins" icon={Users} tone="indigo" />
        <MetricCard label="Attendance Today" value="91%" hint="4 late entries, 2 regularization requests" icon={CalendarCheck2} tone="emerald" />
        <MetricCard label="Open Approvals" value="12" hint="Leaves, claims, shift changes, appraisals" icon={Bell} tone="amber" />
        <MetricCard label="Payroll Progress" value="72%" hint="June payroll entry in validation stage" icon={BadgeIndianRupee} tone="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon size={18} />
            </div>
            <h3 className="text-base font-black text-slate-900">{label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
              View Screen <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </DemoShell>
  );
}

export function HrmsDashboardDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Dashboard"
      title="HR Dashboard"
      subtitle="Executive overview of workforce movement, attendance, leave approvals and payroll readiness, aligned to ERPNext HRMS dashboards."
      actions={[
        <button key="announce" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Broadcast Update</button>,
        <button key="new-hire" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">New Hire Checklist</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Headcount" value="58" hint="+4 from last month" icon={Users} tone="indigo" />
        <MetricCard label="Present Today" value="49" hint="3 on leave, 2 weekly off, 4 late" icon={UserCheck} tone="emerald" />
        <MetricCard label="Pending Leaves" value="7" hint="5 casual, 2 sick" icon={CalendarClock} tone="amber" />
        <MetricCard label="Payroll Due" value={currency(2528400)} hint="Payroll entry closes on 28 Jun" icon={IndianRupee} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Operational Snapshot" subtitle="Daily HR execution view" icon={Sparkles}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Open Job Offers", "03", "Offer letters awaiting acceptance", Briefcase],
              ["Regularization Requests", "04", "Pending attendance corrections", Clock3],
              ["Expense Claims", "06", "Awaiting HR and finance check", WalletCards],
              ["Appraisal Reviews", "11", "Manager reviews due this week", Target],
            ].map(([label, value, note, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                  <Icon size={16} />
                </div>
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
                <p className="mt-2 text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Today At A Glance" subtitle="Approvals and reminders" icon={Bell}>
          <div className="space-y-4">
            {[
              ["Birthday Reminder", "Shreya Desai and Kunal Verma", "Send greetings from company feed", Gift, "blue"],
              ["Probation Review", "Nisha Gupta confirmation due on 06 Jul 2026", "Manager feedback pending", ShieldCheck, "amber"],
              ["Payroll Blocker", "2 employees missing bank account validation", "Resolve before payroll submission", CreditCard, "rose"],
            ].map(([title, text, note, Icon, tone]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700")}>
                    <Icon size={15} />
                  </div>
                  <p className="text-sm font-black text-slate-900">{title}</p>
                </div>
                <p className="text-sm text-slate-700">{text}</p>
                <p className="mt-1 text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <SectionCard title="Department Distribution" subtitle="Current approved strength by business area" icon={Building2}>
          <div className="space-y-4">
            {[
              ["Operations", 34, "Target 38", "bg-indigo-500"],
              ["Sales", 18, "Target 22", "bg-emerald-500"],
              ["Human Resources", 6, "Target 6", "bg-amber-500"],
            ].map(([department, count, note, bar]) => (
              <div key={department}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">{department}</span>
                  <span className="text-slate-500">{count} employees</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn("h-full rounded-full", bar)} style={{ width: `${(count / 40) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Calendar" subtitle="Near-term HR events" icon={CalendarDays}>
          <div className="space-y-3">
            {[
              ["28 Jun", "June Payroll Freeze", "Validation cutoff for salary components"],
              ["30 Jun", "Leave Encashment Review", "Quarter-end carry forward verification"],
              ["03 Jul", "New Hire Induction", "3 employees scheduled for orientation"],
            ].map(([date, title, note]) => (
              <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">{date.split(" ")[1]}</span>
                  <span className="text-sm font-black">{date.split(" ")[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function EmployeeDirectoryDemo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEES[0]);
  const [activeTab, setActiveTab] = useState("Summary");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    employeeName: "",
    company: "ERPExpress India",
    branch: "Mumbai HQ",
    gender: "Male",
    employmentType: "Full Time",
    status: "Active",
    department: "Sales",
    designation: "Senior Sales Executive",
    reportsTo: "Ritika Nair",
    shift: "General Shift",
    joiningDate: "2026-07-01",
    dateOfBirth: "1998-10-12",
    companyEmail: "",
    personalEmail: "",
    phone: "",
    emergencyName: "",
    emergencyPhone: "",
    payrollFrequency: "Monthly",
    salaryStructure: "Sales India - Monthly",
    leavePolicy: "Sales Annual Policy",
    holidayList: "National Holidays 2026",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    pan: "",
    aadhaar: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    return EMPLOYEES.filter((employee) => {
      const matchQuery =
        !query ||
        employee.name.toLowerCase().includes(query.toLowerCase()) ||
        employee.id.toLowerCase().includes(query.toLowerCase()) ||
        employee.department.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === "All" || employee.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Employees"
      title="Employee Master"
      subtitle="Demo directory with ERPNext-style employee fields, employment setup, payroll metadata, approvers, attendance rules and document placeholders."
      actions={[
        <button key="import" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Import Employees</button>,
        <button key="create" onClick={() => setShowCreate(true)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">New Employee</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Employee Count" value="58" hint="52 active, 6 probation" icon={Users} tone="indigo" />
        <MetricCard label="Open Onboarding" value="03" hint="Offer accepted, pre-joining pending" icon={UserPlus} tone="blue" />
        <MetricCard label="Missing KYC" value="05" hint="PAN / bank / Aadhaar updates required" icon={ShieldCheck} tone="amber" />
        <MetricCard label="Shift Allocation" value="96%" hint="2 employees without final shift" icon={Clock3} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Employee Directory"
          subtitle="Searchable staff register with key HR dimensions"
          icon={Users}
          action={
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search employee, code, department"
                  className="w-64 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {["All", "Active", "Probation"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          }
        >
          <TableShell
            columns={["Employee", "Department", "Designation", "Shift", "Status", "Action"]}
            rows={filtered.map((employee) => (
              <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3">
                  <button type="button" onClick={() => setSelectedEmployee(employee)} className="text-left">
                    <AvatarChip name={employee.name} subline={`${employee.id} / ${employee.companyEmail}`} />
                  </button>
                </td>
                <td className="px-3 py-3 text-sm text-slate-700">{employee.department}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{employee.designation}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{employee.shift}</td>
                <td className="px-3 py-3">
                  <Badge tone={employee.status === "Active" ? "green" : "amber"}>{employee.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <button type="button" onClick={() => setSelectedEmployee(employee)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
                    View <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          />
        </SectionCard>

        <SectionCard title="Employee Detail Workspace" subtitle="Structured detail view for record design freeze" icon={UserCog}>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
              {initials(selectedEmployee.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-black text-slate-900">{selectedEmployee.name}</h3>
              <p className="text-sm text-slate-500">{selectedEmployee.designation} / {selectedEmployee.department}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="green">{selectedEmployee.status}</Badge>
                <Badge tone="blue">{selectedEmployee.employmentType}</Badge>
                <Badge tone="slate">{selectedEmployee.branch}</Badge>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {["Summary", "Employment", "Payroll", "Documents", "Workflow"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest transition",
                  activeTab === tab ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Summary" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Company Email", selectedEmployee.companyEmail, Mail],
                ["Personal Email", selectedEmployee.personalEmail, Mail],
                ["Mobile Number", selectedEmployee.phone, Phone],
                ["Location", selectedEmployee.location, MapPin],
                ["Date of Joining", selectedEmployee.joiningDate, CalendarDays],
                ["Confirmation Date", selectedEmployee.confirmationDate, CheckCircle2],
                ["Reports To", selectedEmployee.reportsTo, UserCheck],
                ["Attendance Device ID", selectedEmployee.attendanceDeviceId, Activity],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <Icon size={12} />
                    {label}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "Employment" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Branch", selectedEmployee.branch],
                ["Department", selectedEmployee.department],
                ["Designation", selectedEmployee.designation],
                ["Shift Type", selectedEmployee.shift],
                ["Employment Type", selectedEmployee.employmentType],
                ["Grade", selectedEmployee.grade],
                ["Leave Approver", selectedEmployee.leaveApprover],
                ["Expense Approver", selectedEmployee.expenseApprover],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "Payroll" ? (
            <div className="space-y-3">
              {[
                ["Salary Structure", selectedEmployee.salaryStructure],
                ["Bank Account", selectedEmployee.bank],
                ["PAN", selectedEmployee.pan],
                ["Aadhaar", selectedEmployee.aadhaar],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "Documents" ? (
            <div className="grid gap-3">
              {["Appointment Letter", "Proof of Identity", "Address Proof", "Signed HR Policies"].map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc}</p>
                    <p className="text-xs text-slate-500">Demo attachment placeholder / version tracking</p>
                  </div>
                  <Badge tone="blue">Preview</Badge>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "Workflow" ? (
            <div className="space-y-3">
              {[
                ["Employee Created", "Record created by HR desk and linked to branch + department."],
                ["Offer Accepted", "Offer workflow converted to employee onboarding."],
                ["Device Mapping Pending", "Biometric device and attendance device sync to be confirmed."],
                ["Probation Review Due", "Confirmation workflow scheduled for next month."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Employee Record Design" subtitle="ERPNext HRMS-style employee setup fields" wide>
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Personal Details" subtitle="Identity and contact data" icon={User}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Employee Name" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="Enter full name" />
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              <Input label="Company Email" value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} placeholder="name@company.com" />
              <Input label="Personal Email" value={form.personalEmail} onChange={(e) => setForm({ ...form, personalEmail: e.target.value })} placeholder="name@gmail.com" />
              <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              <Input label="PAN Number" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="ABCDE1234F" />
              <Input label="Aadhaar Number" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} placeholder="XXXX XXXX XXXX" />
              <Input label="Emergency Contact" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder="Name / relation" />
              <Input label="Emergency Phone" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="sm:col-span-2" />
            </div>
          </SectionCard>

          <SectionCard title="Employment Setup" subtitle="Company, reporting and attendance controls" icon={Briefcase}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} options={["ERPExpress India"]} />
              <Select label="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} options={["Mumbai HQ", "Delhi Warehouse", "Bengaluru Branch"]} />
              <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} options={["Sales", "Operations", "Human Resources", "Finance"]} />
              <Select label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} options={["Senior Sales Executive", "Regional Sales Manager", "Warehouse Supervisor", "HR Business Partner"]} />
              <Select label="Reports To" value={form.reportsTo} onChange={(e) => setForm({ ...form, reportsTo: e.target.value })} options={["Ritika Nair", "Anil Mehra", "Prerna Kaul"]} />
              <Select label="Shift" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} options={["General Shift", "Warehouse Shift", "Support Evening"]} />
              <Select label="Employment Type" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} options={["Full Time", "Part Time", "Contract", "Intern"]} />
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={["Active", "Probation", "Inactive"]} />
              <Input label="Joining Date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
              <Select label="Holiday List" value={form.holidayList} onChange={(e) => setForm({ ...form, holidayList: e.target.value })} options={["National Holidays 2026", "Maharashtra Regional", "Delhi Regional"]} />
            </div>
          </SectionCard>

          <SectionCard title="Payroll & Benefits" subtitle="Salary processing defaults" icon={IndianRupee}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Payroll Frequency" value={form.payrollFrequency} onChange={(e) => setForm({ ...form, payrollFrequency: e.target.value })} options={["Monthly", "Bi-Weekly"]} />
              <Select label="Salary Structure" value={form.salaryStructure} onChange={(e) => setForm({ ...form, salaryStructure: e.target.value })} options={["Sales India - Monthly", "Manager India - Monthly", "Operations India - Monthly"]} />
              <Input label="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="HDFC Bank" />
              <Input label="Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="XXXXXXXXXX" />
              <Input label="IFSC" value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} placeholder="HDFC0001234" />
              <Select label="Leave Policy" value={form.leavePolicy} onChange={(e) => setForm({ ...form, leavePolicy: e.target.value })} options={["Sales Annual Policy", "Operations Policy", "Corporate Policy"]} />
            </div>
          </SectionCard>

          <SectionCard title="HR Notes & Policy Acknowledgement" subtitle="Demo placeholders for later workflow integration" icon={NotebookTabs}>
            <div className="space-y-4">
              <Toggle label="Auto-create user account after onboarding" checked={true} onChange={() => {}} />
              <Toggle label="Enable attendance device mapping" checked={true} onChange={() => {}} />
              <Toggle label="Require document verification before confirmation" checked={false} onChange={() => {}} />
              <Textarea label="Internal Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Probation remarks, laptop issue, PF/UAN pending, etc." />
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600">Cancel</button>
          <button onClick={() => setShowCreate(false)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Save Demo Draft</button>
        </div>
      </Modal>
    </DemoShell>
  );
}

export function EmployeeOnboardingDemo() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({
    candidate: "Isha Malhotra",
    source: "LinkedIn",
    joiningDate: "2026-07-03",
    department: "Human Resources",
    designation: "Talent Acquisition Executive",
    reportingManager: "Nisha Gupta",
    workLocation: "Mumbai HQ",
    buddy: "Aarav Sharma",
    laptop: true,
    idCard: true,
    mailbox: true,
    policies: true,
    payroll: true,
    note: "",
  });

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Onboarding"
      title="Employee Onboarding Wizard"
      subtitle="Interactive onboarding flow covering pre-join checks, employment setup, asset assignment, payroll readiness and policy acknowledgements."
      actions={[
        <button key="bulk" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Bulk Pre-Boarding</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Onboarding Queue" subtitle="Upcoming joining dates" icon={Hourglass}>
          <div className="space-y-3">
            {[
              ["Isha Malhotra", "03 Jul 2026", "Offer accepted / HR pack pending"],
              ["Sahil Jain", "08 Jul 2026", "Assets requested / payroll setup pending"],
              ["Manya Kapoor", "15 Jul 2026", "BGV initiated / IT checklist open"],
            ].map(([name, date, note]) => (
              <button key={name} type="button" onClick={() => setDraft({ ...draft, candidate: name })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{name}</p>
                    <p className="mt-1 text-sm text-slate-600">{note}</p>
                  </div>
                  <Badge tone="blue">{date}</Badge>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Setup Flow" subtitle="Demo wizard state" icon={GraduationCap}>
          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3, 4].map((number) => (
              <button key={number} type="button" onClick={() => setStep(number)} className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-black", number === step ? "bg-indigo-600 text-white" : number < step ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}>
                {number < step ? <Check size={15} /> : number}
              </button>
            ))}
          </div>

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Candidate Name" value={draft.candidate} onChange={(e) => setDraft({ ...draft, candidate: e.target.value })} />
              <Select label="Source" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} options={["LinkedIn", "Referral", "Naukri", "Internal Transfer"]} />
              <Input label="Joining Date" type="date" value={draft.joiningDate} onChange={(e) => setDraft({ ...draft, joiningDate: e.target.value })} />
              <Select label="Department" value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} options={["Human Resources", "Sales", "Operations", "Finance"]} />
              <Select label="Designation" value={draft.designation} onChange={(e) => setDraft({ ...draft, designation: e.target.value })} options={["Talent Acquisition Executive", "Senior Sales Executive", "Warehouse Supervisor", "Payroll Analyst"]} />
              <Select label="Reporting Manager" value={draft.reportingManager} onChange={(e) => setDraft({ ...draft, reportingManager: e.target.value })} options={["Nisha Gupta", "Ritika Nair", "Prerna Kaul"]} />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Work Location" value={draft.workLocation} onChange={(e) => setDraft({ ...draft, workLocation: e.target.value })} options={["Mumbai HQ", "Delhi Warehouse", "Bengaluru Branch"]} />
              <Select label="Onboarding Buddy" value={draft.buddy} onChange={(e) => setDraft({ ...draft, buddy: e.target.value })} options={["Aarav Sharma", "Kunal Verma", "Ritika Nair"]} />
              <Toggle label="Laptop / workstation allocated" checked={draft.laptop} onChange={() => setDraft({ ...draft, laptop: !draft.laptop })} />
              <Toggle label="ID card requested" checked={draft.idCard} onChange={() => setDraft({ ...draft, idCard: !draft.idCard })} />
              <Toggle label="Mailbox / user account ready" checked={draft.mailbox} onChange={() => setDraft({ ...draft, mailbox: !draft.mailbox })} />
              <Toggle label="Payroll and bank setup ready" checked={draft.payroll} onChange={() => setDraft({ ...draft, payroll: !draft.payroll })} />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle label="Code of conduct accepted" checked={draft.policies} onChange={() => setDraft({ ...draft, policies: !draft.policies })} />
              <Toggle label="Data privacy acknowledgement" checked={true} onChange={() => {}} />
              <Toggle label="Leave policy briefing done" checked={true} onChange={() => {}} />
              <Toggle label="Attendance / shift policy explained" checked={false} onChange={() => {}} />
              <Textarea label="Joining Notes" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Checklist comments, pending documents, induction note, etc." className="sm:col-span-2" />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-black text-emerald-700">Ready For Joining</p>
                <p className="mt-1 text-sm text-emerald-700">All key checkpoints are visible here so later ERPNext and ERPExpress workflows can be plugged in without redesign.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Employee Draft</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{draft.candidate}</p>
                  <p className="mt-1 text-sm text-slate-600">{draft.designation} / {draft.department}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Joining</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{draft.joiningDate}</p>
                  <p className="mt-1 text-sm text-slate-600">Location: {draft.workLocation}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-between border-t border-slate-100 pt-5">
            <button type="button" disabled={step === 1} onClick={() => setStep((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40">
              Previous
            </button>
            <button type="button" onClick={() => setStep((value) => Math.min(4, value + 1))} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">
              {step === 4 ? "Freeze Demo Flow" : "Next Step"}
            </button>
          </div>
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function AttendanceDemo() {
  const [filters, setFilters] = useState({
    date: "2026-06-25",
    branch: "All Branches",
    shift: "All Shifts",
    status: "All Status",
  });
  const [showRegularization, setShowRegularization] = useState(false);

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Attendance"
      title="Attendance Workspace"
      subtitle="Daily attendance sheet, shift mapping, late entry monitoring, regularization and device-check dashboards."
      actions={[
        <button key="upload" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Import Device Logs</button>,
        <button key="regularize" onClick={() => setShowRegularization(true)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">New Regularization</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Present" value="49" hint="On selected date" icon={CheckCircle2} tone="emerald" />
        <MetricCard label="On Leave" value="03" hint="Approved only" icon={CalendarClock} tone="blue" />
        <MetricCard label="Late Entries" value="04" hint="Need manager watch" icon={Clock3} tone="amber" />
        <MetricCard label="Missing Punch" value="02" hint="Pending employee response" icon={History} tone="rose" />
        <MetricCard label="Device Sync" value="97%" hint="Last sync 08:42 AM" icon={Activity} tone="violet" />
      </div>

      <SectionCard
        title="Attendance Register"
        subtitle="Filters, approvals and punch analysis"
        icon={CalendarCheck2}
        action={
          <div className="flex flex-wrap gap-2">
            <Input label="Date" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className="w-[180px]" />
            <Select label="Branch" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} options={["All Branches", "Mumbai HQ", "Delhi Warehouse"]} className="w-[180px]" />
            <Select label="Shift" value={filters.shift} onChange={(e) => setFilters({ ...filters, shift: e.target.value })} options={["All Shifts", "General Shift", "Warehouse Shift"]} className="w-[180px]" />
          </div>
        }
      >
        <TableShell
          columns={["Employee", "Date", "Shift", "In Time", "Out Time", "Hours", "Status", "Regularization"]}
          rows={ATTENDANCE_LOG.map((row) => (
            <tr key={`${row.employee}-${row.date}`} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3"><AvatarChip name={row.employee} subline={row.request} /></td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.date}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.shift}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.in}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.out}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.hours}</td>
              <td className="px-3 py-3">
                <Badge tone={row.status === "Present" ? "green" : row.status === "On Leave" ? "blue" : "amber"}>{row.status}</Badge>
              </td>
              <td className="px-3 py-3 text-sm font-semibold text-indigo-600">{row.request}</td>
            </tr>
          ))}
        />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Shift Coverage" subtitle="Allocated vs open seats by shift" icon={Clock3}>
          <div className="space-y-4">
            {SHIFTS.map((shift) => (
              <div key={shift.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{shift.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{shift.start} - {shift.end} / {shift.weeklyOff}</p>
                  </div>
                  <Badge tone="slate">{shift.type}</Badge>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[82%] rounded-full bg-indigo-500" />
                </div>
                <p className="mt-2 text-xs text-slate-500">Grace period: {shift.grace} / Working hours: {shift.workingHours}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Auto Attendance Rules" subtitle="ERPNext-style attendance setting references" icon={Settings2}>
          <div className="space-y-3">
            <Toggle label="Enable auto attendance from biometric logs" checked={true} onChange={() => {}} />
            <Toggle label="Mark absent when missing both punches" checked={true} onChange={() => {}} />
            <Toggle label="Allow employee regularization request" checked={true} onChange={() => {}} />
            <Toggle label="Capture late entry and early exit reasons" checked={false} onChange={() => {}} />
            <Textarea label="Regularization Workflow Note" value="Employee -> Reporting Manager -> HR Operations -> Final attendance sync" onChange={() => {}} />
          </div>
        </SectionCard>
      </div>

      <Modal open={showRegularization} onClose={() => setShowRegularization(false)} title="Attendance Regularization" subtitle="Demo form for missing punch / late entry / work from home correction">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Employee" value="Aarav Sharma" onChange={() => {}} options={EMPLOYEES.map((employee) => employee.name)} />
          <Input label="Attendance Date" type="date" value="2026-06-25" onChange={() => {}} />
          <Input label="Requested In Time" type="time" value="09:00" onChange={() => {}} />
          <Input label="Requested Out Time" type="time" value="18:15" onChange={() => {}} />
          <Select label="Request Type" value="Late Entry" onChange={() => {}} options={["Late Entry", "Missing In Punch", "Missing Out Punch", "Work From Home", "Tour"]} />
          <Select label="Approver" value="Ritika Nair" onChange={() => {}} options={["Ritika Nair", "Prerna Kaul", "Anil Mehra"]} />
          <Textarea label="Reason" value="Client visit in first half, missed office punch." onChange={() => {}} className="sm:col-span-2" />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button onClick={() => setShowRegularization(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600">Cancel</button>
          <button onClick={() => setShowRegularization(false)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Submit Demo Request</button>
        </div>
      </Modal>
    </DemoShell>
  );
}

export function LeaveManagementDemo({ variant = "default" }) {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Leaves"
      title={variant === "calendar" ? "Leave Calendar" : variant === "all" ? "Leave Ledger" : "Leave Management"}
      subtitle="Leave applications, allocation references, policy coverage and team calendar placeholders for ERPNext-style leave flows."
      actions={[
        <button key="policy" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Leave Policy Matrix</button>,
        <button key="request" onClick={() => setShowRequest(true)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Create Leave Request</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending Approvals" value="7" hint="2 exceed leave balance" icon={CalendarClock} tone="amber" />
        <MetricCard label="Employees On Leave" value="3" hint="Today / all departments" icon={Users} tone="blue" />
        <MetricCard label="Optional Holidays Left" value="12" hint="Across all holiday lists" icon={Gift} tone="violet" />
        <MetricCard label="Leave Encashment" value="2" hint="Quarter-end requests" icon={WalletCards} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Approval Queue" subtitle="Manager and HR approval workspace" icon={CheckCircle2}>
          <TableShell
            columns={["Employee", "Leave Type", "From", "To", "Days", "Approver", "Status"]}
            rows={LEAVE_REQUESTS.map((leave) => (
              <tr key={`${leave.employee}-${leave.from}`} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3"><AvatarChip name={leave.employee} subline={`${leave.days} day(s)`} /></td>
                <td className="px-3 py-3 text-sm text-slate-700">{leave.type}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{leave.from}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{leave.to}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{leave.days}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{leave.approver}</td>
                <td className="px-3 py-3">
                  <Badge tone={leave.status === "Approved" ? "green" : "amber"}>{leave.status}</Badge>
                </td>
              </tr>
            ))}
          />
        </SectionCard>

        <SectionCard title="Balances & Rules" subtitle="Leave allocation view by employee group" icon={SlidersHorizontal}>
          <div className="space-y-4">
            {[
              ["Casual Leave", "6 allocated / 2 used / 4 available"],
              ["Sick Leave", "6 allocated / 1 used / 5 available"],
              ["Earned Leave", "18 allocated / 7 used / 11 available"],
              ["Comp Off", "0.5 days pending approval"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Demo Calendar Highlights</p>
              <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs">
                {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                  <div key={day} className="font-black text-slate-400">{day}</div>
                ))}
                {Array.from({ length: 28 }).map((_, index) => (
                  <div key={index} className={cn("rounded-lg border px-2 py-2", index === 10 || index === 11 ? "border-blue-200 bg-blue-50 text-blue-700" : index === 20 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-100 bg-slate-50 text-slate-600")}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Leave Application Form" subtitle="Interactive demo for ERPNext-style leave request capture">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Employee" value="Aarav Sharma" onChange={() => {}} options={EMPLOYEES.map((employee) => employee.name)} />
          <Select label="Leave Type" value="Casual Leave" onChange={() => {}} options={["Casual Leave", "Sick Leave", "Earned Leave", "Compensatory Off", "Optional Holiday"]} />
          <Input label="From Date" type="date" value="2026-06-28" onChange={() => {}} />
          <Input label="To Date" type="date" value="2026-06-28" onChange={() => {}} />
          <Select label="Half Day" value="No" onChange={() => {}} options={["No", "First Half", "Second Half"]} />
          <Select label="Leave Approver" value="Ritika Nair" onChange={() => {}} options={["Ritika Nair", "Prerna Kaul", "Anil Mehra"]} />
          <Textarea label="Reason" value="Family medical appointment." onChange={() => {}} className="sm:col-span-2" />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button onClick={() => setShowRequest(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600">Cancel</button>
          <button onClick={() => setShowRequest(false)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Submit Demo Request</button>
        </div>
      </Modal>
    </DemoShell>
  );
}

export function ShiftManagementDemo() {
  const [showShift, setShowShift] = useState(false);

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Shifts"
      title="Shift Management"
      subtitle="Shift master design, timing rules, weekly offs, attendance grace periods and employee allocation references."
      actions={[
        <button key="assign" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Bulk Shift Assignment</button>,
        <button key="new" onClick={() => setShowShift(true)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">New Shift Type</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Shift Types" subtitle="Active shift definitions" icon={Clock3}>
          <div className="space-y-4">
            {SHIFTS.map((shift) => (
              <div key={shift.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-slate-900">{shift.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{shift.start} - {shift.end} / Weekly Off: {shift.weeklyOff}</p>
                  </div>
                  <Badge tone="blue">{shift.type}</Badge>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grace Period</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{shift.grace}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Working Hours</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{shift.workingHours}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Auto Attendance</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">Enabled</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Shift Assignment Preview" subtitle="Employee allocation and rotation planning" icon={Users}>
          <TableShell
            columns={["Employee", "Current Shift", "Branch", "Next Rotation", "Approval"]}
            rows={EMPLOYEES.map((employee, index) => (
              <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3"><AvatarChip name={employee.name} subline={employee.department} /></td>
                <td className="px-3 py-3 text-sm text-slate-700">{employee.shift}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{employee.branch}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{index % 2 === 0 ? "01 Jul 2026" : "15 Jul 2026"}</td>
                <td className="px-3 py-3">
                  <Badge tone={index % 2 === 0 ? "green" : "amber"}>{index % 2 === 0 ? "Confirmed" : "Pending"}</Badge>
                </td>
              </tr>
            ))}
          />
        </SectionCard>
      </div>

      <Modal open={showShift} onClose={() => setShowShift(false)} title="Shift Type Form" subtitle="Interactive shift definition screen">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Shift Name" value="Corporate General Shift" onChange={() => {}} />
          <Select label="Shift Category" value="Office" onChange={() => {}} options={["Office", "Operations", "Support"]} />
          <Input label="Start Time" type="time" value="09:00" onChange={() => {}} />
          <Input label="End Time" type="time" value="18:00" onChange={() => {}} />
          <Input label="Grace Period (Minutes)" type="number" value="15" onChange={() => {}} />
          <Input label="Working Hours" value="8.5" onChange={() => {}} />
          <Select label="Weekly Off Pattern" value="Sunday" onChange={() => {}} options={["Sunday", "Saturday + Sunday", "Rotational"]} />
          <Select label="Holiday List" value="National Holidays 2026" onChange={() => {}} options={["National Holidays 2026", "Maharashtra Regional"]} />
        </div>
        <div className="mt-4 space-y-3">
          <Toggle label="Enable late entry marking" checked={true} onChange={() => {}} />
          <Toggle label="Enable early exit warning" checked={true} onChange={() => {}} />
          <Toggle label="Auto attendance from device logs" checked={true} onChange={() => {}} />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button onClick={() => setShowShift(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600">Cancel</button>
          <button onClick={() => setShowShift(false)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Save Demo Shift</button>
        </div>
      </Modal>
    </DemoShell>
  );
}

export function HolidayCalendarDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Holidays"
      title="Holiday Lists"
      subtitle="Holiday list setup, regional applicability and working-day impact previews."
      actions={[
        <button key="import" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Import Public Holidays</button>,
        <button key="new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Create Holiday</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Holiday Lists" subtitle="Configured list references" icon={Flag}>
          <div className="space-y-3">
            {[
              ["National Holidays 2026", "Applies to all branches / 11 holidays"],
              ["Maharashtra Regional", "Mumbai HQ and Pune / 5 regional holidays"],
              ["Delhi Regional", "Warehouse and North office / 4 regional holidays"],
            ].map(([title, note]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-black text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Holiday Entries" subtitle="Calendar items for preview" icon={CalendarDays}>
          <TableShell
            columns={["Holiday", "Date", "Type", "Holiday List"]}
            rows={HOLIDAYS.map((holiday) => (
              <tr key={holiday.name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3 text-sm font-bold text-slate-900">{holiday.name}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{holiday.date}</td>
                <td className="px-3 py-3"><Badge tone={holiday.type === "National" ? "green" : holiday.type === "Regional" ? "blue" : "amber"}>{holiday.type}</Badge></td>
                <td className="px-3 py-3 text-sm text-slate-700">{holiday.holidayList}</td>
              </tr>
            ))}
          />
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function PayrollDemo() {
  const [showRun, setShowRun] = useState(false);

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Payroll"
      title="Payroll Entry"
      subtitle="Salary structure readiness, payroll run preview, submission status and payout design modelled around ERPNext payroll flows."
      actions={[
        <button key="salary" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Salary Structure Assignment</button>,
        <button key="run" onClick={() => setShowRun(true)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">New Payroll Entry</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross Pay" value={currency(280700)} hint="Current demo view" icon={IndianRupee} tone="indigo" />
        <MetricCard label="Net Pay" value={currency(252850)} hint="After deductions" icon={WalletCards} tone="emerald" />
        <MetricCard label="Draft Entries" value="1" hint="Kunal Verma payroll in draft" icon={FileSpreadsheet} tone="amber" />
        <MetricCard label="Approved Entries" value="1" hint="Ready for payslip generation" icon={CheckCircle2} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Payroll Register" subtitle="Monthly employee payroll summary" icon={FileSpreadsheet}>
          <TableShell
            columns={["Employee", "Structure", "Branch", "Gross", "Deductions", "Net", "Status"]}
            rows={PAYROLL_ROWS.map((row) => (
              <tr key={row.employee} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3"><AvatarChip name={row.employee} subline={row.structure} /></td>
                <td className="px-3 py-3 text-sm text-slate-700">{row.structure}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{row.branch}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{currency(row.gross)}</td>
                <td className="px-3 py-3 text-sm text-rose-600">{currency(row.deductions)}</td>
                <td className="px-3 py-3 text-sm font-bold text-slate-900">{currency(row.net)}</td>
                <td className="px-3 py-3"><Badge tone={row.status === "Approved" ? "green" : row.status === "Submitted" ? "blue" : "amber"}>{row.status}</Badge></td>
              </tr>
            ))}
          />
        </SectionCard>

        <SectionCard title="Payroll Process Checklist" subtitle="Submission dependencies" icon={ListFilter}>
          <div className="space-y-3">
            {[
              ["Attendance finalized", "All shifts locked till 25 Jun 2026", true],
              ["Salary components synced", "1 employee has manual allowance adjustment", true],
              ["Leave without pay review", "2 records need validation", false],
              ["Bank file export ready", "Beneficiary validation pending for 2 employees", false],
            ].map(([title, note, ok]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900">{title}</p>
                  <Badge tone={ok ? "green" : "amber"}>{ok ? "Ready" : "Pending"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <Modal open={showRun} onClose={() => setShowRun(false)} title="Payroll Entry Form" subtitle="Demo payroll run setup">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Company" value="ERPExpress India" onChange={() => {}} options={["ERPExpress India"]} />
          <Select label="Payroll Frequency" value="Monthly" onChange={() => {}} options={["Monthly"]} />
          <Input label="Start Date" type="date" value="2026-06-01" onChange={() => {}} />
          <Input label="End Date" type="date" value="2026-06-30" onChange={() => {}} />
          <Select label="Branch Filter" value="All Branches" onChange={() => {}} options={["All Branches", "Mumbai HQ", "Delhi Warehouse"]} />
          <Select label="Department Filter" value="All Departments" onChange={() => {}} options={["All Departments", "Sales", "Operations", "Human Resources"]} />
          <Toggle label="Include salary slips after submit" checked={true} onChange={() => {}} />
          <Toggle label="Separate slips by branch" checked={false} onChange={() => {}} />
          <Textarea label="Remarks" value="June 2026 payroll run with attendance and leave finalized till 25 Jun." onChange={() => {}} className="sm:col-span-2" />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button onClick={() => setShowRun(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600">Cancel</button>
          <button onClick={() => setShowRun(false)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Create Demo Payroll</button>
        </div>
      </Modal>
    </DemoShell>
  );
}

export function SalaryStructureDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Salary"
      title="Salary Structures & Assignment"
      subtitle="Structure, components, flex benefits and employee assignment patterns before payroll processing."
      actions={[
        <button key="assign" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Assign To Employee</button>,
        <button key="new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">New Salary Structure</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Salary Components" subtitle="Recurring and deduction heads" icon={CreditCard}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Basic", "Earning", "Depends on grade / base salary"],
              ["HRA", "Earning", "Metro / non-metro template"],
              ["Special Allowance", "Earning", "Residual balancing component"],
              ["PF Employee", "Deduction", "12% of base up to policy cap"],
              ["Professional Tax", "Deduction", "State-specific slab setup"],
              ["ESI", "Deduction", "Threshold-based payroll setting"],
            ].map(([name, type, note]) => (
              <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-900">{name}</p>
                  <Badge tone={type === "Earning" ? "green" : "rose"}>{type}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Structure Assignment Preview" subtitle="Employee + branch + grade mapping" icon={WalletCards}>
          <TableShell
            columns={["Employee", "Salary Structure", "Payroll Frequency", "Effective From", "Branch"]}
            rows={PAYROLL_ROWS.map((row, index) => (
              <tr key={row.employee} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3"><AvatarChip name={row.employee} subline={index === 0 ? "G6 / Sales" : index === 1 ? "M2 / Sales" : "G5 / Operations"} /></td>
                <td className="px-3 py-3 text-sm text-slate-700">{row.structure}</td>
                <td className="px-3 py-3 text-sm text-slate-700">Monthly</td>
                <td className="px-3 py-3 text-sm text-slate-700">01 Apr 2026</td>
                <td className="px-3 py-3 text-sm text-slate-700">{row.branch}</td>
              </tr>
            ))}
          />
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function OrgMastersDemo({ section = "masters" }) {
  const titleMap = {
    masters: "Department & Designation Masters",
    departments: "Departments",
    designations: "Designations",
  };

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Masters"
      title={titleMap[section] || "HR Masters"}
      subtitle="Reference masters used by employee, leave, attendance and payroll screens."
      actions={[
        <button key="dept" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Create Department</button>,
        <button key="des" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Create Designation</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Departments" subtitle="Tree and ownership preview" icon={Building2}>
          <TableShell
            columns={["Department", "Manager", "Employees", "Cost Center", "Leave Policy"]}
            rows={DEPARTMENTS.map((department) => (
              <tr key={department.name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3 text-sm font-bold text-slate-900">{department.name}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{department.manager}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{department.employees}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{department.costCenter}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{department.leavePolicy}</td>
              </tr>
            ))}
          />
        </SectionCard>

        <SectionCard title="Designations" subtitle="Designation hierarchy preview" icon={Briefcase}>
          <TableShell
            columns={["Designation", "Department", "Level", "Reports To", "Openings"]}
            rows={DESIGNATIONS.map((designation) => (
              <tr key={designation.title} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3 text-sm font-bold text-slate-900">{designation.title}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{designation.department}</td>
                <td className="px-3 py-3"><Badge tone="slate">{designation.level}</Badge></td>
                <td className="px-3 py-3 text-sm text-slate-700">{designation.reportsTo}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{designation.openings}</td>
              </tr>
            ))}
          />
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function PerformanceDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Performance"
      title="Performance & Appraisal"
      subtitle="Appraisal cycles, KRAs, goals and reviewer checkpoints designed for later workflow and data integration."
      actions={[
        <button key="cycle" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">New Appraisal Cycle</button>,
        <button key="goal" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Assign Goals</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open Reviews" value="11" hint="Manager actions due this week" icon={Target} tone="indigo" />
        <MetricCard label="Completed Cycles" value="22" hint="FY 2025 fully archived" icon={CheckCircle2} tone="emerald" />
        <MetricCard label="Goal Weightage" value="100%" hint="Balanced across KRAs" icon={TrendingUp} tone="amber" />
        <MetricCard label="Feedback Forms" value="07" hint="Peer feedback in progress" icon={Star} tone="violet" />
      </div>

      <SectionCard title="Appraisal Register" subtitle="Cycle and reviewer progress" icon={FileText}>
        <TableShell
          columns={["Employee", "Cycle", "Template", "Score", "Reviewer", "Status"]}
          rows={APPRAISALS.map((row) => (
            <tr key={row.employee} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3"><AvatarChip name={row.employee} subline={row.template} /></td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.cycle}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.template}</td>
              <td className="px-3 py-3 text-sm font-bold text-slate-900">{row.score}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.reviewer}</td>
              <td className="px-3 py-3"><Badge tone={row.status === "Completed" ? "green" : row.status === "Manager Review" ? "blue" : "amber"}>{row.status}</Badge></td>
            </tr>
          ))}
        />
      </SectionCard>
    </DemoShell>
  );
}

export function ReportsDemo() {
  const [reportType, setReportType] = useState("Monthly Attendance Sheet");

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Reports"
      title="HR Reports"
      subtitle="Static report design zone for attendance, leave, payroll and employee analytics reports before integration."
      actions={[
        <button key="export" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Export XLSX</button>,
        <button key="schedule" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Schedule Report</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <SectionCard title="Report Library" subtitle="ERPNext-style HR report catalogue" icon={FileBarChart2}>
          <div className="space-y-3">
            {REPORTS.map((report) => (
              <button key={report.name} type="button" onClick={() => setReportType(report.name)} className={cn("w-full rounded-2xl border px-4 py-4 text-left transition", reportType === report.name ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50")}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{report.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{report.owner} / Updated {report.updated}</p>
                  </div>
                  <Badge tone="slate">{report.type}</Badge>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Report Preview"
          subtitle={reportType}
          icon={FileSpreadsheet}
          action={
            <div className="flex flex-wrap gap-2">
              <Select label="Department" value="All Departments" onChange={() => {}} options={["All Departments", "Sales", "Operations", "Human Resources"]} className="w-[180px]" />
              <Select label="Branch" value="All Branches" onChange={() => {}} options={["All Branches", "Mumbai HQ", "Delhi Warehouse"]} className="w-[180px]" />
            </div>
          }
        >
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <MetricCard label="Rows" value="58" hint="Report output count" icon={ListFilter} tone="indigo" />
            <MetricCard label="Variance" value="2.7%" hint="Compared to previous period" icon={TrendingUp} tone="amber" />
            <MetricCard label="Generated By" value="HR Ops" hint="Manual preview mode" icon={UserCheck} tone="emerald" />
          </div>
          <TableShell
            columns={["Employee", "Department", "Metric A", "Metric B", "Status"]}
            rows={EMPLOYEES.map((employee, index) => (
              <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3"><AvatarChip name={employee.name} subline={employee.id} /></td>
                <td className="px-3 py-3 text-sm text-slate-700">{employee.department}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{reportType === "Salary Register" ? currency(PAYROLL_ROWS[index % PAYROLL_ROWS.length].net) : index % 2 === 0 ? "Present" : "0.5 Days"}</td>
                <td className="px-3 py-3 text-sm text-slate-700">{reportType === "Leave Ledger By Department" ? `${12 - index} balance` : `${96 - index}%`}</td>
                <td className="px-3 py-3"><Badge tone={index % 2 === 0 ? "green" : "amber"}>{index % 2 === 0 ? "Normal" : "Attention"}</Badge></td>
              </tr>
            ))}
          />
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function SettingsDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Settings"
      title="HR Settings"
      subtitle="Configuration layer for attendance, leave, payroll and notification rules before backend logic is connected."
      actions={[
        <button key="policy" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Version History</button>,
        <button key="save" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Save Demo Settings</button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {SETTINGS_BLOCKS.map((block, index) => (
          <SectionCard key={block.title} title={block.title} subtitle="Editable switches and defaults" icon={[Settings2, CalendarClock, IndianRupee, Bell][index]}>
            <div className="space-y-3">
              {block.items.map((item, itemIndex) => (
                <Toggle key={item} label={item} checked={itemIndex !== 2} onChange={() => {}} />
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </DemoShell>
  );
}

export function ProfileDemo() {
  const employee = EMPLOYEES[0];

  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Profile"
      title="Employee Profile"
      subtitle="Self-service profile, contact update, bank preview, policy acknowledgement and quick links to ESS modules."
      actions={[
        <Link key="attendance" href="/admin/hr/my-attendance" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">My Attendance</Link>,
        <Link key="salary" href="/admin/hr/my-salary" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">My Salary</Link>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Identity" subtitle="Primary employee profile card" icon={User}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-white">
                {initials(employee.name)}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{employee.name}</h3>
                <p className="text-sm text-slate-500">{employee.designation}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone="green">{employee.status}</Badge>
                  <Badge tone="blue">{employee.branch}</Badge>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Company Email" value={employee.companyEmail} onChange={() => {}} />
              <Input label="Phone Number" value={employee.phone} onChange={() => {}} />
              <Input label="Emergency Contact" value={employee.emergency} onChange={() => {}} className="sm:col-span-2" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Employment & Banking" subtitle="ESS read-heavy details" icon={WalletCards}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Employee Code", employee.id],
              ["Department", employee.department],
              ["Reports To", employee.reportsTo],
              ["Shift", employee.shift],
              ["Date of Joining", employee.joiningDate],
              ["Salary Structure", employee.salaryStructure],
              ["Bank", employee.bank],
              ["PAN", employee.pan],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DemoShell>
  );
}

export function MyAttendanceDemo({ history = false }) {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / ESS"
      title={history ? "My Attendance History" : "My Attendance"}
      subtitle="Self-service attendance view with shift, check-in/out, month summary and regularization trail."
      actions={[
        <button key="request" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Apply Regularization</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Present Days" value="22" hint="Current month" icon={CheckCircle2} tone="emerald" />
        <MetricCard label="Late Entries" value="2" hint="Within grace policy" icon={Clock3} tone="amber" />
        <MetricCard label="Missing Punch" value="1" hint="Awaiting approval" icon={History} tone="rose" />
        <MetricCard label="Average Hours" value="8.7" hint="Working-day average" icon={Activity} tone="indigo" />
      </div>

      <SectionCard title="Attendance Timeline" subtitle="Daily ledger preview" icon={CalendarDays}>
        <TableShell
          columns={["Date", "Shift", "In Time", "Out Time", "Hours", "Status", "Remarks"]}
          rows={ATTENDANCE_LOG.map((row) => (
            <tr key={`${row.employee}-${row.date}`} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3 text-sm text-slate-700">{row.date}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.shift}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.in}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.out}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{row.hours}</td>
              <td className="px-3 py-3"><Badge tone={row.status === "Present" ? "green" : "blue"}>{row.status}</Badge></td>
              <td className="px-3 py-3 text-sm text-slate-700">{history ? row.request : row.request === "None" ? "Within shift hours" : row.request}</td>
            </tr>
          ))}
        />
      </SectionCard>
    </DemoShell>
  );
}

export function MyLeavesDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / ESS"
      title="My Leaves"
      subtitle="Employee leave balances, requests and calendar summary."
      actions={[
        <button key="new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Apply Leave</button>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Casual Leave" value="4" hint="Available balance" icon={CalendarClock} tone="blue" />
        <MetricCard label="Sick Leave" value="5" hint="Available balance" icon={ShieldCheck} tone="emerald" />
        <MetricCard label="Earned Leave" value="11" hint="Available balance" icon={CalendarDays} tone="violet" />
        <MetricCard label="Pending Requests" value="1" hint="Awaiting manager action" icon={Hourglass} tone="amber" />
      </div>

      <SectionCard title="My Leave Requests" subtitle="ESS request history" icon={FileText}>
        <TableShell
          columns={["Leave Type", "From", "To", "Days", "Approver", "Status"]}
          rows={LEAVE_REQUESTS.map((leave) => (
            <tr key={`${leave.employee}-${leave.from}`} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3 text-sm text-slate-700">{leave.type}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{leave.from}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{leave.to}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{leave.days}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{leave.approver}</td>
              <td className="px-3 py-3"><Badge tone={leave.status === "Approved" ? "green" : "amber"}>{leave.status}</Badge></td>
            </tr>
          ))}
        />
      </SectionCard>
    </DemoShell>
  );
}

export function MySalaryDemo() {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / ESS"
      title="My Salary"
      subtitle="Salary summary, last payroll details and payslip shortcuts."
      actions={[
        <Link key="payslip" href="/admin/hr/payslip/EMP-0001-JUN-2026" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Open Payslip</Link>,
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross Salary" value={currency(78500)} hint="Current monthly structure" icon={IndianRupee} tone="indigo" />
        <MetricCard label="Deductions" value={currency(6800)} hint="PF, PT and others" icon={CreditCard} tone="rose" />
        <MetricCard label="Net Salary" value={currency(71700)} hint="Latest processed month" icon={WalletCards} tone="emerald" />
        <MetricCard label="Last Payslip" value="Jun 2026" hint="Released on 30 Jun" icon={FileText} tone="blue" />
      </div>

      <SectionCard title="Recent Salary Entries" subtitle="Payslip history preview" icon={FileText}>
        <TableShell
          columns={["Month", "Gross", "Deductions", "Net", "Status", "Slip"]}
          rows={["Apr 2026", "May 2026", "Jun 2026"].map((month) => (
            <tr key={month} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3 text-sm text-slate-700">{month}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{currency(78500)}</td>
              <td className="px-3 py-3 text-sm text-slate-700">{currency(6800)}</td>
              <td className="px-3 py-3 text-sm font-bold text-slate-900">{currency(71700)}</td>
              <td className="px-3 py-3"><Badge tone="green">Paid</Badge></td>
              <td className="px-3 py-3">
                <Link href="/admin/hr/payslip/EMP-0001-JUN-2026" className="text-xs font-bold uppercase tracking-widest text-indigo-600">View</Link>
              </td>
            </tr>
          ))}
        />
      </SectionCard>
    </DemoShell>
  );
}

export function PayslipDemo({ payslipId = "EMP-0001-JUN-2026" }) {
  return (
    <DemoShell
      eyebrow="ERPExpress / HRMS / Payslip"
      title="Payslip Preview"
      subtitle="Static payslip design with company, employee, earnings, deductions and bank advice areas."
      actions={[
        <button key="print" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700">Print Layout</button>,
        <button key="download" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white">Download PDF</button>,
      ]}
    >
      <SectionCard title="Payslip" subtitle={payslipId} icon={FileText}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Company</p>
              <p className="mt-1 text-base font-black text-slate-900">ERPExpress India Pvt Ltd</p>
              <p className="mt-1 text-sm text-slate-600">Mumbai HQ / GST + payroll entity placeholder</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Employee", "Aarav Sharma"],
                ["Employee Code", "EMP-0001"],
                ["Department", "Sales"],
                ["Designation", "Senior Sales Executive"],
                ["Payroll Month", "Jun 2026"],
                ["Bank", "HDFC Bank / 9812"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Net Pay</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{currency(71700)}</p>
            <p className="mt-1 text-sm text-slate-600">In words: Rupees Seventy One Thousand Seven Hundred Only</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gross Pay</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{currency(78500)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Deductions</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{currency(6800)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Earnings" subtitle="Recurring salary components" icon={TrendingUp}>
            <div className="space-y-3">
              {[
                ["Basic", currency(42000)],
                ["House Rent Allowance", currency(16800)],
                ["Special Allowance", currency(14600)],
                ["Conveyance", currency(5100)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                  <span className="text-sm font-black text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Deductions" subtitle="Statutory and policy deductions" icon={CreditCard}>
            <div className="space-y-3">
              {[
                ["Provident Fund", currency(5040)],
                ["Professional Tax", currency(200)],
                ["Meal Recovery", currency(560)],
                ["Other Adjustment", currency(1000)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                  <span className="text-sm font-black text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </SectionCard>
    </DemoShell>
  );
}
