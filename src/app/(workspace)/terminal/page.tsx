import { CandlestickPanel } from "@/components/market/candlestick-panel";
import { LiveMarketTape } from "@/components/market/live-market-tape";
import { ActionToolbar } from "@/components/dashboard/primitives";
import {
  DataTable,
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import {
  getTerminalState,
  type TerminalOpenPositionRow,
} from "@/server/trading/terminal-state";
import {
  checkRiskExitsAction,
  closeSimulatedPositionAction,
  createSimulatedOrderAction,
} from "./actions";

const openPositionColumns = [
  {
    header: "Pair",
    cell: (position) => <span className="font-medium">{position.pair}</span>,
  },
  {
    header: "Side",
    cell: (position) => (
      <StatusBadge tone={position.side === "long" ? "success" : "danger"}>
        {position.side}
      </StatusBadge>
    ),
  },
  {
    header: "Size",
    cell: (position) => <span className="font-mono">{position.size}</span>,
  },
  {
    header: "Lev.",
    cell: (position) => (
      <span className="font-mono text-muted">{position.leverage}</span>
    ),
  },
  {
    header: "Entry",
    cell: (position) => (
      <span className="font-mono text-muted">{position.entry}</span>
    ),
  },
  {
    header: "Live",
    cell: (position) => (
      <span className="font-mono text-muted">{position.current}</span>
    ),
  },
  {
    header: "PnL",
    cell: (position) => (
      <span
        className={
          position.pnlCents >= 0
            ? "font-mono text-success"
            : "font-mono text-danger"
        }
      >
        {position.pnl}
      </span>
    ),
  },
  {
    header: "Risk exits",
    cell: (position) => (
      <span className="font-mono text-muted">{position.riskExits}</span>
    ),
  },
  {
    header: "Actions",
    cell: (position) => <OpenPositionActions position={position} />,
  },
] as const satisfies readonly DataTableColumn<TerminalOpenPositionRow>[];

export default async function TerminalPage() {
  const session = await requireSession();
  const state = await getTerminalState(session.user.id);

  return (
    <>
      <DashboardPageHeader
        description="Simulated manual trading with real market prices for order entry and PnL calculation."
        title="Trading Terminal"
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <DashboardCard
          description="Real OHLCV candles from Binance REST"
          title="Market chart"
        >
          {state.kind === "ready" && state.chart ? (
            <CandlestickPanel
              candles={state.chart.candles}
              symbol={state.chart.symbol}
            />
          ) : null}

          {state.kind === "ready" && !state.chart ? (
            <EmptyState
              description="Enable at least one trading pair to load live candles."
              title="No chart data"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState title="Market chart is not ready" />
          ) : null}
        </DashboardCard>
        <DashboardCard
          action={
            <form action={checkRiskExitsFormAction}>
              <button
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition duration-150 hover:border-primary/50 hover:text-foreground"
                type="submit"
              >
                Check risk exits
              </button>
            </form>
          }
          description="Creates simulated positions from real current prices"
          title="Demo order"
        >
          {state.kind === "ready" && state.pairs.length > 0 ? (
            <form action={createSimulatedOrderFormAction} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Pair</span>
                <select
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  name="pairSymbol"
                >
                  {state.pairs.map((pair) => (
                    <option key={pair.symbol} value={pair.symbol}>
                      {pair.symbol}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Side</span>
                  <select
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    defaultValue="long"
                    name="side"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Leverage</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    defaultValue="1"
                    min="1"
                    name="leverage"
                    step="1"
                    type="number"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Notional</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  defaultValue="1000"
                  max="100000"
                  min="10"
                  name="notional"
                  step="0.01"
                  type="number"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Stop loss</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    min="0"
                    name="stopLoss"
                    placeholder="Optional price"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Take profit</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    min="0"
                    name="takeProfit"
                    placeholder="Optional price"
                    step="0.01"
                    type="number"
                  />
                </label>
              </div>

              <button
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
                type="submit"
              >
                Open simulated order
              </button>
            </form>
          ) : null}

          {state.kind === "ready" && state.pairs.length === 0 ? (
            <EmptyState
              description="Enable at least one trading pair in the admin panel before creating simulated orders."
              title="No enabled trading pairs"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted simulated trading."
              title="Trading tables are not ready"
            />
          ) : null}
        </DashboardCard>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <DashboardCard
          description="Enabled markets with live 24h context when available"
          title="Pairs"
        >
          {state.kind === "ready" && state.pairs.length > 0 ? (
            <LiveMarketTape rows={state.pairs} />
          ) : null}

          {state.kind === "ready" && state.pairs.length === 0 ? (
            <EmptyState title="No enabled pairs" />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState title="Trading pairs are not ready" />
          ) : null}
        </DashboardCard>

        <DashboardCard
          description="Positions created by manual simulated orders"
          title="Open positions"
        >
          {state.kind === "ready" && state.positions.length > 0 ? (
            <DataTable
              columns={openPositionColumns}
              getRowKey={(position) => position.id}
              minWidth="980px"
              rows={state.positions}
            />
          ) : null}

          {state.kind === "ready" && state.positions.length === 0 ? (
            <EmptyState
              description="Open a simulated order above and the position will appear here."
              title="No open positions"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState title="Position table is not ready" />
          ) : null}
        </DashboardCard>
      </section>
    </>
  );
}

function OpenPositionActions({ position }: { position: TerminalOpenPositionRow }) {
  return (
    <ActionToolbar>
      <form action={closeSimulatedPositionFormAction}>
        <input name="positionId" type="hidden" value={position.id} />
        <button
          className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400"
          type="submit"
        >
          Close
        </button>
      </form>
    </ActionToolbar>
  );
}

async function checkRiskExitsFormAction() {
  "use server";

  await checkRiskExitsAction();
}

async function createSimulatedOrderFormAction(formData: FormData) {
  "use server";

  await createSimulatedOrderAction(formData);
}

async function closeSimulatedPositionFormAction(formData: FormData) {
  "use server";

  await closeSimulatedPositionAction(formData);
}
