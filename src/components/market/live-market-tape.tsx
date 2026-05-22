"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { StatusBadge } from "@/components/dashboard/primitives";

type MarketTapeRow = {
  symbol: string;
  maxLeverage: number;
  change: string;
  volume: string;
};

type MarketTick = {
  symbol: string;
  price: number;
  changePercent24h: number;
  quoteVolume24h: number;
  receivedAt: string;
};

type BinanceMiniTickerPayload = {
  c?: string;
  E?: number;
  e?: string;
  o?: string;
  q?: string;
  s?: string;
};

type MarketStreamPayload = {
  receivedAt: string;
  ticks: MarketTick[];
};

type LiveMarketTapeProps = {
  rows: readonly MarketTapeRow[];
};

export function LiveMarketTape({ rows }: LiveMarketTapeProps) {
  const symbols = useMemo(() => rows.map((row) => row.symbol), [rows]);
  const [ticks, setTicks] = useState<Record<string, MarketTick>>({});
  const [status, setStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const [transport, setTransport] = useState<"binance-ws" | "sse">("binance-ws");

  useEffect(() => {
    if (symbols.length === 0) {
      return;
    }

    const streams = symbols
      .map((symbol) => `${toBinanceSymbol(symbol).toLowerCase()}@miniTicker`)
      .join("/");
    const socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    let fallbackSource: EventSource | null = null;
    let fallbackTimer: number | null = window.setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        fallbackSource = openSseFallback(symbols, setStatus, setTicks, setTransport);
      }
    }, 3_500);

    socket.addEventListener("open", () => {
      setTransport("binance-ws");
      setStatus("live");

      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      fallbackSource?.close();
      fallbackSource = null;
    });

    socket.addEventListener("message", (event) => {
      const tick = parseBinanceMiniTicker(event.data);

      if (!tick) {
        return;
      }

      setTransport("binance-ws");
      setStatus("live");
      setTicks((current) => ({
        ...current,
        [tick.symbol]: tick,
      }));
    });

    socket.addEventListener("error", () => {
      setStatus("reconnecting");
      fallbackSource ??= openSseFallback(symbols, setStatus, setTicks, setTransport);
    });

    socket.addEventListener("close", () => {
      setStatus("reconnecting");
      fallbackSource ??= openSseFallback(symbols, setStatus, setTicks, setTransport);
    });

    return () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }

      fallbackSource?.close();
      socket.close();
    };
  }, [symbols]);

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">
          Normalized market stream / {transport}
        </p>
        <StatusBadge tone={status === "live" ? "success" : "warning"}>{status}</StatusBadge>
      </div>
      {rows.map((row) => {
        const tick = ticks[row.symbol];
        const change = tick ? formatPercent(tick.changePercent24h) : row.change;
        const volume = tick ? formatCompactMoney(tick.quoteVolume24h) : row.volume;

        return (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm" key={row.symbol}>
            <div>
              <p className="font-medium">{row.symbol}</p>
              <p className="mt-1 text-xs text-muted">Max {row.maxLeverage}x / Vol {volume}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">{tick ? formatMoney(tick.price) : "waiting"}</p>
              <StatusBadge tone={change.startsWith("-") ? "danger" : "success"}>{change}</StatusBadge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function openSseFallback(
  symbols: readonly string[],
  setStatus: Dispatch<SetStateAction<"connecting" | "live" | "reconnecting">>,
  setTicks: Dispatch<SetStateAction<Record<string, MarketTick>>>,
  setTransport: Dispatch<SetStateAction<"binance-ws" | "sse">>,
) {
  const params = new URLSearchParams({
    interval: "5000",
    symbols: symbols.join(","),
  });
  const source = new EventSource(`/api/market/stream?${params.toString()}`);

  setTransport("sse");
  source.addEventListener("open", () => setStatus("live"));
  source.addEventListener("error", () => setStatus("reconnecting"));
  source.addEventListener("tick", (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as MarketStreamPayload;

    setStatus("live");
    setTicks((current) => {
      const next = { ...current };

      for (const tick of payload.ticks) {
        next[tick.symbol] = tick;
      }

      return next;
    });
  });

  return source;
}

function parseBinanceMiniTicker(rawData: string): MarketTick | null {
  try {
    const payload = JSON.parse(rawData) as { data?: BinanceMiniTickerPayload };
    const data = payload.data;
    const symbol = data?.s ? fromBinanceSymbol(data.s) : "";
    const price = Number(data?.c);
    const open = Number(data?.o);
    const quoteVolume24h = Number(data?.q);

    if (!symbol || !Number.isFinite(price) || price <= 0) {
      return null;
    }

    const changePercent24h =
      Number.isFinite(open) && open > 0 ? ((price - open) / open) * 100 : 0;

    return {
      changePercent24h,
      price,
      quoteVolume24h: Number.isFinite(quoteVolume24h) ? quoteVolume24h : 0,
      receivedAt: new Date(data?.E ?? Date.now()).toISOString(),
      symbol,
    };
  } catch {
    return null;
  }
}

function toBinanceSymbol(symbol: string) {
  return symbol.replace("/", "").toUpperCase();
}

function fromBinanceSymbol(symbol: string) {
  if (symbol.endsWith("USDT")) {
    return `${symbol.slice(0, -4)}/USDT`;
  }

  return symbol.toUpperCase();
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(value);
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
