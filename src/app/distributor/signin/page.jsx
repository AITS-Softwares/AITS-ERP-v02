import { DistributorOtpPreview } from "@/components/distributor/DistributorInteractiveForms";
import { FiShield, FiSmartphone } from "react-icons/fi";

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
              Distributor screens for ERPExpress, ready for mobile-first review.
            </h1>
            <p className="max-w-2xl text-sm text-blue-100 sm:text-base">
              OTP request and verification are wired to distributor auth endpoints. ERPNext mapping will work once distributor accounts and app users are configured.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <FiSmartphone className="text-2xl text-blue-100" />
              <p className="mt-4 text-lg font-semibold">Mobile OTP flow</p>
              <p className="mt-2 text-sm text-blue-100">Phone number, OTP verification, and a lightweight first-run distributor profile check.</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <FiShield className="text-2xl text-blue-100" />
              <p className="mt-4 text-lg font-semibold">Role-gated access</p>
              <p className="mt-2 text-sm text-blue-100">Distributor users will only see distributor routes and distributor module actions.</p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold">Login with mobile OTP</h2>
            <p className="mt-2 text-sm text-slate-500">Use mobile OTP to access the distributor workspace after account mapping is configured.</p>
          </div>
          <DistributorOtpPreview />
        </section>
      </div>
    </main>
  );
}
