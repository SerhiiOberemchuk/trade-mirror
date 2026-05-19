"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AUTH_PASSWORD_POLICY } from "@/lib/auth-password-policy";

export function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = [firstName, lastName].filter(Boolean).join(" ");

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });

    setIsPending(false);

    if (error) {
      setErrorMessage(error.message ?? "Unable to create this account.");
      return;
    }

    event.currentTarget.reset();
    setNotice("Account created. Check your email and verify the address before logging in.");
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <Field
          autoComplete="given-name"
          label="First name"
          name="firstName"
          placeholder="Mira"
        />
        <Field
          autoComplete="family-name"
          label="Last name"
          name="lastName"
          placeholder="Quant"
        />
        <div className="sm:col-span-2">
          <Field
            autoComplete="email"
            label="Email"
            name="email"
            placeholder="trader@example.com"
            type="email"
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            autoComplete="new-password"
            label="Password"
            maxLength={AUTH_PASSWORD_POLICY.maxLength}
            minLength={AUTH_PASSWORD_POLICY.minLength}
            name="password"
            placeholder="Create password"
            type="password"
          />
        </div>
        <button
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creating account..." : "Open demo account"}
        </button>
      </form>

      {notice ? <p className="mt-4 text-sm leading-6 text-primary">{notice}</p> : null}
      {errorMessage ? <p className="mt-4 text-sm leading-6 text-danger">{errorMessage}</p> : null}

      <p className="mt-5 text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-primary" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  autoComplete,
  maxLength,
  minLength,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  maxLength?: number;
  minLength?: number;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
