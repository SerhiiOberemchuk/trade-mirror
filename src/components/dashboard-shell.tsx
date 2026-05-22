import {
  DataTable,
  EmptyState,
  MetricCard,
  ProductCard,
  ProductPageHeader,
  LoadingState,
  RouteErrorState,
  StatusBadge,
} from "@/components/dashboard/primitives";
export type { DataTableColumn } from "@/components/dashboard/primitives";
import { WorkspaceFrame } from "@/components/dashboard/workspace-frame";
import { hasAdminRole } from "@/lib/auth-roles";
import { dashboardNavItems } from "@/lib/navigation";
import type { Route } from "next";

type ShellUser = {
  id: string;
  name: string;
  email: string;
  role?: string | string[] | null;
};

type DashboardShellProps = {
  children: React.ReactNode;
  unreadNotifications: number;
  user: ShellUser;
};

export function DashboardShell({
  children,
  unreadNotifications,
  user,
}: DashboardShellProps) {
  return (
    <WorkspaceFrame
      balanceLabel="Demo balance"
      balanceValue="$125,420.80"
      brandSubtitle="User workspace"
      brandTitle="TradeMirror"
      navItems={dashboardNavItems}
      notificationHref={"/notifications" as Route}
      unreadNotifications={unreadNotifications}
      searchLabel="Search"
      searchPlaceholder="Search pairs, traders, tickets"
      switchLink={hasAdminRole(user.role) ? { href: "/admin", label: "Admin workspace" } : undefined}
      user={user}
    >
      {children}
    </WorkspaceFrame>
  );
}

export {
  DataTable,
  EmptyState,
  LoadingState,
  RouteErrorState,
  StatusBadge,
  ProductCard as DashboardCard,
  ProductPageHeader as DashboardPageHeader,
  MetricCard as StatTile,
};
