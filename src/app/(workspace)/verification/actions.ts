"use server";

import { db } from "@/db";
import { kycDocumentTypeEnum, kycRequestsSchema } from "@/db/schema/kyc.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";

const VERIFICATION_PATH = "/verification";
const ADMIN_KYC_PATH = "/admin/kyc";

type KycDocumentType = (typeof kycDocumentTypeEnum.enumValues)[number];

export type KycRequestActionState = ActionResult;

export async function submitKycRequestAction(
  _state: KycRequestActionState,
  formData: FormData,
): Promise<KycRequestActionState> {
  const session = await requireSession();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "identity");
  const documentReference = String(
    formData.get("documentReference") ?? "",
  ).trim();

  if (legalName.length < 3 || legalName.length > 120) {
    return actionError("Legal name must be 3-120 characters.");
  }

  if (country.length < 2 || country.length > 80) {
    return actionError("Country must be 2-80 characters.");
  }

  if (!isKycDocumentType(documentType)) {
    return actionError("Document type is invalid.");
  }

  if (documentReference.length < 4 || documentReference.length > 160) {
    return actionError("Document reference must be 4-160 characters.");
  }

  try {
    await db.insert(kycRequestsSchema).values({
      country,
      documentReference,
      documentType,
      legalName,
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
    });

    invalidateAfterMutation({
      paths: [VERIFICATION_PATH, ADMIN_KYC_PATH],
      tags: [cacheTags.userVerification(session.user.id), CACHE_TAGS.adminKyc],
    });

    return actionSuccess("Verification request submitted for admin review.");
  } catch {
    return actionError("Unable to submit this verification request. Please try again.");
  }
}

function isKycDocumentType(
  documentType: string,
): documentType is KycDocumentType {
  return kycDocumentTypeEnum.enumValues.includes(
    documentType as KycDocumentType,
  );
}
