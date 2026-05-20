import { db } from "@/db";
import { simulatedPositions, tradingPairs } from "@/db/schema";
import { TradingTerminalPreview } from "@/components/market-panels";
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
import { getBinanceTickerSnapshot } from "@/server/market-data/binance";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  closeSimulatedPositionAction,
  createSimulatedOrderAction,
} from "./actions";

type PairRow = {
  symbol: string;
  maxLeverage: number;
  change: string;
  volume: string;
};

type OpenPositionRow = {
  id: string;
  pair: string;
  side: "long" | "short";
  size: string;
  leverage: string;
  entry: string;
  current: string;
  pnl: string;
  pnlCents: number;
};

const openPositionColumns = [
  {
    header: "Pair",
    cell: (position) => <span className="font-medium">{position.pair}</span>,
  },
  {
    header: "Side",
    cell: (position) => <StatusBadge tone={position.side === "long" ? "success" : "danger"}>{position.side}</StatusBadge>,
  },
  {
    header: "Size",
    cell: (position) => <span className="font-mono">{position.size}</span>,
  },
  {
    header: "Lev.",
    cell: (position) => <span className="font-mono text-muted">{position.leverage}</span>,
  },
  {
    header: "Entry",
    cell: (position) => <span className="font-mono text-muted">{position.entry}</span>,
  },
  {
    header: "Live",
    cell: (position) => <span className="font-mono text-muted">{position.current}</span>,
  },
  {
    header: "PnL",
    cell: (position) => (
      <span className={position.pnlCents >= 0 ? "font-mono text-success" : "font-mono text-danger"}>
        {position.pnl}
      </span>
    ),
  },
  {
    header: "Actions",
    cell: (position) => <OpenPositionActions position={position} />,
  },
] as const satisfies readonly DataTableColumn<OpenPositionRow>[];

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
        <TradingTerminalPreview />
        <DashboardCard description="Creates simulated positions from real current prices" title="Demo order">
          {state.kind === "ready" && state.pairs.length > 0 ? (
            <form action={createSimulatedOrderAction} className="space-y-4">
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
        <DashboardCard description="Enabled markets with live 24h context when available" title="Pairs">
          {state.kind === "ready" && state.pairs.length > 0 ? (
            <div className="space-y-2">
              {state.pairs.map((pair) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm" key={pair.symbol}>
                  <div>
                    <p className="font-medium">{pair.symbol}</p>
                    <p className="mt-1 text-xs text-muted">Max {pair.maxLeverage}x / Vol {pair.volume}</p>
                  </div>
                  <StatusBadge tone={pair.change.startsWith("-") ? "danger" : "success"}>{pair.change}</StatusBadge>
                </div>
              ))}
            </div>
          ) : null}

          {state.kind === "ready" && state.pairs.length === 0 ? (
            <EmptyState title="No enabled pairs" />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState title="Trading pairs are not ready" />
          ) : null}
        </DashboardCard>

        <DashboardCard description="Positions created by manual simulated orders" title="Open positions">
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

function OpenPositionActions({ position }: { position: OpenPositionRow }) {
  return (
    <ActionToolbar>
      <form action={closeSimulatedPositionAction}>
        <input name="positionId" type="hidden" value={position.id} />
        <button className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400" type="submit">
          Close
        </button>
      </form>
    </ActionToolbar>
  );
}

async function getTerminalState(userId: string): Promise<
  | { kind: "ready"; pairs: PairRow[]; positions: OpenPositionRow[] }
  | { kind: "setup-required" }
> {
  try {
    const [pairRows, positionRows] = await Promise.all([
      db
        .select()
        .from(tradingPairs)
        .where(eq(tradingPairs.status, "enabled"))
        .orderBy(asc(tradingPairs.symbol)),
      db
        .select()
        .from(simulatedPositions)
        .where(and(eq(simulatedPositions.userId, userId), eq(simulatedPositions.status, "open")))
        .orderBy(desc(simulatedPositions.openedAt)),
    ]);

    const symbols = Array.from(new Set([
      ...pairRows.map((pair) => pair.symbol),
      ...positionRows.map((position) => position.pairSymbol),
    ]));
    const tickerMap = await getTickerMap(symbols);

    return {
      kind: "ready",
      pairs: pairRows.map((pair) => {
        const ticker = tickerMap.get(pair.symbol);

        return {
          change: ticker ? formatPercent(ticker.changePercent24h) : "n/a",
          maxLeverage: pair.maxLeverage,
          symbol: pair.symbol,
          volume: ticker ? formatCompactMoney(ticker.quoteVolume24h) : "n/a",
        };
      }),
      positions: positionRows.map((position) => {
        const ticker = tickerMap.get(position.pairSymbol);
        const currentPriceCents = ticker?.priceCents ?? position.entryPriceCents;
        const pnlCents = calculatePnlCents({
          currentPriceCents,
          entryPriceCents: position.entryPriceCents,
          notionalCents: position.notionalCents,
          side: position.side,
        });

        return {
          current: ticker ? formatMoney(currentPriceCents, "USD") : "n/a",
          entry: formatMoney(position.entryPriceCents, "USD"),
          id: position.id,
          leverage: `${position.leverage}x`,
          pair: position.pairSymbol,
          pnl: formatSignedMoney(pnlCents, "USD"),
          pnlCents,
          side: position.side,
          size: formatMoney(position.notionalCents, "USD"),
        };
      }),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

async function getTickerMap(symbols: string[]) {
  const entries = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return [symbol, await getBinanceTickerSnapshot(symbol)] as const;
      } catch {
        return [symbol, null] as const;
      }
    }),
  );

  return new Map(entries.filter((entry): entry is readonly [string, NonNullable<(typeof entry)[1]>] => entry[1] !== null));
}

function calculatePnlCents({
  currentPriceCents,
  entryPriceCents,
  notionalCents,
  side,
}: {
  currentPriceCents: number;
  entryPriceCents: number;
  notionalCents: number;
  side: OpenPositionRow["side"];
}) {
  const priceMove = (currentPriceCents - entryPriceCents) / entryPriceCents;
  const directionalMove = side === "long" ? priceMove : -priceMove;

  return Math.round(notionalCents * directionalMove);
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    currency,
    style: "currency",
  }).format(amountCents / 100);
}

function formatSignedMoney(amountCents: number, currency: string) {
  const value = formatMoney(Math.abs(amountCents), currency);

  return `${amountCents >= 0 ? "+" : "-"}${value}`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatCompactMoney(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);
}
