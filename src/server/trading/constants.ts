import {
  simulatedPositionSideEnum,
  type simulatedPositionsSchema,
} from "@/db/schema/trading.schema";

export const TRADING_PATHS = {
  adminCopyTrading: "/admin/copy-trading",
  adminTrades: "/admin/trades",
  copyTrading: "/copy-trading",
  history: "/history",
  terminal: "/terminal",
} as const;

export const MIN_NOTIONAL_CENTS = 1_000;
export const MAX_NOTIONAL_CENTS = 100_000_00;
export const VALID_POSITION_SIDES = simulatedPositionSideEnum.enumValues;

export type PositionSide =
  (typeof simulatedPositionsSchema.$inferSelect)["side"];
