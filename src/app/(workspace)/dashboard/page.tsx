import { db } from "@/db";
import { copySettingsSchema } from "@/db/schema/copy-trading.schema";
import { supportTicketsSchema } from "@/db/schema/support.schema";
import { simulatedPositionsSchema } from "@/db/schema/trading.schema";
import {
  depositRequestsSchema,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
  StatTile,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { getBinanceTickerSnapshots } from "@/server/market-data/binance";
import { calculatePnlCents } from "@/server/trading/pnl";
import { desc, eq } from "drizzle-orm";
import type { Route } from "next";
import Link from "next/link";

type SimulatedPosition = typeof simulatedPositionsSchema.$inferSelect;
type CopySetting = typeof copySettingsSchema.$inferSelect;
type SupportTicket = typeof supportTicketsSchema.$inferSelect;

export default async function DashboardPage() {
  const session = await requireSession();
  const state = await getDashboardState(session.user.id);

  return (
    <>
      <DashboardPageHeader
        description="Live workspace summary for simulated wallet exposure, copied trader activity, and support status."
        title="Overview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          change={`${state.approvedDepositsCount} approved deposits`}
          label="Demo balance"
          tone="success"
          value={formatMoney(state.demoBalanceCents)}
        />
        <StatTile
          change={`${state.openPositions.length} active positions`}
          label="Open exposure"
          value={formatMoney(state.openExposureCents)}
        />
        <StatTile
          change="From open positions with live prices"
          label="Unrealized PnL"
          tone={state.unrealizedPnlCents >= 0 ? "success" : "danger"}
          value={formatSignedMoney(state.unrealizedPnlCents)}
        />
        <StatTile
          change={`${state.copySettings.length} active copy settings`}
          label="Copy allocation"
          value={formatMoney(state.copyAllocationCents)}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard description="Current simulated exposure" title="Open positions">
          {state.openPositions.length > 0 ? (
            <div className="space-y-3">
              {state.openPositions.map((position) => (
                <PositionRow key={position.id} position={position} />
              ))}
            </div>
          ) : (
            <EmptyState
              action={<WorkspaceLink href="/terminal">Open terminal</WorkspaceLink>}
              description="Open a simulated position from the terminal to see live exposure here."
              title="No open positions."
            />
          )}
        </DashboardCard>

        <DashboardCard description="Provider allocations" title="Copy trading">
          {state.copySettings.length > 0 ? (
            <div className="space-y-3">
              {state.copySettings.map((setting) => (
                <CopySettingRow key={setting.id} setting={setting} />
              ))}
            </div>
          ) : (
            <EmptyState
              action={<WorkspaceLink href="/trader-marketplace">Browse traders</WorkspaceLink>}
              description="Follow a published trader profile to start simulated copy trading."
              title="No copy settings."
            />
          )}
        </DashboardCard>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardCard description="Latest simulated funding states" title="Wallet activity">
          <div className="space-y-3">
            <WalletMetric
              label="Pending deposits"
              value={formatMoney(state.pendingDepositsCents)}
            />
            <WalletMetric
              label="Pending withdrawals"
              value={formatMoney(state.pendingWithdrawalsCents)}
            />
            <WalletMetric
              label="Approved bonuses"
              value={formatMoney(state.approvedBonusCents)}
            />
          </div>
        </DashboardCard>

        <DashboardCard description="Latest user support states" title="Support queue">
          {state.supportTickets.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {state.supportTickets.map((ticket) => (
                <div className="rounded-lg border border-border bg-background p-4" key={ticket.id}>
                  <p className="line-clamp-2 font-medium">{ticket.subject}</p>
                  <p className="mt-2 text-sm text-muted">
                    {formatPriority(ticket.priority)} priority / {formatRelativeDate(ticket.updatedAt)}
                  </p>
                  <div className="mt-3">
                    <StatusBadge tone={getSupportStatusTone(ticket.status)}>
                      {formatStatus(ticket.status)}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              action={<WorkspaceLink href="/support">Create ticket</WorkspaceLink>}
              description="Support tickets you create will appear here with their current state."
              title="No support tickets."
            />
          )}
        </DashboardCard>
      </section>
    </>
  );
}

async function getDashboardState(userId: string) {
  const [
    deposits,
    withdrawals,
    openPositions,
    copySettings,
    supportTickets,
  ] = await Promise.all([
    db
      .select()
      .from(depositRequestsSchema)
      .where(eq(depositRequestsSchema.userId, userId))
      .orderBy(desc(depositRequestsSchema.requestedAt)),
    db
      .select()
      .from(withdrawalRequestsSchema)
      .where(eq(withdrawalRequestsSchema.userId, userId))
      .orderBy(desc(withdrawalRequestsSchema.requestedAt)),
    db
      .select()
      .from(simulatedPositionsSchema)
      .where(eq(simulatedPositionsSchema.userId, userId))
      .orderBy(desc(simulatedPositionsSchema.openedAt)),
    db
      .select()
      .from(copySettingsSchema)
      .where(eq(copySettingsSchema.followerUserId, userId))
      .orderBy(desc(copySettingsSchema.updatedAt)),
    db
      .select()
      .from(supportTicketsSchema)
      .where(eq(supportTicketsSchema.userId, userId))
      .orderBy(desc(supportTicketsSchema.updatedAt))
      .limit(3),
  ]);

  const openActivePositions = openPositions.filter((position) => position.status === "open");
  const tickerSnapshots = await getBinanceTickerSnapshots(
    Array.from(new Set(openActivePositions.map((position) => position.pairSymbol))),
  );
  const priceBySymbol = new Map(
    tickerSnapshots.map((snapshot) => [snapshot.symbol, snapshot.priceCents]),
  );
  const positionsWithPnl = openActivePositions.slice(0, 5).map((position) => {
    const currentPriceCents = priceBySymbol.get(position.pairSymbol);
    const unrealizedPnlCents = currentPriceCents
      ? calculatePnlCents({
        currentPriceCents,
        entryPriceCents: position.entryPriceCents,
        notionalCents: position.notionalCents,
        side: position.side,
      })
      : 0;

    return {
      ...position,
      currentPriceCents,
      unrealizedPnlCents,
    };
  });

  const approvedDeposits = deposits.filter((deposit) => deposit.status === "approved");
  const approvedWithdrawals = withdrawals.filter((withdrawal) => withdrawal.status === "approved");
  const approvedDepositsCents = sumCents(approvedDeposits, (deposit) => deposit.amountCents);
  const approvedWithdrawalsCents = sumCents(approvedWithdrawals, (withdrawal) => withdrawal.amountCents);
  const realizedPnlCents = sumCents(
    openPositions.filter((position) => position.status === "closed"),
    (position) => position.realizedPnlCents ?? 0,
  );

  return {
    approvedBonusCents: sumCents(
      approvedDeposits.filter((deposit) => deposit.method.startsWith("Bonus code")),
      (deposit) => deposit.amountCents,
    ),
    approvedDepositsCount: approvedDeposits.length,
    copyAllocationCents: sumCents(
      copySettings.filter((setting) => setting.status === "active"),
      (setting) => setting.allocationCents,
    ),
    copySettings: copySettings.slice(0, 5),
    demoBalanceCents: approvedDepositsCents - approvedWithdrawalsCents + realizedPnlCents,
    openExposureCents: sumCents(openActivePositions, (position) => position.notionalCents),
    openPositions: positionsWithPnl,
    pendingDepositsCents: sumCents(
      deposits.filter((deposit) => deposit.status === "pending"),
      (deposit) => deposit.amountCents,
    ),
    pendingWithdrawalsCents: sumCents(
      withdrawals.filter((withdrawal) => withdrawal.status === "pending"),
      (withdrawal) => withdrawal.amountCents,
    ),
    supportTickets,
    unrealizedPnlCents: sumCents(
      positionsWithPnl,
      (position) => position.unrealizedPnlCents,
    ),
  };
}

function PositionRow({
  position,
}: {
  position: SimulatedPosition & {
    currentPriceCents?: number;
    unrealizedPnlCents: number;
  };
}) {
  const hasLivePrice = typeof position.currentPriceCents === "number";

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div>
        <p className="font-medium">{position.pairSymbol}</p>
        <p className="mt-1 text-sm text-muted">
          {formatStatus(position.side)} / {formatMoney(position.notionalCents)} / Entry{" "}
          {formatMoney(position.entryPriceCents)}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`font-mono text-sm ${
            position.unrealizedPnlCents >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {formatSignedMoney(position.unrealizedPnlCents)}
        </p>
        <p className="mt-1 text-xs text-muted">
          {hasLivePrice ? formatMoney(position.currentPriceCents ?? 0) : "Price unavailable"}
        </p>
      </div>
    </div>
  );
}

function CopySettingRow({ setting }: { setting: CopySetting }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div>
        <p className="font-medium">{setting.traderName}</p>
        <p className="mt-1 text-sm text-muted">
          {formatBps(setting.copyRatioBps)} copy / {formatMoney(setting.allocationCents)}
        </p>
      </div>
      <StatusBadge tone={setting.status === "active" ? "success" : "warning"}>
        {formatStatus(setting.status)}
      </StatusBadge>
    </div>
  );
}

function WalletMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function WorkspaceLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link
      className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 outline-none transition duration-150 hover:bg-cyan-300 focus-visible:ring-2 focus-visible:ring-primary/30"
      href={href}
    >
      {children}
    </Link>
  );
}

function sumCents<Row>(rows: readonly Row[], selector: (row: Row) => number) {
  return rows.reduce((sum, row) => sum + selector(row), 0);
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(cents / 100);
}

function formatSignedMoney(cents: number) {
  const formatted = formatMoney(Math.abs(cents));
  return `${cents >= 0 ? "+" : "-"}${formatted}`;
}

function formatBps(value: number) {
  return `${(value / 100).toFixed(0)}%`;
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPriority(priority: SupportTicket["priority"]) {
  return formatStatus(priority);
}

function formatRelativeDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getSupportStatusTone(status: SupportTicket["status"]) {
  if (status === "open") {
    return "warning";
  }

  if (status === "answered") {
    return "primary";
  }

  return "muted";
}
