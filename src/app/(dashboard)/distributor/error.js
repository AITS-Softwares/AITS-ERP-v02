"use client";

import DistributorFallbackFrame from "@/components/distributor/DistributorFallbackFrame";

export default function DistributorError({ reset }) {
  return (
    <DistributorFallbackFrame
      title="Something went wrong"
      message="We could not open this distributor page right now. Your saved draft data is kept on this device."
      onRetry={reset}
      showBottomNav={false}
    />
  );
}
