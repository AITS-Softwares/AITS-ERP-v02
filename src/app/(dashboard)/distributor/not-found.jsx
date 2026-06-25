import Link from "next/link";
import { StatePanel, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorNotFound() {
  return (
    <Surface className="mx-auto max-w-2xl p-6 sm:p-8">
      <StatePanel tone="amber" title="Record not found" description="The selected record is not available." />
      <div className="mt-5">
        <Link href="/distributor" className="inline-flex rounded-full bg-[#105B92] px-4 py-2 text-sm font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    </Surface>
  );
}
