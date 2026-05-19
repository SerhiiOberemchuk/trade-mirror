import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { routes } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <div className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            Demo onboarding
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Create a simulated copy trading account
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            Registration is a visual prototype for now. The next phase can connect validation, auth, roles, and protected routes.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" placeholder="Mira" />
            <Field label="Last name" placeholder="Quant" />
            <div className="sm:col-span-2">
              <Field label="Email" placeholder="trader@example.com" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Password" placeholder="Create password" type="password" />
            </div>
            <button className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 sm:col-span-2">
              Open demo account
            </button>
          </div>
          <p className="mt-5 text-sm text-muted">
            Already have an account?{" "}
            <Link className="font-medium text-primary" href={routes.login}>
              Log in
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
