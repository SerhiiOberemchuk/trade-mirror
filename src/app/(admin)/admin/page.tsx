import { db } from "@/db";
import {
  copySettingsSchema,
  traderProfilesSchema,
} from "@/db/schema/copy-trading.schema";
import { supportTicketsSchema } from "@/db/schema/support.schema";
import { withdrawalRequestsSchema } from "@/db/schema/wallet.schema";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatTile,
  StatusBadge,
} from "@/components/admin-shell";
import { desc, eq, ne } from "drizzle-orm";
import Link from "next/link";
import { user } from "../../../../auth-schema";

type AdminOverviewState = {
  copyActivity: {
    allocation: string;
    follower: string;
    ratio: string;
    status: "active" | "paused";
    trader: string;
  }[];
  stats: {
    change: string;
    label: string;
    value: string;
  }[];
  supportTickets: {
    priority: "low" | "medium" | "high";
    subject: string;
    updated: string;
    userName: string;
  }[];
  withdrawals: {
    amount: string;
    id: string;
    risk: "low" | "medium" | "high";
    userName: string;
  }[];
};

export default async function AdminOverviewPage() {
  const state = await getAdminOverviewState();

  return (
    <>
      <AdminPageHeader
        description="Real operations overview for simulated users, finance reviews, copy settings, and support load."
        title="Admin Overview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {state.stats.map((stat) => (
          <AdminStatTile
            change={stat.change}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminCard
          description="Requests waiting for operations review"
          title="Withdrawal queue"
        >
          <div className="space-y-3">
            {state.withdrawals.map((request) => (
              <div
                className="rounded-lg border border-border bg-background p-4"
                key={request.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{request.userName}</p>
                    <p className="mt-1 text-sm text-muted">
                      {request.amount} / {request.risk} risk
                    </p>
                  </div>
                  <Link
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition duration-150 hover:border-warning/50 hover:text-foreground"
                    href="/admin/withdrawals"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
            {state.withdrawals.length === 0 ? (
              <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
                No pending withdrawal requests.
              </p>
            ) : null}
          </div>
        </AdminCard>

        <AdminCard
          description="Copy relationships requiring monitoring"
          title="Copy trading activity"
        >
          <div className="space-y-3">
            {state.copyActivity.map((activity) => (
              <div
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm"
                key={`${activity.trader}-${activity.follower}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">
                    {activity.trader} -&gt; {activity.follower}
                  </p>
                  <StatusBadge
                    tone={activity.status === "active" ? "success" : "warning"}
                  >
                    {activity.status}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-muted">
                  {activity.ratio} ratio / {activity.allocation}
                </p>
              </div>
            ))}
            {state.copyActivity.length === 0 ? (
              <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
                No copy settings yet.
              </p>
            ) : null}
          </div>
        </AdminCard>
      </section>

      <section className="mt-6">
        <AdminCard
          description="Latest operational support workload"
          title="Support escalation"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {state.supportTickets.map((ticket) => (
              <div
                className="rounded-lg border border-border bg-background p-4"
                key={ticket.subject}
              >
                <p className="font-medium">{ticket.subject}</p>
                <p className="mt-2 text-sm text-muted">
                  {ticket.userName} / {ticket.updated}
                </p>
                <div className="mt-3">
                  <StatusBadge
                    tone={ticket.priority === "high" ? "danger" : "warning"}
                  >
                    {ticket.priority}
                  </StatusBadge>
                </div>
              </div>
            ))}
            {state.supportTickets.length === 0 ? (
              <p className="rounded-lg border border-border bg-background p-4 text-sm text-muted">
                No open support tickets.
              </p>
            ) : null}
          </div>
        </AdminCard>
      </section>
    </>
  );
}

async function getAdminOverviewState(): Promise<AdminOverviewState> {
  const [
    userRows,
    traderProfileRows,
    pendingWithdrawalRows,
    openSupportRows,
    copySettingRows,
  ] = await Promise.all([
    db.select().from(user),
    db.select().from(traderProfilesSchema),
    db
      .select()
      .from(withdrawalRequestsSchema)
      .where(eq(withdrawalRequestsSchema.status, "pending"))
      .orderBy(desc(withdrawalRequestsSchema.requestedAt)),
    db
      .select()
      .from(supportTicketsSchema)
      .where(ne(supportTicketsSchema.status, "closed"))
      .orderBy(desc(supportTicketsSchema.updatedAt)),
    db
      .select()
      .from(copySettingsSchema)
      .orderBy(desc(copySettingsSchema.updatedAt)),
  ]);

  const pendingWithdrawalCents = pendingWithdrawalRows.reduce(
    (total, row) => total + row.amountCents,
    0,
  );
  const highPrioritySupportCount = openSupportRows.filter(
    (row) => row.priority === "high",
  ).length;

  return {
    copyActivity: copySettingRows.slice(0, 3).map((row) => ({
      allocation: formatMoney(row.allocationCents),
      follower: row.followerName,
      ratio: formatBps(row.copyRatioBps),
      status: row.status,
      trader: row.traderName,
    })),
    stats: [
      {
        change: `${userRows.filter((row) => row.emailVerified).length} verified`,
        label: "Total users",
        value: String(userRows.length),
      },
      {
        change: `${traderProfileRows.filter((row) => row.status === "published").length} published`,
        label: "Trader profiles",
        value: String(traderProfileRows.length),
      },
      {
        change: `${highPrioritySupportCount} high priority`,
        label: "Open tickets",
        value: String(openSupportRows.length),
      },
      {
        change: `${pendingWithdrawalRows.length} requests`,
        label: "Pending withdrawals",
        value: formatMoney(pendingWithdrawalCents),
      },
    ],
    supportTickets: openSupportRows.slice(0, 3).map((row) => ({
      priority: row.priority,
      subject: row.subject,
      updated: formatRelativeDate(row.updatedAt),
      userName: row.userName,
    })),
    withdrawals: pendingWithdrawalRows.slice(0, 3).map((row) => ({
      amount: formatMoney(row.amountCents),
      id: row.id,
      risk: row.riskLevel,
      userName: row.userName,
    })),
  };
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}

function formatBps(value: number) {
  return `${(value / 100).toFixed(0)}%`;
}

function formatRelativeDate(value: Date) {
  const diffMs = Date.now() - value.getTime();
  const diffMinutes = Math.max(Math.round(diffMs / 60_000), 0);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.round(diffHours / 24)}d ago`;
}
