import type { PositionSide } from "./constants";

export function calculatePnlCents({
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
