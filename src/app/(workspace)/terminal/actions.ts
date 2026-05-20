"use server";

import { db } from "@/db";
import {
  simulatedPositions,
  simulatedTrades,
  tradingPairs,
} from "@/db/schema";
import { requireSession } from "@/server/auth/session";
import { getBinanceTickerSnapshot } from "@/server/market-data/binance";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const TERMINAL_PATH = "/terminal";
const HISTORY_PATH = "/history";
const ADMIN_TRADES_PATH = "/admin/trades";
const MIN_NOTIONAL_CENTS = 1_000;
const MAX_NOTIONAL_CENTS = 100_000_00;
const VALID_SIDES = ["long", "short"] as const;

type PositionSide = (typeof VALID_SIDES)[number];

export async function createSimulatedOrderAction(formData: FormData) {
  const session = await requireSession();
  const pairSymbol = String(formData.get("pairSymbol") ?? "").trim().toUpperCase();
  const side = String(formData.get("side") ?? "long");
  const notional = Number(formData.get("notional"));
  const leverage = Number(formData.get("leverage"));

  if (!pairSymbol) {
    throw new Error("Trading pair is required.");
  }

  if (!isPositionSide(side)) {
    throw new Error("Position side is invalid.");
  }

  if (!Number.isFinite(notional)) {
    throw new Error("Order notional is invalid.");
  }

  const notionalCents = Math.round(notional * 100);

  if (notionalCents < MIN_NOTIONAL_CENTS || notionalCents > MAX_NOTIONAL_CENTS) {
    throw new Error("Order notional must be between $10.00 and $100,000.00.");
  }

  if (!Number.isInteger(leverage) || leverage < 1) {
    throw new Error("Leverage is invalid.");
  }

  const [pair] = await db
    .select()
    .from(tradingPairs)
    .where(and(eq(tradingPairs.symbol, pairSymbol), eq(tradingPairs.status, "enabled")))
    .limit(1);

  if (!pair) {
    throw new Error("Trading pair is not enabled.");
  }

  if (leverage > pair.maxLeverage) {
    throw new Error(`Leverage cannot exceed ${pair.maxLeverage}x for ${pair.symbol}.`);
  }

  const ticker = await getBinanceTickerSnapshot(pair.symbol);
  const [position] = await db
    .insert(simulatedPositions)
    .values({
      entryPriceCents: ticker.priceCents,
      leverage,
      notionalCents,
      pairSymbol: pair.symbol,
      side,
      source: "manual",
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
    })
    .returning({ id: simulatedPositions.id });

  await db.insert(simulatedTrades).values({
    action: "open",
    notionalCents,
    pairSymbol: pair.symbol,
    positionId: position.id,
    priceCents: ticker.priceCents,
    side,
    source: "manual",
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  revalidateTradingPaths();
}

export async function closeSimulatedPositionAction(formData: FormData) {
  const session = await requireSession();
  const positionId = String(formData.get("positionId") ?? "");

  if (!positionId) {
    throw new Error("Invalid position close request.");
  }

  const [position] = await db
    .select()
    .from(simulatedPositions)
    .where(
      and(
        eq(simulatedPositions.id, positionId),
        eq(simulatedPositions.userId, session.user.id),
        eq(simulatedPositions.status, "open"),
      ),
    )
    .limit(1);

  if (!position) {
    throw new Error("Open position was not found.");
  }

  const ticker = await getBinanceTickerSnapshot(position.pairSymbol);
  const pnlCents = calculatePnlCents({
    currentPriceCents: ticker.priceCents,
    entryPriceCents: position.entryPriceCents,
    notionalCents: position.notionalCents,
    side: position.side,
  });

  await db
    .update(simulatedPositions)
    .set({
      closedAt: new Date(),
      closedPriceCents: ticker.priceCents,
      realizedPnlCents: pnlCents,
      status: "closed",
    })
    .where(eq(simulatedPositions.id, position.id));

  await db.insert(simulatedTrades).values({
    action: "close",
    notionalCents: position.notionalCents,
    pairSymbol: position.pairSymbol,
    pnlCents,
    positionId: position.id,
    priceCents: ticker.priceCents,
    side: position.side,
    source: position.source,
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  revalidateTradingPaths();
}

function calculatePnlCents({
  currentPriceCents,
  entryPriceCents,
  notionalCents,
  side,
}: {
  currentPriceCents: number;
  entryPriceCents: number;
  notionalCents: number;
  side: PositionSide;
}) {
  const priceMove = (currentPriceCents - entryPriceCents) / entryPriceCents;
  const directionalMove = side === "long" ? priceMove : -priceMove;

  return Math.round(notionalCents * directionalMove);
}

function isPositionSide(side: string): side is PositionSide {
  return VALID_SIDES.includes(side as PositionSide);
}

function revalidateTradingPaths() {
  revalidatePath(TERMINAL_PATH);
  revalidatePath(HISTORY_PATH);
  revalidatePath(ADMIN_TRADES_PATH);
}
