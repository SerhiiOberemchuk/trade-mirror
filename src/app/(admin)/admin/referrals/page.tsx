import { db } from "@/db";
import { referralProfilesSchema } from "@/db/schema/referrals.schema";
import {
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc } from "drizzle-orm";
import {
  activateReferralProfileAction,
  createReferralProfileAction,
  pauseReferralProfileAction,
} from "./actions";

type ReferralProfileRow = {
  id: string;
  referrer: string;
  email: string;
  code: string;
  signups: number;
  activeUsers: number;
  reward: string;
  status: "active" | "paused";
  updated: string;
};

const referralColumns = [
  {
    header: "Referrer",
    cell: (profile) => (
      <div>
        <p className="font-medium">{profile.referrer}</p>
        <p className="mt-1 text-xs text-muted">{profile.email}</p>
      </div>
    ),
  },
  {
    header: "Code",
    cell: (profile) => <span className="font-mono">{profile.code}</span>,
  },
  {
    header: "Signups",
    cell: (profile) => <span className="font-mono">{profile.signups}</span>,
    align: "right",
  },
  {
    header: "Active",
    cell: (profile) => <span className="font-mono">{profile.activeUsers}</span>,
    align: "right",
  },
  {
    header: "Reward",
    cell: (profile) => <span className="font-mono">{profile.reward}</span>,
    align: "right",
  },
  {
    header: "Status",
    cell: (profile) => (
      <StatusBadge tone={profile.status === "active" ? "success" : "warning"}>
        {profile.status}
      </StatusBadge>
    ),
  },
  {
    header: "Updated",
    cell: (profile) => <span className="font-mono text-muted">{profile.updated}</span>,
  },
  {
    header: "Actions",
    cell: (profile) => <ReferralProfileActions profile={profile} />,
    align: "right",
  },
] as const satisfies readonly DataTableColumn<ReferralProfileRow>[];

export default async function AdminReferralsPage() {
  const state = await getReferralProfileRows();

  return (
    <>
      <AdminPageHeader
        description="Manage simulated referral profiles and reward accounting for growth workflows."
        title="Referrals"
      />

      <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <AdminCard description="Create a referral code for an existing user." title="New referral profile">
          <form action={createReferralProfileAction} className="space-y-4">
            <label className="block text-sm">
              <span className="font-medium">Referrer email</span>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition duration-150 focus:border-warning"
                name="referrerEmail"
                placeholder="user@example.com"
                required
                type="email"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium">Referral code</span>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm uppercase text-foreground outline-none transition duration-150 focus:border-warning"
                name="code"
                placeholder="MIRROR-100"
                required
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium">Simulated reward</span>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition duration-150 focus:border-warning"
                min="0"
                name="reward"
                placeholder="250"
                step="0.01"
                type="number"
              />
            </label>

            <button
              className="min-h-11 w-full rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
              type="submit"
            >
              Create referral
            </button>
          </form>
        </AdminCard>

        <AdminCard description="Persisted referral profiles" title="Referral profiles">
          {state.kind === "ready" && state.rows.length > 0 ? (
            <DataTable
              columns={referralColumns}
              getRowKey={(profile) => profile.id}
              minWidth="980px"
              rows={state.rows}
            />
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Create a referral profile for an existing user to start tracking simulated referral rewards."
              title="No referral profiles"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted referral profiles."
              title="Referral profiles are not ready"
            />
          ) : null}
        </AdminCard>
      </section>
    </>
  );
}

function ReferralProfileActions({ profile }: { profile: ReferralProfileRow }) {
  return profile.status === "active" ? (
    <form action={pauseReferralProfileAction}>
      <input name="profileId" type="hidden" value={profile.id} />
      <button
        className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
        type="submit"
      >
        Pause
      </button>
    </form>
  ) : (
    <form action={activateReferralProfileAction}>
      <input name="profileId" type="hidden" value={profile.id} />
      <button
        className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
        type="submit"
      >
        Activate
      </button>
    </form>
  );
}

async function getReferralProfileRows(): Promise<
  { kind: "ready"; rows: ReferralProfileRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(referralProfilesSchema)
      .orderBy(desc(referralProfilesSchema.updatedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        activeUsers: row.activeUsersCount,
        code: row.code,
        email: row.referrerEmail,
        id: row.id,
        referrer: row.referrerName,
        reward: formatMoney(row.rewardCents),
        signups: row.signupsCount,
        status: row.status,
        updated: formatDate(row.updatedAt),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
