import { faqItems } from "@/data/marketing";
import { PageHero, PublicShell } from "@/components/public-shell";

export default function FaqPage() {
  return (
    <PublicShell>
      <PageHero
        description="FAQ content clarifies the product concept, demo boundaries, and implemented simulation workflows."
        eyebrow="Questions"
        title="TradeMirror FAQ"
      >
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm leading-6 text-muted">
            This page is intentionally practical: it should answer product questions before a user enters the dashboard.
          </p>
        </div>
      </PageHero>

      <section className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {faqItems.map(([question, answer]) => (
            <article className="p-5" key={question}>
              <h2 className="font-semibold">{question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
