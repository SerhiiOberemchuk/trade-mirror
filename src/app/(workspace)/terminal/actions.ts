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
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { and, eq } from "drizzle-orm";

export async function createSimulatedOrderAction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  let order: ReturnType<typeof parseOrderInput>;

  try {
    order = parseOrderInput(formData);
  } catch (error) {
    return actionError(getActionErrorMessage(error, "Order request is invalid."));
  }

  try {
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
      return actionError("Trading pair is not enabled.");
    }

    if (order.leverage > pair.maxLeverage) {
      return actionError(`Leverage cannot exceed ${pair.maxLeverage}x for ${pair.symbol}.`);
    }

    const ticker = await getBinanceTickerSnapshot(pair.symbol);

    try {
      validateRiskThresholds({
        currentPriceCents: ticker.priceCents,
        side: order.side,
        stopLossPriceCents: order.stopLossPriceCents,
        takeProfitPriceCents: order.takeProfitPriceCents,
      });
    } catch (error) {
      return actionError(getActionErrorMessage(error, "Risk thresholds are invalid."));
    }

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

    return actionSuccess("Simulated position opened.");
  } catch {
    return actionError("Unable to open this simulated position. Please try again.");
  }
}

export async function checkRiskExitsAction(): Promise<ActionResult> {
  const session = await requireSession();

  try {
    await checkRiskExitsForUser({
      userId: session.user.id,
    });

    revalidateTradingPaths(session.user.id);

    return actionSuccess("Risk exits checked.");
  } catch {
    return actionError("Unable to check risk exits. Please try again.");
  }
}

export async function closeSimulatedPositionAction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  let positionId: string;

  try {
    positionId = parsePositionId(formData);
  } catch (error) {
    return actionError(getActionErrorMessage(error, "Position request is invalid."));
  }

  try {
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
      return actionError("Open position was not found.");
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

    return actionSuccess("Simulated position closed.");
  } catch {
    return actionError("Unable to close this simulated position. Please try again.");
  }
}

function getActionErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
