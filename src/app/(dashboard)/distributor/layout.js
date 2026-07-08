import DistributorShell from "@/components/distributor/DistributorShell";
import { DistributorDataProvider } from "@/components/distributor/DistributorDataProvider";

export default function DistributorLayout({ children }) {
  return (
    <DistributorDataProvider>
      <DistributorShell>{children}</DistributorShell>
    </DistributorDataProvider>
  );
}
