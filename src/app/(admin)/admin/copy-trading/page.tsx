import { adminCopyActivity } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminCopyTradingPage() {
  return (
    <>
      <AdminPageHeader
        description="Administrative monitor for relationships between copy providers and followers."
        title="Copy Trading Activity"
      />

      <AdminCard description="Provider/follower links" title="Copy activity">
        <div className="grid gap-3">
          {adminCopyActivity.map((activity) => (
            <div className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-5" key={`${activity.leader}-${activity.follower}`}>
              <p className="font-medium">{activity.leader}</p>
              <p className="text-muted">{activity.follower}</p>
              <p className="font-mono">{activity.ratio}</p>
              <p className="font-mono text-muted">{activity.allocation}</p>
              <p className="text-warning md:text-right">{activity.status}</p>
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
