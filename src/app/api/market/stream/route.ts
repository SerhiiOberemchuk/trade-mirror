import { getBinanceTickerSnapshots } from "@/server/market-data/binance";
import type { NextRequest } from "next/server";

const DEFAULT_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT"] as const;
const MIN_INTERVAL_MS = 2_000;
const MAX_INTERVAL_MS = 15_000;
const DEFAULT_INTERVAL_MS = 5_000;
const MAX_SYMBOLS = 12;

export async function GET(request: NextRequest) {
  const symbols = parseSymbols(request.nextUrl.searchParams.get("symbols"));
  const intervalMs = parseInterval(request.nextUrl.searchParams.get("interval"));
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let isClosed = false;

      request.signal.addEventListener("abort", () => {
        isClosed = true;
        controller.close();
      });

      while (!isClosed) {
        const ticks = await getBinanceTickerSnapshots(symbols);
        const payload = JSON.stringify({
          receivedAt: new Date().toISOString(),
          ticks: ticks.map((tick) => ({
            changePercent24h: tick.changePercent24h,
            price: tick.price,
            priceCents: tick.priceCents,
            provider: tick.provider,
            quoteVolume24h: tick.quoteVolume24h,
            receivedAt: tick.receivedAt.toISOString(),
            symbol: tick.symbol,
          })),
        });

        controller.enqueue(encoder.encode(`event: tick\ndata: ${payload}\n\n`));
        await wait(intervalMs);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}

function parseSymbols(value: string | null) {
  if (!value) {
    return [...DEFAULT_SYMBOLS];
  }

  const symbols = value
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z0-9]{2,12}\/[A-Z0-9]{2,12}$/.test(symbol))
    .slice(0, MAX_SYMBOLS);

  return symbols.length > 0 ? symbols : [...DEFAULT_SYMBOLS];
}

function parseInterval(value: string | null) {
  const interval = Number(value);

  if (!Number.isFinite(interval)) {
    return DEFAULT_INTERVAL_MS;
  }

  return Math.min(Math.max(Math.round(interval), MIN_INTERVAL_MS), MAX_INTERVAL_MS);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
