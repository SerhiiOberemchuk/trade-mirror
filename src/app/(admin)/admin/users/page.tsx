import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/server/auth/session";
import {
  AdminCard,
  AdminPageHeader,
  ActionToolbar,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { headers } from "next/headers";
import {
  banUserAction,
  unbanUserAction,
} from "./actions";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Banned";
  emailVerified: boolean;
  createdAt: Date;
  isCurrentAdmin: boolean;
};

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
    cell: (user) => <StatusBadge tone={user.role === "admin" ? "warning" : "muted"}>{user.role}</StatusBadge>,
  },
  {
    header: "Verified",
    cell: (user) => (
      <StatusBadge tone={user.emailVerified ? "success" : "warning"}>
        {user.emailVerified ? "Verified" : "Pending"}
      </StatusBadge>
    ),
  },
  {
    header: "Status",
    cell: (user) => (
      <StatusBadge tone={user.status === "Active" ? "success" : "danger"}>{user.status}</StatusBadge>
    ),
  },
  {
    header: "Created",
    cell: (user) => (
      <span className="font-mono text-muted">
        {new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(user.createdAt)}
      </span>
    ),
  },
  {
    header: "Actions",
    cell: (user) => <UserActions user={user} />,
  },
] as const satisfies readonly DataTableColumn<AdminUser>[];

export default async function AdminUsersPage() {
  const session = await requireAdminSession();
  const response = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: 50,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });
  const users = response.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    status: user.banned ? "Banned" as const : "Active" as const,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    isCurrentAdmin: user.id === session.user.id,
  }));

  return (
    <>
      <AdminPageHeader
        action={
          <span className="rounded-lg border border-border px-4 py-2 text-sm text-muted">
            {response.total} users
          </span>
        }
        description="Real Better Auth user records with admin role and ban controls."
        title="Users"
      />

      <AdminCard description="Role and access controls are persisted through Better Auth." title="User management">
        {users.length > 0 ? (
          <DataTable
            columns={adminUserColumns}
            getRowKey={(user) => user.id}
            minWidth="940px"
            rows={users}
          />
        ) : (
          <EmptyState
            description="Users will appear here after registration."
            title="No users found"
          />
        )}
      </AdminCard>
    </>
  );
}

function UserActions({ user }: { user: AdminUser }) {
  return (
    <ActionToolbar>
      {user.status === "Banned" ? (
        <form action={unbanUserFormAction}>
          <input name="userId" type="hidden" value={user.id} />
          <button
            className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
            type="submit"
          >
            Unban
          </button>
        </form>
      ) : (
        <form action={banUserFormAction}>
          <input name="userId" type="hidden" value={user.id} />
          <button
            className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={user.isCurrentAdmin}
            type="submit"
          >
            Ban
          </button>
        </form>
      )}
    </ActionToolbar>
  );
}

async function unbanUserFormAction(formData: FormData) {
  "use server";

  await unbanUserAction(formData);
}

async function banUserFormAction(formData: FormData) {
  "use server";

  await banUserAction(formData);
}

function normalizeRole(role: string | string[] | null | undefined) {
  if (Array.isArray(role)) {
    return role.join(", ");
  }

  return role || "user";
}
