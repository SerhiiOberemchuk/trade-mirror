import { db } from "@/db";
import { kycRequestsSchema } from "@/db/schema/kyc.schema";
import {
  ActionToolbar,
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc } from "drizzle-orm";
import { approveKycRequestAction, rejectKycRequestAction } from "./actions";

type KycReviewRow = {
  id: string;
  user: string;
  legalName: string;
  country: string;
  documentType: "identity" | "address" | "business";
  documentReference: string;
  status: "pending" | "approved" | "rejected";
  submitted: string;
  reviewNote: string | null;
};

const kycColumns = [
  {
    header: "Applicant",
    cell: (request) => (
      <div>
        <p className="font-medium">{request.legalName}</p>
        <p className="mt-1 text-xs text-muted">{request.user}</p>
      </div>
    ),
  },
  {
    header: "Country",
    cell: (request) => <span className="text-muted">{request.country}</span>,
  },
  {
    header: "Document",
    cell: (request) => (
      <div>
        <p>{formatDocumentType(request.documentType)}</p>
        <p className="mt-1 font-mono text-xs text-muted">
          {request.documentReference}
        </p>
      </div>
    ),
  },
  {
    header: "Status",
    cell: (request) => (
      <StatusBadge tone={getStatusTone(request.status)}>
        {request.status}
      </StatusBadge>
    ),
  },
  {
    header: "Submitted",
    cell: (request) => (
      <span className="font-mono text-muted">{request.submitted}</span>
    ),
  },
  {
    header: "Actions",
    cell: (request) => <KycActions request={request} />,
  },
] as const satisfies readonly DataTableColumn<KycReviewRow>[];

export default async function AdminKycPage() {
  const state = await getKycReviewRows();

  return (
    <>
      <AdminPageHeader
        description="Review simulated KYC requests submitted from user verification."
        title="KYC Review"
      />

      <AdminCard
        description="Pending and reviewed verification requests"
        title="Verification queue"
      >
        {state.kind === "ready" && state.rows.length > 0 ? (
          <DataTable
            columns={kycColumns}
            getRowKey={(request) => request.id}
            minWidth="1080px"
            rows={state.rows}
          />
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="Verification requests will appear here after users submit KYC information."
            title="No KYC requests"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using persisted KYC review."
            title="KYC table is not ready"
          />
        ) : null}
      </AdminCard>
    </>
  );
}

function KycActions({ request }: { request: KycReviewRow }) {
  if (request.status !== "pending") {
    return (
      <div className="max-w-72 text-xs leading-5 text-muted">
        {request.reviewNote ?? "Reviewed"}
      </div>
    );
  }

  return (
    <div className="min-w-72 space-y-3">
      <textarea
        className="min-h-20 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
        form={`approve-${request.id}`}
        maxLength={500}
        name="reviewNote"
        placeholder="Optional review note"
      />
      <ActionToolbar>
        <form action={approveKycRequestAction} id={`approve-${request.id}`}>
          <input name="requestId" type="hidden" value={request.id} />
          <button
            className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
            type="submit"
          >
            Approve
          </button>
        </form>
        <form action={rejectKycRequestAction}>
          <input name="requestId" type="hidden" value={request.id} />
          <input name="reviewNote" type="hidden" value="Rejected by admin." />
          <button
            className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400"
            type="submit"
          >
            Reject
          </button>
        </form>
      </ActionToolbar>
    </div>
  );
}

async function getKycReviewRows(): Promise<
  { kind: "ready"; rows: KycReviewRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(kycRequestsSchema)
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
        user: row.userName,
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

function formatDocumentType(documentType: KycReviewRow["documentType"]) {
  if (documentType === "address") {
    return "Address proof";
  }

  if (documentType === "business") {
    return "Business document";
  }

  return "Identity document";
}

function getStatusTone(status: KycReviewRow["status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}
