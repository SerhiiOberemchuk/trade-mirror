import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { TRADING_PATHS } from "./constants";

export function revalidateTradingPaths(userId: string) {
  invalidateAfterMutation({
    paths: [
      TRADING_PATHS.terminal,
      TRADING_PATHS.history,
      TRADING_PATHS.adminTrades,
      TRADING_PATHS.copyTrading,
      TRADING_PATHS.adminCopyTrading,
    ],
    tags: [
      cacheTags.userTerminal(userId),
      cacheTags.userHistory(userId),
      cacheTags.userCopyTrading(userId),
      CACHE_TAGS.adminTrades,
      CACHE_TAGS.adminCopyTrading,
    ],
  });
}
