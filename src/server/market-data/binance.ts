export type MarketTickerSnapshot = {
  symbol: string;
  priceCents: number;
  price: number;
  changePercent24h: number;
  quoteVolume24h: number;
  provider: "binance";
  receivedAt: Date;
};

export type MarketCandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type MarketCandle = {
  symbol: string;
  interval: MarketCandleInterval;
  openTime: Date;
  closeTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  provider: "binance";
};

type BinanceTickerResponse = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
};

type BinanceKlineResponse = [
  openTime: number,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string,
  closeTime: number,
  quoteAssetVolume: string,
  numberOfTrades: number,
  takerBuyBaseAssetVolume: string,
  takerBuyQuoteAssetVolume: string,
  unused: string,
];

const BINANCE_REST_BASE_URL = "https://api.binance.com";

export async function getBinanceTickerSnapshot(symbol: string): Promise<MarketTickerSnapshot> {
  const binanceSymbol = toBinanceSymbol(symbol);
  const response = await fetch(
    `${BINANCE_REST_BASE_URL}/api/v3/ticker/24hr?symbol=${encodeURIComponent(binanceSymbol)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Binance ticker request failed for ${symbol}.`);
  }

  const payload = await response.json() as BinanceTickerResponse;
  const price = Number(payload.lastPrice);
  const changePercent24h = Number(payload.priceChangePercent);
  const quoteVolume24h = Number(payload.quoteVolume);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Binance ticker price is invalid for ${symbol}.`);
  }

  return {
    changePercent24h: Number.isFinite(changePercent24h) ? changePercent24h : 0,
    price,
    priceCents: Math.round(price * 100),
    provider: "binance",
    quoteVolume24h: Number.isFinite(quoteVolume24h) ? quoteVolume24h : 0,
    receivedAt: new Date(),
    symbol: fromBinanceSymbol(payload.symbol, symbol),
  };
}

export async function getBinanceTickerSnapshots(symbols: readonly string[]) {
  const snapshots = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return await getBinanceTickerSnapshot(symbol);
      } catch {
        return null;
      }
    }),
  );

  return snapshots.filter((snapshot): snapshot is MarketTickerSnapshot => snapshot !== null);
}

export async function getBinanceCandles({
  interval,
  limit,
  symbol,
}: {
  interval: MarketCandleInterval;
  limit: number;
  symbol: string;
}) {
  const binanceSymbol = toBinanceSymbol(symbol);
  const response = await fetch(
    `${BINANCE_REST_BASE_URL}/api/v3/klines?symbol=${encodeURIComponent(binanceSymbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Binance candle request failed for ${symbol}.`);
  }

  const payload = await response.json() as BinanceKlineResponse[];

  return payload
    .map((row) => toMarketCandle(row, symbol, interval))
    .filter((candle): candle is MarketCandle => candle !== null);
}

export function toBinanceSymbol(symbol: string) {
  return symbol.replace("/", "").toUpperCase();
}

function fromBinanceSymbol(binanceSymbol: string, fallbackSymbol: string) {
  if (fallbackSymbol.includes("/")) {
    return fallbackSymbol.toUpperCase();
  }

  return binanceSymbol.toUpperCase();
}

function toMarketCandle(
  row: BinanceKlineResponse,
  symbol: string,
  interval: MarketCandleInterval,
) {
  const open = Number(row[1]);
  const high = Number(row[2]);
  const low = Number(row[3]);
  const close = Number(row[4]);
  const volume = Number(row[5]);

  if (
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close) ||
    !Number.isFinite(volume)
  ) {
    return null;
  }

  return {
    close,
    closeTime: new Date(row[6]),
    high,
    interval,
    low,
    open,
    openTime: new Date(row[0]),
    provider: "binance",
    symbol: symbol.toUpperCase(),
    volume,
  } satisfies MarketCandle;
}
