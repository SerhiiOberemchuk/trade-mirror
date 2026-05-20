import type { MarketCandle } from "@/server/market-data/binance";

type CandlestickPanelProps = {
  candles: readonly MarketCandle[];
  symbol: string;
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 280;
const CHART_PADDING = 18;
const MIN_CANDLE_BODY_HEIGHT = 2;

export function CandlestickPanel({ candles, symbol }: CandlestickPanelProps) {
  if (candles.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-background text-sm text-muted">
        Candle data is unavailable for {symbol}.
      </div>
    );
  }

  const priceRange = getPriceRange(candles);
  const lastCandle = candles[candles.length - 1];
  const candleSlotWidth = CHART_WIDTH / candles.length;
  const candleBodyWidth = Math.max(Math.min(candleSlotWidth * 0.56, 8), 3);

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{symbol}</p>
          <p className="mt-1 text-xs text-muted">Real Binance candles / 15m</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm">{formatMoney(lastCandle.close)}</p>
          <p className="mt-1 text-xs text-muted">
            H {formatMoney(lastCandle.high)} / L {formatMoney(lastCandle.low)}
          </p>
        </div>
      </div>

      <svg
        aria-label={`${symbol} candlestick chart`}
        className="h-auto w-full overflow-visible"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <rect
          className="fill-background"
          height={CHART_HEIGHT}
          rx="10"
          width={CHART_WIDTH}
          x="0"
          y="0"
        />
        {getGridLines(priceRange).map((line) => (
          <g key={line.value}>
            <line
              className="stroke-border"
              strokeDasharray="4 6"
              strokeWidth="1"
              x1="0"
              x2={CHART_WIDTH}
              y1={line.y}
              y2={line.y}
            />
            <text
              className="fill-muted text-[10px]"
              textAnchor="end"
              x={CHART_WIDTH - 6}
              y={line.y - 4}
            >
              {formatCompactPrice(line.value)}
            </text>
          </g>
        ))}
        {candles.map((candle, index) => {
          const centerX = index * candleSlotWidth + candleSlotWidth / 2;
          const highY = toChartY(candle.high, priceRange);
          const lowY = toChartY(candle.low, priceRange);
          const openY = toChartY(candle.open, priceRange);
          const closeY = toChartY(candle.close, priceRange);
          const bodyY = Math.min(openY, closeY);
          const bodyHeight = Math.max(
            Math.abs(closeY - openY),
            MIN_CANDLE_BODY_HEIGHT,
          );
          const isUp = candle.close >= candle.open;

          return (
            <g key={`${candle.openTime.toISOString()}-${index}`}>
              <line
                className={isUp ? "stroke-success" : "stroke-danger"}
                strokeLinecap="round"
                strokeWidth="1.5"
                x1={centerX}
                x2={centerX}
                y1={highY}
                y2={lowY}
              />
              <rect
                className={isUp ? "fill-success" : "fill-danger"}
                height={bodyHeight}
                rx="1"
                width={candleBodyWidth}
                x={centerX - candleBodyWidth / 2}
                y={bodyY}
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{formatDate(candles[0].openTime)}</span>
        <span>OHLCV from Binance REST</span>
        <span>{formatDate(lastCandle.closeTime)}</span>
      </div>
    </div>
  );
}

function getPriceRange(candles: readonly MarketCandle[]) {
  const high = Math.max(...candles.map((candle) => candle.high));
  const low = Math.min(...candles.map((candle) => candle.low));
  const padding = Math.max((high - low) * 0.08, high * 0.001);

  return {
    high: high + padding,
    low: low - padding,
  };
}

function toChartY(
  price: number,
  range: {
    high: number;
    low: number;
  },
) {
  const drawableHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const ratio = (range.high - price) / (range.high - range.low);

  return CHART_PADDING + ratio * drawableHeight;
}

function getGridLines(range: {
  high: number;
  low: number;
}) {
  return [0.2, 0.5, 0.8].map((ratio) => {
    const value = range.high - (range.high - range.low) * ratio;

    return {
      value,
      y: toChartY(value, range),
    };
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function formatCompactPrice(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
    notation: value >= 10_000 ? "compact" : "standard",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(value);
}
