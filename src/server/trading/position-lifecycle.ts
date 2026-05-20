import { db } from "@/db";
import {
  simulatedPositionsSchema,
  simulatedTradesSchema,
} from "@/db/schema/trading.schema";
import { eq } from "drizzle-orm";
import { calculatePnlCents } from "./pnl";

export type SimulatedPositionRow = typeof simulatedPositionsSchema.$inferSelect;

export async function closePositionAtPrice({
  currentPriceCents,
  position,
  userEmail,
  userName,
}: {
  currentPriceCents: number;
  position: SimulatedPositionRow;
  userEmail: string;
  userName: string;
}) {
  const pnlCents = calculatePnlCents({
    currentPriceCents,
    entryPriceCents: position.entryPriceCents,
    notionalCents: position.notionalCents,
    side: position.side,
  });

  await db
    .update(simulatedPositionsSchema)
    .set({
      closedAt: new Date(),
      closedPriceCents: currentPriceCents,
      realizedPnlCents: pnlCents,
      status: "closed",
    })
    .where(eq(simulatedPositionsSchema.id, position.id));

  await db.insert(simulatedTradesSchema).values({
    action: "close",
    notionalCents: position.notionalCents,
    pairSymbol: position.pairSymbol,
    pnlCents,
    positionId: position.id,
    priceCents: currentPriceCents,
    side: position.side,
    source: position.source,
    userEmail,
    userId: position.userId,
    userName,
  });
}
