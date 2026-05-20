import { adminUsers } from "@/data/admin";
import {
  AdminCard,
  AdminPageHeader,
  DataTable,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";

type AdminUser = (typeof adminUsers)[number];

const adminUserColumns = [
  {
    header: "Name",
    cell: (user) => <span className="font-medium">{user.name}</span>,
  },
  {
    header: "Email",
    cell: (user) => <span className="text-muted">{user.email}</span>,
  },
  {
    header: "Role",
    cell: (user) => user.role,
  },
  {
    header: "Balance",
    cell: (user) => <span className="font-mono">{user.balance}</span>,
  },
  {
    header: "Status",
    cell: (user) => (
      <StatusBadge tone={user.status === "Active" ? "success" : "warning"}>{user.status}</StatusBadge>
    ),
  },
  {
    header: "Actions",
    cell: () => (
      <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition duration-150 hover:border-warning/50 hover:text-foreground">
        Edit
      </button>
    ),
  },
] as const satisfies readonly DataTableColumn<AdminUser>[];

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader
        action={<button className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-slate-950">Create user</button>}
        description="Static management table for user status, roles, and simulated balances."
        title="Users"
      />

      <AdminCard description="User records preview" title="User management">
        <DataTable
          columns={adminUserColumns}
          getRowKey={(user) => user.email}
          minWidth="760px"
          rows={adminUsers}
        />
      </AdminCard>
    </>
  );
}
