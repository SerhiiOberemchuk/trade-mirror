import { RegisterForm } from "@/components/auth/register-form";
import { PublicShell } from "@/components/public-shell";

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
            Create an account, verify your email, and continue into the simulated trading dashboard.
          </p>
        </div>

        <RegisterForm />
      </section>
    </PublicShell>
  );
}
