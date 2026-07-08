import DistributorFallbackFrame from "@/components/distributor/DistributorFallbackFrame";

export default function DistributorNotFound() {
  return (
    <DistributorFallbackFrame
      title="Page not found"
      message="The distributor page you opened is not available or may have been moved."
      showBottomNav={false}
    />
  );
}
