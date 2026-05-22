import {
  ActionToolbar,
  DataTable,
  EmptyState,
  LoadingState,
  MetricCard,
  ProductCard,
  ProductPageHeader,
  RouteErrorState,
  StatusBadge,
} from "@/components/dashboard/primitives";
export type { DataTableColumn } from "@/components/dashboard/primitives";
import { WorkspaceFrame } from "@/components/dashboard/workspace-frame";
import { adminNavItems } from "@/lib/navigation";
import { getUnreadNotificationCount } from "@/server/notifications/notifications";
import type { Route } from "next";

type ShellUser = {
  id: string;
  name: string;
  email: string;
  role?: string | string[] | null;
};

type AdminShellProps = {
  children: React.ReactNode;
  user: ShellUser;
};

export async function AdminShell({ children, user }: AdminShellProps) {
  const unreadNotifications = await getUnreadNotificationCount(user.id);

  return (
    <WorkspaceFrame
      balanceLabel="Open reviews"
      balanceValue="42"
      brandSubtitle="Operations workspace"
      brandTitle="TradeMirror Admin"
      navItems={adminNavItems}
      notificationHref={"/admin/notifications" as Route}
      unreadNotifications={unreadNotifications}
      searchLabel="Admin search"
      searchPlaceholder="Search users, trades, requests"
      switchLink={{ href: "/dashboard", label: "Client workspace" }}
      tone="warning"
      user={user}
    >
      {children}
    </WorkspaceFrame>
  );
}

export {
  ActionToolbar,
  DataTable,
  EmptyState,
  LoadingState,
  RouteErrorState,
  StatusBadge,
  ProductCard as AdminCard,
  ProductPageHeader as AdminPageHeader,
};

export function AdminStatTile(props: {
  label: string;
  value: string;
  change?: string;
}) {
  return <MetricCard {...props} tone="warning" />;
}

export function ReviewActions() {
  return (
    <ActionToolbar>
      <button className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300 active:scale-[0.99]">
        Approve
      </button>
      <button className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400 active:scale-[0.99]">
        Reject
      </button>
      <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition duration-150 hover:border-warning/50 hover:text-foreground active:scale-[0.99]">
        Review
      </button>
    </ActionToolbar>
  );
}
