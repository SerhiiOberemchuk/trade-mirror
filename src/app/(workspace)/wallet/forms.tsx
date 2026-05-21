import { DashboardCard } from "@/components/dashboard-shell";
import {
  applyBonusCodeAction,
  createDepositRequestAction,
  createWithdrawalRequestAction,
} from "./actions";

const inputClass =
  "mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

export function WalletForms() {
  return (
    <>
      <DashboardCard
        description="Create a simulated deposit request for admin review"
        title="Deposit request"
      >
        <form action={createDepositRequestAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Amount</span>
            <input
              className={inputClass}
              defaultValue="5000"
              max="100000"
              min="10"
              name="amount"
              step="0.01"
              type="number"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Method</span>
            <select className={inputClass} defaultValue="demo-card" name="method">
              <option value="demo-card">Demo card</option>
              <option value="demo-wire">Demo wire</option>
              <option value="bonus-credit">Bonus credit</option>
            </select>
          </label>

          <SubmitButton>Submit deposit request</SubmitButton>
        </form>
      </DashboardCard>

      <DashboardCard
        description="Apply an enabled admin bonus campaign to create approved simulated credit"
        title="Bonus code"
      >
        <form action={applyBonusCodeAction} className="space-y-4">
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
              step="0.01"
              type="number"
            />
          </label>

          <SubmitButton>Apply bonus</SubmitButton>
        </form>
      </DashboardCard>

      <DashboardCard
        description="Create a simulated withdrawal request for admin review"
        title="Withdrawal request"
      >
        <form action={createWithdrawalRequestAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Amount</span>
            <input
              className={inputClass}
              defaultValue="2500"
              max="100000"
              min="10"
              name="amount"
              step="0.01"
              type="number"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Review risk</span>
            <select className={inputClass} defaultValue="low" name="riskLevel">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <SubmitButton>Submit withdrawal request</SubmitButton>
        </form>
      </DashboardCard>
    </>
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
