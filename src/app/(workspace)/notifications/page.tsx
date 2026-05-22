import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/notifications/actions";
import {
  getUserNotifications,
  type NotificationRow,
} from "@/server/notifications/notifications";
import type { Route } from "next";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await requireSession();
  const state = await getUserNotifications(session.user.id);

  return (
    <>
      <DashboardPageHeader
        action={state.kind === "ready" && state.rows.length > 0 ? <MarkAllReadButton /> : null}
        description="Account updates from admin reviews, support replies, wallet requests, and platform events."
        title="Notifications"
      />

      <DashboardCard description="Latest updates for your workspace" title="Notification center">
        {state.kind === "ready" && state.rows.length > 0 ? (
          <div className="space-y-3">
            {state.rows.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="Admin replies and review updates will appear here."
            title="No notifications"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using notifications."
            title="Notifications are not ready"
          />
        ) : null}
      </DashboardCard>
    </>
  );
}

function NotificationItem({ notification }: { notification: NotificationRow }) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{notification.title}</p>
            <StatusBadge tone={notification.isRead ? "muted" : "primary"}>
              {notification.isRead ? "read" : "new"}
            </StatusBadge>
            <StatusBadge tone="muted">{notification.type}</StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{notification.body}</p>
          <p className="mt-3 text-xs text-muted">
            {formatDate(notification.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {notification.href ? (
            <Link
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition duration-150 hover:border-primary/50 hover:text-foreground"
              href={notification.href as Route}
            >
              Open
            </Link>
          ) : null}
          {!notification.isRead ? (
            <form action={markNotificationReadFormAction}>
              <input name="notificationId" type="hidden" value={notification.id} />
              <button
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
                type="submit"
              >
                Mark read
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MarkAllReadButton() {
  return (
    <form action={markAllNotificationsReadFormAction}>
      <button
        className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition duration-150 hover:border-primary/50 hover:text-foreground"
        type="submit"
      >
        Mark all read
      </button>
    </form>
  );
}

async function markAllNotificationsReadFormAction() {
  "use server";

  await markAllNotificationsReadAction();
}

async function markNotificationReadFormAction(formData: FormData) {
  "use server";

  await markNotificationReadAction(formData);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
