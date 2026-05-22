import { db } from "@/db";
import { tradingPairsSchema } from "@/db/schema/trading-pairs.schema";
import { getBinanceTickerSnapshots } from "@/server/market-data/binance";
import { getCoinMetadataForPairs } from "@/server/market-data/coingecko";
import { asc, eq } from "drizzle-orm";

export type PublicMarketRow = {
  pair: string;
  price: string;
  change: string;
  logoUrl: string | null;
  marketCap: string;
  name: string;
  volume: string;
  spread: string;
};

export type PublicMarketStats = {
  activePairs: string;
  averageSpread: string;
  volume24h: string;
};

export type PublicMarketsState = {
  rows: PublicMarketRow[];
  stats: PublicMarketStats;
};

export async function getPublicMarketsState(): Promise<PublicMarketsState> {
  try {
    const pairRows = await db
      .select()
      .from(tradingPairsSchema)
      .where(eq(tradingPairsSchema.status, "enabled"))
      .orderBy(asc(tradingPairsSchema.symbol));
    const tickerRows = await getBinanceTickerSnapshots(pairRows.map((pair) => pair.symbol));
    const metadataBySymbol = await getCoinMetadataForPairs(pairRows.map((pair) => pair.symbol));
    const tickerBySymbol = new Map(
      tickerRows.map((ticker) => [ticker.symbol, ticker]),
    );
    const volume24h = tickerRows.reduce((total, ticker) => total + ticker.quoteVolume24h, 0);
    const averageSpreadBps =
      pairRows.length > 0
        ? pairRows.reduce((total, pair) => total + pair.spreadBps, 0) / pairRows.length
        : 0;

    return {
      rows: pairRows.map((pair) => {
        const ticker = tickerBySymbol.get(pair.symbol);
        const metadata = metadataBySymbol.get(pair.symbol);

        return {
          change: ticker ? formatPercent(ticker.changePercent24h) : "n/a",
          logoUrl: metadata?.imageUrl ?? null,
          marketCap: metadata?.marketCapUsd ? formatCompactMoney(metadata.marketCapUsd) : "n/a",
          name: metadata?.name ?? pair.symbol,
          pair: pair.symbol,
          price: ticker ? formatMoneyFromNumber(ticker.price) : "n/a",
          spread: formatSpread(pair.spreadBps),
          volume: ticker ? formatCompactMoney(ticker.quoteVolume24h) : "n/a",
        };
      }),
      stats: {
        activePairs: String(pairRows.length),
        averageSpread: formatSpread(Math.round(averageSpreadBps)),
        volume24h: formatCompactMoney(volume24h),
      },
    };
  } catch {
    return {
      rows: [],
      stats: {
        activePairs: "0",
        averageSpread: "n/a",
        volume24h: "n/a",
      },
    };
  }
}

function formatMoneyFromNumber(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: value >= 10 ? 2 : 4,
    style: "currency",
  }).format(value);
}

function formatCompactMoney(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatSpread(spreadBps: number) {
  return `${(spreadBps / 100).toFixed(2)}%`;
}
