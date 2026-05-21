import { db } from "@/db";
import { traderProfilesSchema } from "@/db/schema/copy-trading.schema";
import { simulatedTradesSchema } from "@/db/schema/trading.schema";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatTile,
  StatusBadge,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { pauseTraderProfileAction, publishOwnTraderProfileAction } from "./actions";

type TraderProfileRow = typeof traderProfilesSchema.$inferSelect;

type TraderProfileState = {
  closedCopyPnlCents: number;
  profiles: TraderProfileRow[];
  totalFollowers: number;
  totalProfiles: number;
};

export default async function TraderProfilePage() {
  const session = await requireSession();
  const state = await getTraderProfileState(session.user.id);

  return (
    <>
      <DashboardPageHeader
        action={
          <Link
            className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
            href="/trader-marketplace"
          >
            Publish new profile
          </Link>
        }
        description="Manage your simulated provider profiles and how they appear in the trader marketplace."
        title="Trader Profile"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatTile
          change={`${state.profiles.filter((profile) => profile.status === "published").length} published`}
          label="Profiles"
          value={String(state.totalProfiles)}
        />
        <StatTile
          change="Across your provider profiles"
          label="Followers"
          value={formatNumber(state.totalFollowers)}
        />
        <StatTile
          change="Copied close executions"
          label="Copy PnL"
          tone={state.closedCopyPnlCents >= 0 ? "success" : "danger"}
          value={formatSignedMoney(state.closedCopyPnlCents)}
        />
      </section>

      <section className="mt-6">
        <DashboardCard description="Your persisted provider profiles" title="Provider profiles">
          {state.profiles.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {state.profiles.map((profile) => (
                <article
                  className="rounded-lg border border-border bg-background p-5"
                  key={profile.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">{profile.displayName}</h2>
                      <p className="mt-1 text-sm text-muted">{profile.strategy}</p>
                    </div>
                    <StatusBadge tone={profile.status === "published" ? "success" : "warning"}>
                      {profile.status}
                    </StatusBadge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <Metric label="Monthly PnL" tone="success" value={formatSignedBps(profile.monthlyPnlBps)} />
                    <Metric label="Win rate" value={formatBps(profile.winRateBps)} />
                    <Metric label="Drawdown" value={formatBps(profile.maxDrawdownBps)} />
                    <Metric label="Followers" value={formatNumber(profile.followersCount)} />
                  </div>

                  <div className="mt-5">
                    <TraderProfileActions profile={profile} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <Link
                  className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
                  href="/trader-marketplace"
                >
                  Create profile
                </Link>
              }
              description="Publish a simulated provider profile from the marketplace to start collecting followers."
              title="No trader profile yet"
            />
          )}
        </DashboardCard>
      </section>
    </>
  );
}

function TraderProfileActions({ profile }: { profile: TraderProfileRow }) {
  return profile.status === "published" ? (
    <form action={pauseTraderProfileFormAction}>
      <input name="profileId" type="hidden" value={profile.id} />
      <button
        className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
        type="submit"
      >
        Pause
      </button>
    </form>
  ) : (
    <form action={publishOwnTraderProfileFormAction}>
      <input name="profileId" type="hidden" value={profile.id} />
      <button
        className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
        type="submit"
      >
        Publish
      </button>
    </form>
  );
}

async function pauseTraderProfileFormAction(formData: FormData) {
  "use server";

  await pauseTraderProfileAction(formData);
}

async function publishOwnTraderProfileFormAction(formData: FormData) {
  "use server";

  await publishOwnTraderProfileAction(formData);
}

async function getTraderProfileState(userId: string): Promise<TraderProfileState> {
  const [profiles, copiedCloseTrades] = await Promise.all([
    db
      .select()
      .from(traderProfilesSchema)
      .where(eq(traderProfilesSchema.userId, userId))
      .orderBy(desc(traderProfilesSchema.updatedAt)),
    db
      .select()
      .from(simulatedTradesSchema)
      .where(
        and(
          eq(simulatedTradesSchema.userId, userId),
          eq(simulatedTradesSchema.source, "copy"),
          eq(simulatedTradesSchema.action, "close"),
        ),
      ),
  ]);

  return {
    closedCopyPnlCents: copiedCloseTrades.reduce((total, trade) => total + trade.pnlCents, 0),
    profiles,
    totalFollowers: profiles.reduce((total, profile) => total + profile.followersCount, 0),
    totalProfiles: profiles.length,
  };
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-mono font-semibold ${tone === "success" ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(cents / 100);
}

function formatSignedMoney(cents: number) {
  return `${cents >= 0 ? "+" : "-"}${formatMoney(Math.abs(cents))}`;
}

function formatBps(value: number) {
  return `${(value / 100).toFixed(1)}%`;
}

function formatSignedBps(value: number) {
  return `${value >= 0 ? "+" : ""}${formatBps(value)}`;
}
