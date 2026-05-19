"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type SignOutButtonProps = {
  tone?: "primary" | "warning";
};

export function SignOutButton({ tone = "primary" }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const toneClass =
    tone === "warning"
      ? "hover:border-warning/50 focus-visible:ring-warning/30"
      : "hover:border-primary/50 focus-visible:ring-primary/30";

  async function handleSignOut() {
    setIsPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className={`rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted outline-none transition duration-150 hover:text-foreground active:scale-[0.99] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
    >
      {isPending ? "Signing out..." : "Log out"}
    </button>
  );
}
