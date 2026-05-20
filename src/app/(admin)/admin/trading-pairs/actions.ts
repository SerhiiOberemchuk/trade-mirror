"use server";

import { db } from "@/db";
import { tradingPairsSchema } from "@/db/schema/trading-pairs.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const ADMIN_TRADING_PAIRS_PATH = "/admin/trading-pairs";
const SYMBOL_PATTERN = /^[A-Z0-9]{2,12}\/[A-Z0-9]{2,12}$/;

export async function createTradingPairAction(formData: FormData) {
  await requireAdminSession();

  const symbol = normalizeSymbol(String(formData.get("symbol") ?? ""));
  const spreadBps = Number(formData.get("spreadBps"));
  const maxLeverage = Number(formData.get("maxLeverage"));
  const simulatedVolume = Number(formData.get("simulatedVolume"));

  if (!SYMBOL_PATTERN.test(symbol)) {
    throw new Error("Trading pair symbol must look like BTC/USDT.");
  }

  if (!Number.isInteger(spreadBps) || spreadBps < 0 || spreadBps > 500) {
    throw new Error("Spread must be an integer from 0 to 500 basis points.");
  }

  if (!Number.isInteger(maxLeverage) || maxLeverage < 1 || maxLeverage > 100) {
    throw new Error("Max leverage must be an integer from 1 to 100.");
  }

  if (!Number.isFinite(simulatedVolume) || simulatedVolume < 0) {
    throw new Error("Simulated volume is invalid.");
  }

  const [baseAsset, quoteAsset] = symbol.split("/");

  await db.insert(tradingPairsSchema).values({
    baseAsset,
    maxLeverage,
    quoteAsset,
    simulatedVolumeCents: Math.round(simulatedVolume * 100),
    spreadBps,
    symbol,
  });

  revalidateTradingPairs();
}

export async function enableTradingPairAction(formData: FormData) {
  await updateTradingPairStatus(formData, "enabled");
}

export async function pauseTradingPairAction(formData: FormData) {
  await updateTradingPairStatus(formData, "paused");
}

async function updateTradingPairStatus(
  formData: FormData,
  status: "enabled" | "paused",
) {
  await requireAdminSession();
  const pairId = String(formData.get("pairId") ?? "");

  if (!pairId) {
    throw new Error("Invalid trading pair request.");
  }

  await db
    .update(tradingPairsSchema)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(tradingPairsSchema.id, pairId));

  revalidateTradingPairs();
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace("-", "/");
}

function revalidateTradingPairs() {
  invalidateAfterMutation({
    paths: [ADMIN_TRADING_PAIRS_PATH],
    tags: [CACHE_TAGS.adminTradingPairs],
  });
}
