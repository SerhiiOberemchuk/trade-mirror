import { db } from "@/db";
import { simulatedPositionsSchema } from "@/db/schema/trading.schema";
import { getBinanceTickerSnapshot } from "@/server/market-data/binance";
import { and, eq } from "drizzle-orm";
import { closeCopiedPositions } from "./copy-automation";
import {
  closePositionAtPrice,
  type SimulatedPositionRow,
} from "./position-lifecycle";

export async function checkRiskExitsForUser({ userId }: { userId: string }) {
  const positions = await db
    .select()
    .from(simulatedPositionsSchema)
    .where(
      and(
        eq(simulatedPositionsSchema.userId, userId),
        eq(simulatedPositionsSchema.status, "open"),
      ),
    );

  for (const position of positions) {
    if (!position.stopLossPriceCents && !position.takeProfitPriceCents) {
      continue;
    }

    const ticker = await getBinanceTickerSnapshot(position.pairSymbol);

    if (!shouldCloseForRiskExit(position, ticker.priceCents)) {
      continue;
    }

    await closePositionAtPrice({
      currentPriceCents: ticker.priceCents,
      position,
      userEmail: position.userEmail,
      userName: position.userName,
    });

    if (position.source === "manual") {
      await closeCopiedPositions({
        copiedFromPositionId: position.id,
        currentPriceCents: ticker.priceCents,
      });
    }
  }
}

function shouldCloseForRiskExit(
  position: SimulatedPositionRow,
  currentPriceCents: number,
) {
  if (position.side === "long") {
    return (
      (position.stopLossPriceCents !== null &&
        currentPriceCents <= position.stopLossPriceCents) ||
      (position.takeProfitPriceCents !== null &&
        currentPriceCents >= position.takeProfitPriceCents)
    );
  }

  return (
    (position.stopLossPriceCents !== null &&
      currentPriceCents >= position.stopLossPriceCents) ||
    (position.takeProfitPriceCents !== null &&
      currentPriceCents <= position.takeProfitPriceCents)
  );
}
