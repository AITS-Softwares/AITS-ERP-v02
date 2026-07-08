import DistributorFallbackFrame from "@/components/distributor/DistributorFallbackFrame";

export default function NotFound() {
  return (
    <DistributorFallbackFrame
      title="Page not found"
      message="This page does not exist. Use the links below to continue inside the app."
    />
  );
}
