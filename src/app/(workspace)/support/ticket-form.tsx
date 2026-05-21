"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createSupportTicketAction,
  type SupportTicketActionState,
} from "./actions";

const initialState: SupportTicketActionState = {
  message: "",
  status: "idle",
};

export function SupportTicketForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(
    createSupportTicketAction,
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
          <span className="text-sm font-medium">Subject</span>
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            maxLength={120}
            minLength={4}
            name="subject"
            placeholder="Withdrawal review question"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Priority</span>
          <select
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            defaultValue="medium"
            name="priority"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Message</span>
          <textarea
            className="mt-2 min-h-36 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            maxLength={2000}
            minLength={10}
            name="message"
            placeholder="Describe what you need help with."
            required
          />
        </label>

        <button
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Submitting..." : "Submit ticket"}
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
