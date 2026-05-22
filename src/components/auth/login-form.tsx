"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "@/components/auth/password-field";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/workspace",
    });

    setIsPending(false);

    if (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setNotice("Email is not verified. A new verification link was sent if the account exists.");
        return;
      }

      setErrorMessage(error.message ?? "Unable to log in with these credentials.");
      return;
    }

    router.push("/workspace" as Route);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="trader@example.com"
          type="email"
        />
        <PasswordField
          autoComplete="current-password"
          label="Password"
          name="password"
          placeholder="Enter password"
        />
        <button
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      {notice ? <p className="mt-4 text-sm leading-6 text-primary">{notice}</p> : null}
      {errorMessage ? <p className="mt-4 text-sm leading-6 text-danger">{errorMessage}</p> : null}

      <p className="mt-5 text-sm text-muted">
        New to TradeMirror?{" "}
        <Link className="font-medium text-primary" href="/register">
          Create demo account
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  autoComplete,
  name,
  placeholder,
  type,
}: {
  label: string;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  name: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        autoComplete={autoComplete}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
