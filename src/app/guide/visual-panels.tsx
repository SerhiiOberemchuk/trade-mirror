export function PlatformMap() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="grid gap-4">
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-xs uppercase tracking-wide text-primary">Market layer</p>
          <p className="mt-2 text-sm font-semibold">Real crypto prices and candles</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {["Terminal", "Copy engine", "Wallet"].map((item) => (
            <div
              className="rounded-lg border border-border bg-background p-4 text-center"
              key={item}
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-primary" />
              <p className="text-sm font-semibold">{item}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <p className="text-xs uppercase tracking-wide text-warning">Simulation layer</p>
          <p className="mt-2 text-sm font-semibold">
            Demo balances, trades, PnL, and approvals
          </p>
        </div>
      </div>
    </div>
  );
}

export function SystemDiagram() {
  return (
    <div className="space-y-4 p-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <DiagramNode label="Binance market stream" tone="primary" />
        <DiagramLine />
        <DiagramNode label="Normalized market adapter" tone="primary" />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <DiagramNode label="User demo actions" tone="warning" />
        <DiagramLine />
        <DiagramNode label="Simulated trading records" tone="warning" />
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">Dashboard output</p>
        <div className="mt-4 grid gap-2">
          {["Live price context", "Calculated simulated PnL", "Admin review state"].map((item) => (
            <div
              className="h-8 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagramNode({ label, tone }: { label: string; tone: "primary" | "warning" }) {
  const toneClass =
    tone === "primary"
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div className={`rounded-lg border px-4 py-3 text-center text-xs font-semibold ${toneClass}`}>
      {label}
    </div>
  );
}

function DiagramLine() {
  return <div className="h-px w-8 bg-border" aria-hidden="true" />;
}
