"use server";

import { db } from "@/db";
import {
  simulatedPositionsSchema,
  simulatedTradesSchema,
} from "@/db/schema/trading.schema";
import { tradingPairsSchema } from "@/db/schema/trading-pairs.schema";
import { requireSession } from "@/server/auth/session";
import { getBinanceTickerSnapshot } from "@/server/market-data/binance";
import {
  createCopiedPositionsForFollowers,
  closeCopiedPositions,
} from "@/server/trading/copy-automation";
import { closePositionAtPrice } from "@/server/trading/position-lifecycle";
import { checkRiskExitsForUser } from "@/server/trading/risk-exits";
import { revalidateTradingPaths } from "@/server/trading/revalidation";
import {
  parseOrderInput,
  parsePositionId,
  validateRiskThresholds,
} from "@/server/trading/validation";
import { and, eq } from "drizzle-orm";

export async function createSimulatedOrderAction(formData: FormData) {
  const session = await requireSession();
  const order = parseOrderInput(formData);

  const [pair] = await db
    .select()
    .from(tradingPairsSchema)
    .where(
      and(
        eq(tradingPairsSchema.symbol, order.pairSymbol),
        eq(tradingPairsSchema.status, "enabled"),
      ),
    )
    .limit(1);

  if (!pair) {
    throw new Error("Trading pair is not enabled.");
  }

  if (order.leverage > pair.maxLeverage) {
    throw new Error(
      `Leverage cannot exceed ${pair.maxLeverage}x for ${pair.symbol}.`,
    );
  }

  const ticker = await getBinanceTickerSnapshot(pair.symbol);
  validateRiskThresholds({
    currentPriceCents: ticker.priceCents,
    side: order.side,
    stopLossPriceCents: order.stopLossPriceCents,
    takeProfitPriceCents: order.takeProfitPriceCents,
  });

  const [position] = await db
    .insert(simulatedPositionsSchema)
    .values({
      entryPriceCents: ticker.priceCents,
      leverage: order.leverage,
      notionalCents: order.notionalCents,
      pairSymbol: pair.symbol,
      side: order.side,
      source: "manual",
      stopLossPriceCents: order.stopLossPriceCents,
      takeProfitPriceCents: order.takeProfitPriceCents,
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
    })
    .returning({ id: simulatedPositionsSchema.id });

  await db.insert(simulatedTradesSchema).values({
    action: "open",
    notionalCents: order.notionalCents,
    pairSymbol: pair.symbol,
    positionId: position.id,
    priceCents: ticker.priceCents,
    side: order.side,
    source: "manual",
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  await createCopiedPositionsForFollowers({
    entryPriceCents: ticker.priceCents,
    leverage: order.leverage,
    pairSymbol: pair.symbol,
    providerPositionId: position.id,
    providerUserId: session.user.id,
    side: order.side,
    stopLossPriceCents: order.stopLossPriceCents,
    takeProfitPriceCents: order.takeProfitPriceCents,
  });

  revalidateTradingPaths(session.user.id);
}

export async function checkRiskExitsAction() {
  const session = await requireSession();

  await checkRiskExitsForUser({
    userId: session.user.id,
  });

  revalidateTradingPaths(session.user.id);
}

export async function closeSimulatedPositionAction(formData: FormData) {
  const session = await requireSession();
  const positionId = parsePositionId(formData);

  const [position] = await db
    .select()
    .from(simulatedPositionsSchema)
    .where(
      and(
        eq(simulatedPositionsSchema.id, positionId),
        eq(simulatedPositionsSchema.userId, session.user.id),
        eq(simulatedPositionsSchema.status, "open"),
      ),
    )
    .limit(1);

  if (!position) {
    throw new Error("Open position was not found.");
  }

  const ticker = await getBinanceTickerSnapshot(position.pairSymbol);

  await closePositionAtPrice({
    currentPriceCents: ticker.priceCents,
    position,
    userEmail: session.user.email,
    userName: session.user.name,
  });

  if (position.source === "manual") {
    await closeCopiedPositions({
      copiedFromPositionId: position.id,
      currentPriceCents: ticker.priceCents,
    });
  }

  revalidateTradingPaths(session.user.id);
}
