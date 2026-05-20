import { LoadingState } from "@/components/dashboard-shell";

export default function WorkspaceLoading() {
  return (
    <LoadingState
      description="Preparing simulated balances, positions, tickets, and workspace controls."
      title="Loading workspace"
    />
  );
}
