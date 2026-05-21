"use client";

import { DashboardCard } from "@/components/dashboard-shell";
import { useActionState, useEffect, useRef } from "react";
import {
  applyBonusCodeAction,
  createDepositRequestAction,
  createWithdrawalRequestAction,
  type WalletActionState,
} from "./actions";

const inputClass =
  "mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const initialState: WalletActionState = { message: "", status: "idle" };

export function WalletForms() {
  return (
    <>
      <DashboardCard
        description="Create a simulated deposit request for admin review"
        title="Deposit request"
      >
        <WalletActionForm action={createDepositRequestAction}>
          <label className="block">
            <span className="text-sm font-medium">Amount</span>
            <input
              className={inputClass}
              defaultValue="5000"
              max="100000"
              min="10"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Method</span>
            <select className={inputClass} defaultValue="demo-card" name="method" required>
              <option value="demo-card">Demo card</option>
              <option value="demo-wire">Demo wire</option>
              <option value="bonus-credit">Bonus credit</option>
            </select>
          </label>

          <SubmitButton>Submit deposit request</SubmitButton>
        </WalletActionForm>
      </DashboardCard>

      <DashboardCard
        description="Apply an enabled admin bonus campaign to create approved simulated credit"
        title="Bonus code"
      >
        <WalletActionForm action={applyBonusCodeAction}>
          <label className="block">
            <span className="text-sm font-medium">Code</span>
            <input
              className={`${inputClass} font-mono uppercase`}
              name="code"
              placeholder="FIRST25"
              required
              type="text"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Base amount</span>
            <input
              className={inputClass}
              defaultValue="1000"
              max="100000"
              min="10"
              name="baseAmount"
              required
              step="0.01"
              type="number"
            />
          </label>

          <SubmitButton>Apply bonus</SubmitButton>
        </WalletActionForm>
      </DashboardCard>

      <DashboardCard
        description="Create a simulated withdrawal request for admin review"
        title="Withdrawal request"
      >
        <WalletActionForm action={createWithdrawalRequestAction}>
          <label className="block">
            <span className="text-sm font-medium">Amount</span>
            <input
              className={inputClass}
              defaultValue="2500"
              max="100000"
              min="10"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Review risk</span>
            <select className={inputClass} defaultValue="low" name="riskLevel" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <SubmitButton>Submit withdrawal request</SubmitButton>
        </WalletActionForm>
      </DashboardCard>
    </>
  );
}

function WalletActionForm({
  action,
  children,
}: {
  action: (
    state: WalletActionState,
    formData: FormData,
  ) => Promise<WalletActionState>;
  children: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      <fieldset className="space-y-4 disabled:opacity-60" disabled={isPending}>
        {children}
      </fieldset>
      {state.message ? <FormMessage state={state} /> : null}
    </form>
  );
}

function FormMessage({ state }: { state: WalletActionState }) {
  return (
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
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
      type="submit"
    >
      {children}
    </button>
  );
}
