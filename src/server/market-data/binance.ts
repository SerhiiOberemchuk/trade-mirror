export type MarketTickerSnapshot = {
  symbol: string;
  priceCents: number;
  price: number;
  changePercent24h: number;
  quoteVolume24h: number;
  provider: "binance";
  receivedAt: Date;
};

type BinanceTickerResponse = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
};

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

export function toBinanceSymbol(symbol: string) {
  return symbol.replace("/", "").toUpperCase();
}

function fromBinanceSymbol(binanceSymbol: string, fallbackSymbol: string) {
  if (fallbackSymbol.includes("/")) {
    return fallbackSymbol.toUpperCase();
  }

  return binanceSymbol.toUpperCase();
}
