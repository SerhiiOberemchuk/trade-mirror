"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (symbols.length === 0) {
      return;
    }

    const params = new URLSearchParams({
      interval: "5000",
      symbols: symbols.join(","),
    });
    const source = new EventSource(`/api/market/stream?${params.toString()}`);

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

    return () => source.close();
  }, [symbols]);

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">Normalized market stream</p>
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
