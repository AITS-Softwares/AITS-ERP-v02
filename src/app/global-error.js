"use client";

import DistributorFallbackFrame from "@/components/distributor/DistributorFallbackFrame";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body>
        <DistributorFallbackFrame
          title="App temporarily unavailable"
          message="We hit an unexpected problem while loading the app. Try again or return to the distributor dashboard."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
