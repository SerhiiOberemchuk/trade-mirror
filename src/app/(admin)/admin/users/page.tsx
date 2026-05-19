import { adminUsers } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader
        action={<button className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-slate-950">Create user</button>}
        description="Static management table for user status, roles, and simulated balances."
        title="Users"
      />

      <AdminCard description="User records preview" title="User management">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr className="border-b border-border">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Balance</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr className="border-b border-border/70 last:border-0" key={user.email}>
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 text-muted">{user.email}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3 font-mono">{user.balance}</td>
                  <td className="py-3 text-warning">{user.status}</td>
                  <td className="py-3">
                    <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}
