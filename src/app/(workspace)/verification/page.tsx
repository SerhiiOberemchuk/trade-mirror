import { db } from "@/db";
import { kycRequestsSchema } from "@/db/schema/kyc.schema";
import { requireSession } from "@/server/auth/session";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-shell";
import { desc, eq } from "drizzle-orm";
import { submitKycRequestAction } from "./actions";

type KycRequestRow = {
  id: string;
  legalName: string;
  country: string;
  documentType: "identity" | "address" | "business";
  documentReference: string;
  status: "pending" | "approved" | "rejected";
  submitted: string;
  reviewNote: string | null;
};

export default async function VerificationPage() {
  const session = await requireSession();
  const state = await getUserKycRequests(session.user.id);

  return (
    <>
      <DashboardPageHeader
        description="Simulated KYC verification requests with admin approval and rejection states."
        title="Verification"
      />

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardCard
          description="Submit a simulated document review request"
          title="Verification request"
        >
          <form action={submitKycRequestAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Legal name</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={120}
                minLength={3}
                name="legalName"
                placeholder="Serhii Oberemchuk"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Country</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={80}
                minLength={2}
                name="country"
                placeholder="Ukraine"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Document type</span>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="identity"
                name="documentType"
              >
                <option value="identity">Identity document</option>
                <option value="address">Address proof</option>
                <option value="business">Business document</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Document reference</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={160}
                minLength={4}
                name="documentReference"
                placeholder="Demo upload ID or file reference"
              />
            </label>

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
              type="submit"
            >
              Submit verification
            </button>
          </form>
        </DashboardCard>

        <DashboardCard
          description="Your persisted simulated KYC requests"
          title="Verification history"
        >
          {state.kind === "ready" && state.rows.length > 0 ? (
            <div className="space-y-3">
              {state.rows.map((request) => (
                <article
                  className="rounded-lg border border-border bg-background p-4"
                  key={request.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{request.legalName}</p>
                      <p className="mt-1 text-sm text-muted">
                        {request.country} /{" "}
                        {formatDocumentType(request.documentType)}
                      </p>
                      <p className="mt-2 font-mono text-xs text-muted">
                        {request.documentReference}
                      </p>
                    </div>
                    <StatusBadge tone={getStatusTone(request.status)}>
                      {request.status}
                    </StatusBadge>
                  </div>
                  {request.reviewNote ? (
                    <p className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm leading-6 text-muted">
                      {request.reviewNote}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted">
                    Submitted {request.submitted}
                  </p>
                </article>
              ))}
            </div>
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Submit a verification request and it will appear in the admin KYC review queue."
              title="No verification requests"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="The KYC table is not available yet. Apply the generated Drizzle migration before submitting verification requests."
              title="Verification requests are not ready"
            />
          ) : null}
        </DashboardCard>
      </section>
    </>
  );
}

async function getUserKycRequests(
  userId: string,
): Promise<
  { kind: "ready"; rows: KycRequestRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(kycRequestsSchema)
      .where(eq(kycRequestsSchema.userId, userId))
      .orderBy(desc(kycRequestsSchema.submittedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        country: row.country,
        documentReference: row.documentReference,
        documentType: row.documentType,
        id: row.id,
        legalName: row.legalName,
        reviewNote: row.reviewNote,
        status: row.status,
        submitted: formatDate(row.submittedAt),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDocumentType(documentType: KycRequestRow["documentType"]) {
  if (documentType === "address") {
    return "Address proof";
  }

  if (documentType === "business") {
    return "Business document";
  }

  return "Identity document";
}

function getStatusTone(status: KycRequestRow["status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}
