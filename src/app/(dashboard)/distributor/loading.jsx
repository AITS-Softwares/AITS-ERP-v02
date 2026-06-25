import { SkeletonCard } from "@/components/distributor/DistributorUI";

export default function DistributorLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200"></div>
        <div className="mt-4 h-10 w-64 animate-pulse rounded bg-slate-200"></div>
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100"></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
