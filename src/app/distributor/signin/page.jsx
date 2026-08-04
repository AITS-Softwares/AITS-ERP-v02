import Link from "next/link";
import { DistributorOtpPreview } from "@/components/distributor/DistributorInteractiveForms";

export default function DistributorSigninPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a75b5,_#105B92_42%,_#0b2034_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-6">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
            Distributor login
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              Secure distributor access for ERPExpress.
            </h1>
            <p className="max-w-2xl text-sm text-blue-100 sm:text-base">
              Sign in with your registered distributor email address or mobile number to access orders, stock, invoices, dispatch, and finance.
            </p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-sm text-blue-100">
            Access is limited to mapped distributor users and linked ERPNext customer accounts.
          </div>
        </section>

        <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Distributor access</p>
            <h2 className="mt-2 text-2xl font-semibold">Login with email or mobile OTP</h2>
            <p className="mt-2 text-sm text-slate-500">Use your registered distributor login details to continue.</p>
          </div>
          <DistributorOtpPreview />
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-500">
            Managing distributor access? <Link href="/distributor/admin/signin" className="font-semibold text-[#105B92]">Admin sign in</Link>
            <span className="px-2 text-slate-300">|</span>
            <Link href="/distributor/admin/register" className="font-semibold text-[#105B92]">Register Admin</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
