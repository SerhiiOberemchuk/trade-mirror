import type { ReactNode } from "react";

type Tone = "primary" | "warning" | "success" | "danger" | "muted";

const toneTextClass: Record<Tone, string> = {
  primary: "text-primary",
  warning: "text-warning",
  success: "text-success",
  danger: "text-danger",
  muted: "text-muted",
};

const badgeClass: Record<Tone, string> = {
  primary: "border-primary/35 bg-primary/10 text-cyan-200",
  warning: "border-warning/35 bg-warning/10 text-amber-200",
  success: "border-success/35 bg-success/10 text-emerald-200",
  danger: "border-danger/35 bg-danger/10 text-red-200",
  muted: "border-border bg-surface text-muted",
};

type ProductPageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ProductPageHeader({
  title,
  description,
  action,
}: ProductPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type ProductCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function ProductCard({
  title,
  description,
  children,
  action,
}: ProductCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  tone?: Tone;
};

export function MetricCard({
  label,
  value,
  change,
  tone = "primary",
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
      {change ? <p className={`mt-1 text-xs ${toneTextClass[tone]}`}>{change}</p> : null}
    </div>
  );
}

export type DataTableColumn<Row> = {
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
  align?: "left" | "right";
};

type DataTableProps<Row> = {
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row, index: number) => string;
  minWidth?: string;
  emptyLabel?: string;
};

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  minWidth = "720px",
  emptyLabel = "No records to display.",
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyLabel} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                className={`pb-3 font-medium ${column.align === "right" ? "text-right" : ""}`}
                key={column.header}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="border-b border-border/70 last:border-0" key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td
                  className={`py-3 ${column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                  key={column.header}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type StatusBadgeProps = {
  children: ReactNode;
  tone?: Tone;
};

export function StatusBadge({ children, tone = "muted" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-xs font-medium ${badgeClass[tone]}`}
    >
      {children}
    </span>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

type ActionToolbarProps = {
  children: ReactNode;
};

export function ActionToolbar({ children }: ActionToolbarProps) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

type LoadingStateProps = {
  title: string;
  description?: string;
  rows?: number;
};

export function LoadingState({
  title,
  description,
  rows = 3,
}: LoadingStateProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6" role="status">
      <ProductPageHeader
        description={description ?? "Preparing the latest simulated workspace view."}
        title={title}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="rounded-lg border border-border bg-card p-4" key={index}>
            <div className="h-3 w-24 rounded bg-border" />
            <div className="mt-4 h-7 w-32 rounded bg-border" />
            <div className="mt-3 h-3 w-20 rounded bg-border" />
          </div>
        ))}
      </section>

      <ProductCard description="Loading preview rows" title="Workspace data">
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <div
              className="grid gap-3 rounded-lg border border-border bg-background p-4 md:grid-cols-[1fr_120px_96px]"
              key={index}
            >
              <div>
                <div className="h-4 w-40 rounded bg-border" />
                <div className="mt-3 h-3 w-56 max-w-full rounded bg-border" />
              </div>
              <div className="h-4 w-24 rounded bg-border" />
              <div className="h-7 w-20 rounded bg-border" />
            </div>
          ))}
        </div>
      </ProductCard>
    </div>
  );
}

type RouteErrorStateProps = {
  title: string;
  description: string;
  digest?: string;
  onRetry: () => void;
  tone?: "primary" | "warning";
};

export function RouteErrorState({
  title,
  description,
  digest,
  onRetry,
  tone = "primary",
}: RouteErrorStateProps) {
  const buttonClass =
    tone === "warning"
      ? "bg-warning hover:bg-amber-300 focus-visible:ring-warning/30"
      : "bg-primary hover:bg-cyan-300 focus-visible:ring-primary/30";

  return (
    <section className="rounded-lg border border-danger/35 bg-danger/10 p-5" role="alert">
      <div className="max-w-2xl">
        <StatusBadge tone="danger">Render error</StatusBadge>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-red-100">{description}</p>
        {digest ? <p className="mt-3 font-mono text-xs text-muted">Digest: {digest}</p> : null}
      </div>
      <button
        className={`mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 outline-none transition duration-150 active:scale-[0.99] focus-visible:ring-2 ${buttonClass}`}
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}
