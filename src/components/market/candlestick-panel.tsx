"use client";

import type { MarketCandle } from "@/server/market-data/binance";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef } from "react";

type CandlestickPanelProps = {
  candles: readonly MarketCandle[];
  symbol: string;
};

export function CandlestickPanel({ candles, symbol }: CandlestickPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chartData = useMemo(() => toChartData(candles), [candles]);
  const lastCandle = candles[candles.length - 1];

  useEffect(() => {
    if (!containerRef.current || chartData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const chart = createChart(container, {
      autoSize: true,
      crosshair: {
        mode: 1,
      },
      grid: {
        horzLines: { color: "rgba(31, 41, 55, 0.65)" },
        vertLines: { color: "rgba(31, 41, 55, 0.45)" },
      },
      layout: {
        background: { color: "#050816", type: ColorType.Solid },
        fontFamily: "Arial, sans-serif",
        textColor: "#9CA3AF",
      },
      localization: {
        priceFormatter: (price: number) => formatMoney(price),
      },
      rightPriceScale: {
        borderColor: "#1F2937",
      },
      timeScale: {
        borderColor: "#1F2937",
        timeVisible: true,
      },
    });
    const series = chart.addSeries(CandlestickSeries, {
      borderDownColor: "#EF4444",
      borderUpColor: "#10B981",
      downColor: "#EF4444",
      wickDownColor: "#EF4444",
      wickUpColor: "#10B981",
      upColor: "#10B981",
    });

    series.setData(chartData);
    chart.timeScale().fitContent();
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartData]);

  useEffect(() => {
    seriesRef.current?.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [chartData]);

  if (candles.length === 0 || chartData.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-background text-sm text-muted">
        Candle data is unavailable for {symbol}.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{symbol}</p>
          <p className="mt-1 text-xs text-muted">
            TradingView Lightweight Charts / Binance REST candles / 15m
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm">{formatMoney(lastCandle.close)}</p>
          <p className="mt-1 text-xs text-muted">
            H {formatMoney(lastCandle.high)} / L {formatMoney(lastCandle.low)}
          </p>
        </div>
      </div>

      <div
        aria-label={`${symbol} candlestick chart`}
        className="h-[320px] w-full"
        ref={containerRef}
        role="img"
      />

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{formatDate(candles[0].openTime)}</span>
        <span>OHLCV normalized behind market-data adapter</span>
        <span>{formatDate(lastCandle.closeTime)}</span>
      </div>
    </div>
  );
}

function toChartData(candles: readonly MarketCandle[]): CandlestickData[] {
  return candles.map((candle) => ({
    close: candle.close,
    high: candle.high,
    low: candle.low,
    open: candle.open,
    time: toUnixTimestamp(candle.openTime),
  }));
}

function toUnixTimestamp(value: Date): UTCTimestamp {
  return Math.floor(new Date(value).getTime() / 1000) as UTCTimestamp;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}
