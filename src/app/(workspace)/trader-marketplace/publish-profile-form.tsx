"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  publishTraderProfileAction,
  type PublishTraderProfileState,
} from "./actions";

const initialState: PublishTraderProfileState = {
  message: "",
  status: "idle",
};

export function PublishProfileForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(
    publishTraderProfileAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form action={action} className="space-y-4" ref={formRef}>
      <label className="block">
        <span className="text-sm font-medium">Display name</span>
        <input
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          maxLength={80}
          minLength={3}
          name="displayName"
          placeholder="Mira Quant"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Strategy</span>
        <input
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          maxLength={120}
          minLength={3}
          name="strategy"
          placeholder="Momentum grid"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Risk</span>
        <select
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          defaultValue="medium"
          name="riskLevel"
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">Monthly PnL</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            defaultValue="24"
            max="300"
            min="-100"
            name="monthlyPnl"
            required
            step="0.01"
            type="number"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Win rate</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            defaultValue="68"
            max="100"
            min="0"
            name="winRate"
            required
            step="0.01"
            type="number"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Drawdown</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            defaultValue="8"
            max="100"
            min="0"
            name="maxDrawdown"
            required
            step="0.01"
            type="number"
          />
        </label>
      </div>

      <button
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Publishing..." : "Publish profile"}
      </button>

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
