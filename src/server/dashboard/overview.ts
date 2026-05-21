import { db } from "@/db";
import { copySettingsSchema } from "@/db/schema/copy-trading.schema";
import { supportTicketsSchema } from "@/db/schema/support.schema";
import { simulatedPositionsSchema } from "@/db/schema/trading.schema";
import {
  depositRequestsSchema,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { getBinanceTickerSnapshots } from "@/server/market-data/binance";
import { calculatePnlCents } from "@/server/trading/pnl";
import { desc, eq } from "drizzle-orm";

export type DashboardPosition = typeof simulatedPositionsSchema.$inferSelect & {
  currentPriceCents?: number;
  unrealizedPnlCents: number;
};

export type DashboardCopySetting = typeof copySettingsSchema.$inferSelect;
export type DashboardSupportTicket = typeof supportTicketsSchema.$inferSelect;

export type DashboardOverviewState = {
  approvedBonusCents: number;
  approvedDepositsCount: number;
  copyAllocationCents: number;
  copySettings: DashboardCopySetting[];
  demoBalanceCents: number;
  openExposureCents: number;
  openPositions: DashboardPosition[];
  pendingDepositsCents: number;
  pendingWithdrawalsCents: number;
  supportTickets: DashboardSupportTicket[];
  unrealizedPnlCents: number;
};

export async function getDashboardOverviewState(
  userId: string,
): Promise<DashboardOverviewState> {
  const [
    deposits,
    withdrawals,
    positions,
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

  const openPositions = positions.filter((position) => position.status === "open");
  const positionsWithPnl = await attachLivePnl(openPositions.slice(0, 5));
  const approvedDeposits = deposits.filter((deposit) => deposit.status === "approved");
  const approvedWithdrawals = withdrawals.filter(
    (withdrawal) => withdrawal.status === "approved",
  );
  const approvedDepositsCents = sumCents(approvedDeposits, (deposit) => deposit.amountCents);
  const approvedWithdrawalsCents = sumCents(
    approvedWithdrawals,
    (withdrawal) => withdrawal.amountCents,
  );
  const realizedPnlCents = sumCents(
    positions.filter((position) => position.status === "closed"),
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
    openExposureCents: sumCents(openPositions, (position) => position.notionalCents),
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

async function attachLivePnl(
  positions: (typeof simulatedPositionsSchema.$inferSelect)[],
): Promise<DashboardPosition[]> {
  const tickerSnapshots = await getBinanceTickerSnapshots(
    Array.from(new Set(positions.map((position) => position.pairSymbol))),
  );
  const priceBySymbol = new Map(
    tickerSnapshots.map((snapshot) => [snapshot.symbol, snapshot.priceCents]),
  );

  return positions.map((position) => {
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
}

function sumCents<Row>(rows: readonly Row[], selector: (row: Row) => number) {
  return rows.reduce((sum, row) => sum + selector(row), 0);
}
