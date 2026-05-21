"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitKycRequestAction,
  type KycRequestActionState,
} from "./actions";

const initialState: KycRequestActionState = {
  message: "",
  status: "idle",
};

export function VerificationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(
    submitKycRequestAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form action={action} className="space-y-4" ref={formRef}>
      <fieldset className="space-y-4 disabled:opacity-60" disabled={isPending}>
        <label className="block">
          <span className="text-sm font-medium">Legal name</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            maxLength={120}
            minLength={3}
            name="legalName"
            placeholder="Mira Quant"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Country</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            maxLength={80}
            minLength={2}
            name="country"
            placeholder="United States"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Document type</span>
          <select
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            defaultValue="identity"
            name="documentType"
            required
        >
          <option value="identity">Identity</option>
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
            placeholder="DEMO-DOC-1234"
            required
          />
        </label>

        <button
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Submitting..." : "Submit verification"}
        </button>
      </fieldset>

      {state.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium leading-6 ${
            state.status === "success"
              ? "border-success/40 bg-success/10 text-emerald-200"
              : "border-danger/40 bg-danger/10 text-red-200"
          }`}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
