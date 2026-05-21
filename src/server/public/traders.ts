import { db } from "@/db";
import { traderProfilesSchema } from "@/db/schema/copy-trading.schema";
import { desc, eq } from "drizzle-orm";

export type PublicTraderRow = {
  id: string;
  name: string;
  strategy: string;
  pnl: string;
  winRate: string;
  risk: "low" | "medium" | "high";
  followers: string;
  drawdown: string;
};

export async function getPublicTraderRows(): Promise<PublicTraderRow[]> {
  try {
    const rows = await db
      .select()
      .from(traderProfilesSchema)
      .where(eq(traderProfilesSchema.status, "published"))
      .orderBy(desc(traderProfilesSchema.monthlyPnlBps));

    return rows.map((row) => ({
      drawdown: formatBps(row.maxDrawdownBps),
      followers: new Intl.NumberFormat("en", { notation: "compact" }).format(
        row.followersCount,
      ),
      id: row.id,
      name: row.displayName,
      pnl: formatSignedBps(row.monthlyPnlBps),
      risk: row.riskLevel,
      strategy: row.strategy,
      winRate: formatBps(row.winRateBps),
    }));
  } catch {
    return [];
  }
}

function formatBps(value: number) {
  return `${(value / 100).toFixed(1)}%`;
}

function formatSignedBps(value: number) {
  return `${value >= 0 ? "+" : ""}${formatBps(value)}`;
}
