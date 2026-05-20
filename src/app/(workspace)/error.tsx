"use client";

import { useEffect } from "react";
import { RouteErrorState } from "@/components/dashboard-shell";

export default function WorkspaceError({
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
      description="The workspace view could not render. No simulated trading data was changed."
      digest={error.digest}
      onRetry={unstable_retry}
      title="Workspace unavailable"
    />
  );
}
