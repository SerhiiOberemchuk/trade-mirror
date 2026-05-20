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
import { dashboardNavItems } from "@/lib/navigation";

type ShellUser = {
  name: string;
  email: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  user: ShellUser;
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <WorkspaceFrame
      balanceLabel="Demo balance"
      balanceValue="$125,420.80"
      brandSubtitle="User workspace"
      brandTitle="TradeMirror"
      navItems={dashboardNavItems}
      searchLabel="Search"
      searchPlaceholder="Search pairs, traders, tickets"
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
