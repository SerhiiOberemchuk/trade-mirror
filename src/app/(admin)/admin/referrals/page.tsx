import { adminReferrals } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminReferralsPage() {
  return (
    <>
      <AdminPageHeader
        description="Referral statistics preview for growth and reward management."
        title="Referrals"
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {adminReferrals.map((referral) => (
          <AdminCard description={`${referral.active} active users`} key={referral.referrer} title={referral.referrer}>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Metric label="Signups" value={referral.signups} />
              <Metric label="Active" value={referral.active} />
              <Metric label="Reward" value={referral.reward} />
            </div>
          </AdminCard>
        ))}
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}
