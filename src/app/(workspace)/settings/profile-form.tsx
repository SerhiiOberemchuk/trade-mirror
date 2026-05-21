"use client";

import { useActionState } from "react";
import { updateProfileAction, type UpdateProfileActionState } from "./actions";

const initialState: UpdateProfileActionState = {
  message: "",
  status: "idle",
};

export function ProfileForm({ email, name }: { email: string; name: string }) {
  const [state, action, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <fieldset className="space-y-4 disabled:opacity-60" disabled={isPending}>
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            defaultValue={name}
            maxLength={80}
            minLength={2}
            name="name"
            required
            type="text"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-muted outline-none"
            defaultValue={email}
            disabled
            type="email"
          />
        </label>

        <button
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving..." : "Save profile"}
        </button>
      </fieldset>

      {state.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium leading-6 ${
            state.status === "success"
              ? "border-success/40 bg-success/10 text-emerald-200"
              : "border-danger/40 bg-danger/10 text-red-200"
          }`}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
