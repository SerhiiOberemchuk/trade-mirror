"use server";

import { db } from "@/db";
import { kycRequests } from "@/db/schema";
import { requireSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

const VERIFICATION_PATH = "/verification";
const ADMIN_KYC_PATH = "/admin/kyc";
const VALID_DOCUMENT_TYPES = ["identity", "address", "business"] as const;

type KycDocumentType = (typeof VALID_DOCUMENT_TYPES)[number];

export async function submitKycRequestAction(formData: FormData) {
  const session = await requireSession();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "identity");
  const documentReference = String(formData.get("documentReference") ?? "").trim();

  if (legalName.length < 3 || legalName.length > 120) {
    throw new Error("Legal name must be 3-120 characters.");
  }

  if (country.length < 2 || country.length > 80) {
    throw new Error("Country must be 2-80 characters.");
  }

  if (!isKycDocumentType(documentType)) {
    throw new Error("Document type is invalid.");
  }

  if (documentReference.length < 4 || documentReference.length > 160) {
    throw new Error("Document reference must be 4-160 characters.");
  }

  await db.insert(kycRequests).values({
    country,
    documentReference,
    documentType,
    legalName,
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  revalidatePath(VERIFICATION_PATH);
  revalidatePath(ADMIN_KYC_PATH);
}

function isKycDocumentType(documentType: string): documentType is KycDocumentType {
  return VALID_DOCUMENT_TYPES.includes(documentType as KycDocumentType);
}
