"use client";

import { usePathname } from "next/navigation";
import DistributorShell from "@/components/distributor/DistributorShell";
import { DistributorDataProvider } from "@/components/distributor/DistributorDataProvider";

export default function DistributorRouteBoundary({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/distributor/admin")) return children;

  return (
    <DistributorDataProvider>
      <DistributorShell>{children}</DistributorShell>
    </DistributorDataProvider>
  );
}
