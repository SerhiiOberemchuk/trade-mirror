import { db } from "@/db";
import { tradingPairsSchema } from "@/db/schema/trading-pairs.schema";
import {
  ActionToolbar,
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { asc } from "drizzle-orm";
import {
  createTradingPairAction,
  enableTradingPairAction,
  pauseTradingPairAction,
} from "./actions";

type TradingPairRow = {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: "enabled" | "paused";
  spread: string;
  leverage: string;
  volume: string;
};

const pairColumns = [
  {
    header: "Pair",
    cell: (pair) => <span className="font-semibold">{pair.symbol}</span>,
  },
  {
    header: "Assets",
    cell: (pair) => (
      <span className="text-muted">
        {pair.baseAsset} / {pair.quoteAsset}
      </span>
    ),
  },
  {
    header: "Status",
    cell: (pair) => (
      <StatusBadge tone={pair.status === "enabled" ? "success" : "warning"}>
        {pair.status}
      </StatusBadge>
    ),
  },
  {
    header: "Spread",
    cell: (pair) => <span className="font-mono text-muted">{pair.spread}</span>,
  },
  {
    header: "Leverage",
    cell: (pair) => (
      <span className="font-mono text-muted">{pair.leverage}</span>
    ),
  },
  {
    header: "Volume",
    cell: (pair) => <span className="font-mono">{pair.volume}</span>,
    align: "right",
  },
  {
    header: "Actions",
    cell: (pair) => <TradingPairActions pair={pair} />,
  },
] as const satisfies readonly DataTableColumn<TradingPairRow>[];

export default async function AdminTradingPairsPage() {
  const state = await getTradingPairRows();

  return (
    <>
      <AdminPageHeader
        description="Pair availability, spread, leverage, and simulated volume controls."
        title="Trading Pairs"
      />

      <section className="grid gap-5 xl:grid-cols-[0.55fr_1.45fr]">
        <AdminCard
          description="Add a market to the simulated terminal"
          title="Add pair"
        >
          <form action={createTradingPairFormAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Symbol</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 font-mono text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                defaultValue="BTC/USDT"
                name="symbol"
                placeholder="BTC/USDT"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Spread, bps</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                  defaultValue="2"
                  max="500"
                  min="0"
                  name="spreadBps"
                  step="1"
                  type="number"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Max leverage</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                  defaultValue="10"
                  max="100"
                  min="1"
                  name="maxLeverage"
                  step="1"
                  type="number"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Simulated volume</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                defaultValue="1250000"
                min="0"
                name="simulatedVolume"
                step="0.01"
                type="number"
              />
            </label>

            <button
              className="w-full rounded-lg bg-warning px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
              type="submit"
            >
              Add pair
            </button>
          </form>
        </AdminCard>

        <AdminCard
          description="Markets configured for the simulated terminal"
          title="Pair configuration"
        >
          {state.kind === "ready" && state.rows.length > 0 ? (
            <DataTable
              columns={pairColumns}
              getRowKey={(pair) => pair.id}
              minWidth="980px"
              rows={state.rows}
            />
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Add the first trading pair to make admin market controls available."
              title="No trading pairs"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted trading pair controls."
              title="Trading pair table is not ready"
            />
          ) : null}
        </AdminCard>
      </section>
    </>
  );
}

function TradingPairActions({ pair }: { pair: TradingPairRow }) {
  return (
    <ActionToolbar>
      {pair.status === "enabled" ? (
        <form action={pauseTradingPairFormAction}>
          <input name="pairId" type="hidden" value={pair.id} />
          <button
            className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
            type="submit"
          >
            Pause
          </button>
        </form>
      ) : (
        <form action={enableTradingPairFormAction}>
          <input name="pairId" type="hidden" value={pair.id} />
          <button
            className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
            type="submit"
          >
            Enable
          </button>
        </form>
      )}
    </ActionToolbar>
  );
}

async function createTradingPairFormAction(formData: FormData) {
  "use server";

  await createTradingPairAction(formData);
}

async function pauseTradingPairFormAction(formData: FormData) {
  "use server";

  await pauseTradingPairAction(formData);
}

async function enableTradingPairFormAction(formData: FormData) {
  "use server";

  await enableTradingPairAction(formData);
}

async function getTradingPairRows(): Promise<
  { kind: "ready"; rows: TradingPairRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(tradingPairsSchema)
      .orderBy(asc(tradingPairsSchema.symbol));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        id: row.id,
        symbol: row.symbol,
        baseAsset: row.baseAsset,
        quoteAsset: row.quoteAsset,
        status: row.status,
        spread: `${row.spreadBps} bps`,
        leverage: `${row.maxLeverage}x`,
        volume: formatMoney(row.simulatedVolumeCents, "USD"),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amountCents / 100);
}
