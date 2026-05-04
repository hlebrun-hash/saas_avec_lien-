import { LandingHero } from "@/components/marketing/LandingHero";
import { t } from "@/lib/i18n";

export default function HomePage() {
  return (
    <div className="container max-w-5xl py-16 md:py-24">
      <LandingHero />
      <section className="mt-24 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <h3 className="font-semibold mb-2">1. Paste your URL</h3>
          <p className="text-muted-foreground">We crawl your homepage and a handful of product/About pages — no install, no integrations.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">2. We infer your niche</h3>
          <p className="text-muted-foreground">Claude reads your copy and pins your sub-niche, audience, tone, and price tier.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">3. Ranked creator matches</h3>
          <p className="text-muted-foreground">A transparent score per creator: niche fit, audience overlap, engagement, recency.</p>
        </div>
      </section>
      <p className="mt-24 text-center text-sm text-muted-foreground">{t.landing.proofTitle}</p>
    </div>
  );
}
