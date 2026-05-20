import { db } from "@/db";
import {
  copySettingsSchema,
  traderProfilesSchema,
} from "@/db/schema/copy-trading.schema";
import {
  simulatedPositionsSchema,
  simulatedTradesSchema,
} from "@/db/schema/trading.schema";
import { and, eq } from "drizzle-orm";
import { MIN_NOTIONAL_CENTS, type PositionSide } from "./constants";
import { closePositionAtPrice } from "./position-lifecycle";

export async function createCopiedPositionsForFollowers({
  entryPriceCents,
  leverage,
  pairSymbol,
  providerPositionId,
  providerUserId,
  side,
  stopLossPriceCents,
  takeProfitPriceCents,
}: {
  entryPriceCents: number;
  leverage: number;
  pairSymbol: string;
  providerPositionId: string;
  providerUserId: string;
  side: PositionSide;
  stopLossPriceCents: number | null;
  takeProfitPriceCents: number | null;
}) {
  const profileRows = await db
    .select()
    .from(traderProfilesSchema)
    .where(
      and(
        eq(traderProfilesSchema.userId, providerUserId),
        eq(traderProfilesSchema.status, "published"),
      ),
    );

  for (const profile of profileRows) {
    const followerRows = await db
      .select()
      .from(copySettingsSchema)
      .where(
        and(
          eq(copySettingsSchema.traderProfileId, profile.id),
          eq(copySettingsSchema.status, "active"),
        ),
      );

    for (const follower of followerRows) {
      if (follower.followerUserId === providerUserId) {
        continue;
      }

      const copiedNotionalCents = Math.round(
        (follower.allocationCents * follower.copyRatioBps) / 10_000,
      );

      if (copiedNotionalCents < MIN_NOTIONAL_CENTS) {
        continue;
      }

      const [copiedPosition] = await db
        .insert(simulatedPositionsSchema)
        .values({
          copiedFromPositionId: providerPositionId,
          copiedFromTraderProfileId: profile.id,
          entryPriceCents,
          leverage,
          notionalCents: copiedNotionalCents,
          pairSymbol,
          side,
          source: "copy",
          stopLossPriceCents,
          takeProfitPriceCents,
          userEmail: follower.followerEmail,
          userId: follower.followerUserId,
          userName: follower.followerName,
        })
        .returning({ id: simulatedPositionsSchema.id });

      await db.insert(simulatedTradesSchema).values({
        action: "open",
        notionalCents: copiedNotionalCents,
        pairSymbol,
        positionId: copiedPosition.id,
        priceCents: entryPriceCents,
        side,
        source: "copy",
        userEmail: follower.followerEmail,
        userId: follower.followerUserId,
        userName: follower.followerName,
      });
    }
  }
}

export async function closeCopiedPositions({
  copiedFromPositionId,
  currentPriceCents,
}: {
  copiedFromPositionId: string;
  currentPriceCents: number;
}) {
  const copiedPositions = await db
    .select()
    .from(simulatedPositionsSchema)
    .where(
      and(
        eq(simulatedPositionsSchema.copiedFromPositionId, copiedFromPositionId),
        eq(simulatedPositionsSchema.status, "open"),
      ),
    );

  for (const copiedPosition of copiedPositions) {
    await closePositionAtPrice({
      currentPriceCents,
      position: copiedPosition,
      userEmail: copiedPosition.userEmail,
      userName: copiedPosition.userName,
    });
  }
}
