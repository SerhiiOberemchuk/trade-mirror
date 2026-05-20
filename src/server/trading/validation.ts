import {
  MAX_NOTIONAL_CENTS,
  MIN_NOTIONAL_CENTS,
  type PositionSide,
  VALID_POSITION_SIDES,
} from "./constants";

export function parseOrderInput(formData: FormData) {
  const pairSymbol = String(formData.get("pairSymbol") ?? "").trim().toUpperCase();
  const side = String(formData.get("side") ?? "long");
  const notional = Number(formData.get("notional"));
  const leverage = Number(formData.get("leverage"));
  const stopLossPriceCents = parseOptionalPrice(formData.get("stopLoss"));
  const takeProfitPriceCents = parseOptionalPrice(formData.get("takeProfit"));

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

  return {
    leverage,
    notionalCents,
    pairSymbol,
    side,
    stopLossPriceCents,
    takeProfitPriceCents,
  };
}

export function parsePositionId(formData: FormData) {
  const positionId = String(formData.get("positionId") ?? "");

  if (!positionId) {
    throw new Error("Invalid position request.");
  }

  return positionId;
}

export function validateRiskThresholds({
  currentPriceCents,
  side,
  stopLossPriceCents,
  takeProfitPriceCents,
}: {
  currentPriceCents: number;
  side: PositionSide;
  stopLossPriceCents: number | null;
  takeProfitPriceCents: number | null;
}) {
  if (side === "long") {
    if (stopLossPriceCents !== null && stopLossPriceCents >= currentPriceCents) {
      throw new Error("Long stop loss must be below the current price.");
    }

    if (takeProfitPriceCents !== null && takeProfitPriceCents <= currentPriceCents) {
      throw new Error("Long take profit must be above the current price.");
    }

    return;
  }

  if (stopLossPriceCents !== null && stopLossPriceCents <= currentPriceCents) {
    throw new Error("Short stop loss must be above the current price.");
  }

  if (takeProfitPriceCents !== null && takeProfitPriceCents >= currentPriceCents) {
    throw new Error("Short take profit must be below the current price.");
  }
}

function parseOptionalPrice(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const price = Number(rawValue);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Risk exit price is invalid.");
  }

  return Math.round(price * 100);
}

function isPositionSide(side: string): side is PositionSide {
  return VALID_POSITION_SIDES.includes(side as PositionSide);
}
