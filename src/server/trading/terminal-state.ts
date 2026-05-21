import { db } from "@/db";
import { simulatedPositionsSchema } from "@/db/schema/trading.schema";
import { tradingPairsSchema } from "@/db/schema/trading-pairs.schema";
import {
  getBinanceCandles,
  getBinanceTickerSnapshot,
  type MarketCandle,
} from "@/server/market-data/binance";
import { and, asc, desc, eq } from "drizzle-orm";
import { calculatePnlCents } from "./pnl";

export type TerminalPairRow = {
  symbol: string;
  maxLeverage: number;
  change: string;
  volume: string;
};

export type TerminalOpenPositionRow = {
  id: string;
  pair: string;
  side: "long" | "short";
  size: string;
  leverage: string;
  entry: string;
  current: string;
  pnl: string;
  pnlCents: number;
  riskExits: string;
};

export type TerminalChart = {
  candles: MarketCandle[];
  symbol: string;
};

export type TerminalState =
  | {
      chart: TerminalChart | null;
      kind: "ready";
      pairs: TerminalPairRow[];
      positions: TerminalOpenPositionRow[];
    }
  | { kind: "setup-required" };

export async function getTerminalState(userId: string): Promise<TerminalState> {
  try {
    const [pairRows, positionRows] = await Promise.all([
      db
        .select()
        .from(tradingPairsSchema)
        .where(eq(tradingPairsSchema.status, "enabled"))
        .orderBy(asc(tradingPairsSchema.symbol)),
      db
        .select()
        .from(simulatedPositionsSchema)
        .where(
          and(
            eq(simulatedPositionsSchema.userId, userId),
            eq(simulatedPositionsSchema.status, "open"),
          ),
        )
        .orderBy(desc(simulatedPositionsSchema.openedAt)),
    ]);

    const symbols = Array.from(
      new Set([
        ...pairRows.map((pair) => pair.symbol),
        ...positionRows.map((position) => position.pairSymbol),
      ]),
    );
    const tickerMap = await getTickerMap(symbols);
    const chartSymbol = pairRows[0]?.symbol ?? null;
    const chart = chartSymbol
      ? {
          candles: await getCandles(chartSymbol),
          symbol: chartSymbol,
        }
      : null;

    return {
      chart,
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
          current: ticker ? formatMoney(currentPriceCents) : "n/a",
          entry: formatMoney(position.entryPriceCents),
          id: position.id,
          leverage: `${position.leverage}x`,
          pair: position.pairSymbol,
          pnl: formatSignedMoney(pnlCents),
          pnlCents,
          riskExits: formatRiskExits(
            position.stopLossPriceCents,
            position.takeProfitPriceCents,
          ),
          side: position.side,
          size: formatMoney(position.notionalCents),
        };
      }),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

async function getCandles(symbol: string) {
  try {
    return await getBinanceCandles({
      interval: "15m",
      limit: 72,
      symbol,
    });
  } catch {
    return [];
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

  return new Map(
    entries.filter(
      (entry): entry is readonly [string, NonNullable<(typeof entry)[1]>] =>
        entry[1] !== null,
    ),
  );
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}

function formatSignedMoney(amountCents: number) {
  const value = formatMoney(Math.abs(amountCents));

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

function formatRiskExits(
  stopLossPriceCents: number | null,
  takeProfitPriceCents: number | null,
) {
  const stopLoss = stopLossPriceCents ? formatMoney(stopLossPriceCents) : "SL n/a";
  const takeProfit = takeProfitPriceCents
    ? formatMoney(takeProfitPriceCents)
    : "TP n/a";

  return `${stopLoss} / ${takeProfit}`;
}
