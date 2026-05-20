import { db } from "@/db";
import { bonusCampaignsSchema } from "@/db/schema/bonuses.schema";
import {
  ActionToolbar,
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc } from "drizzle-orm";
import {
  createBonusCampaignAction,
  enableBonusCampaignAction,
  pauseBonusCampaignAction,
} from "./actions";

type BonusCampaignRow = {
  id: string;
  name: string;
  code: string;
  rewardType: "percent" | "fixed";
  reward: string;
  status: "enabled" | "paused";
  usage: string;
  updated: string;
};

const bonusColumns = [
  {
    header: "Campaign",
    cell: (campaign) => (
      <div>
        <p className="font-medium">{campaign.name}</p>
        <p className="mt-1 font-mono text-xs text-muted">{campaign.code}</p>
      </div>
    ),
  },
  {
    header: "Reward",
    cell: (campaign) => <span className="font-mono">{campaign.reward}</span>,
  },
  {
    header: "Status",
    cell: (campaign) => (
      <StatusBadge tone={campaign.status === "enabled" ? "success" : "warning"}>
        {campaign.status}
      </StatusBadge>
    ),
  },
  {
    header: "Usage",
    cell: (campaign) => <span className="text-muted">{campaign.usage}</span>,
  },
  {
    header: "Updated",
    cell: (campaign) => (
      <span className="font-mono text-muted">{campaign.updated}</span>
    ),
  },
  {
    header: "Actions",
    cell: (campaign) => <BonusCampaignActions campaign={campaign} />,
  },
] as const satisfies readonly DataTableColumn<BonusCampaignRow>[];

export default async function AdminBonusesPage() {
  const state = await getBonusCampaignRows();

  return (
    <>
      <AdminPageHeader
        description="Promotion toggles and bonus campaign performance for the simulated platform."
        title="Bonuses"
      />

      <section className="grid gap-5 xl:grid-cols-[0.55fr_1.45fr]">
        <AdminCard
          description="Create a simulated bonus campaign"
          title="New bonus"
        >
          <form action={createBonusCampaignAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Campaign name</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                maxLength={120}
                minLength={3}
                name="name"
                placeholder="First deposit boost"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Bonus code</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 font-mono text-sm uppercase outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                maxLength={32}
                minLength={3}
                name="code"
                placeholder="FIRST25"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Reward type</span>
                <select
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                  defaultValue="percent"
                  name="rewardType"
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed USD</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Reward value</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
                  defaultValue="25"
                  min="1"
                  name="rewardValue"
                  step="0.01"
                  type="number"
                />
              </label>
            </div>

            <button
              className="w-full rounded-lg bg-warning px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
              type="submit"
            >
              Create bonus
            </button>
          </form>
        </AdminCard>

        <AdminCard
          description="Persisted simulated bonus campaigns"
          title="Campaigns"
        >
          {state.kind === "ready" && state.rows.length > 0 ? (
            <DataTable
              columns={bonusColumns}
              getRowKey={(campaign) => campaign.id}
              minWidth="920px"
              rows={state.rows}
            />
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Create the first bonus campaign to manage simulated promotion availability."
              title="No bonus campaigns"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted bonus campaign controls."
              title="Bonus campaign table is not ready"
            />
          ) : null}
        </AdminCard>
      </section>
    </>
  );
}

function BonusCampaignActions({ campaign }: { campaign: BonusCampaignRow }) {
  return (
    <ActionToolbar>
      {campaign.status === "enabled" ? (
        <form action={pauseBonusCampaignAction}>
          <input name="campaignId" type="hidden" value={campaign.id} />
          <button
            className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
            type="submit"
          >
            Pause
          </button>
        </form>
      ) : (
        <form action={enableBonusCampaignAction}>
          <input name="campaignId" type="hidden" value={campaign.id} />
          <button
            className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
            type="submit"
          >
            Enable
          </button>
        </form>
      )}
    </ActionToolbar>
  );
}

async function getBonusCampaignRows(): Promise<
  { kind: "ready"; rows: BonusCampaignRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(bonusCampaignsSchema)
      .orderBy(desc(bonusCampaignsSchema.updatedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        code: row.code,
        id: row.id,
        name: row.name,
        reward: formatReward(row.rewardType, row.rewardValue),
        rewardType: row.rewardType,
        status: row.status,
        updated: formatDate(row.updatedAt),
        usage: `${row.usageCount} users`,
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function formatReward(
  rewardType: BonusCampaignRow["rewardType"],
  rewardValue: number,
) {
  if (rewardType === "fixed") {
    return new Intl.NumberFormat("en", {
      currency: "USD",
      style: "currency",
    }).format(rewardValue / 100);
  }

  return `${rewardValue}%`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
