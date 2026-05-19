import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <div className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            Account access
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Sign in to the simulated trading workspace
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            This screen previews authentication UX. Real session logic will be added after the public design is approved.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-4">
            <Field label="Email" placeholder="trader@example.com" />
            <Field label="Password" placeholder="Enter password" type="password" />
            <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950">
              Log in
            </button>
          </div>
          <p className="mt-5 text-sm text-muted">
            New to TradeMirror?{" "}
            <Link className="font-medium text-primary" href={routes.register}>
              Create demo account
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
