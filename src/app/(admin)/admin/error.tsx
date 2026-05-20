"use client";

import { useEffect } from "react";
import { RouteErrorState } from "@/components/admin-shell";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteErrorState
      description="The admin view could not render. No simulated operational state was changed."
      digest={error.digest}
      onRetry={unstable_retry}
      title="Admin workspace unavailable"
      tone="warning"
    />
  );
}
