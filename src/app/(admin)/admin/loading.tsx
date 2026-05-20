import { LoadingState } from "@/components/admin-shell";

export default function AdminLoading() {
  return (
    <LoadingState
      description="Preparing operational reviews, user records, simulated requests, and admin controls."
      title="Loading admin workspace"
    />
  );
}
