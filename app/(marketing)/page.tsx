import { LandingHero } from "@/components/marketing/LandingHero";
import { t } from "@/lib/i18n";

export default function HomePage() {
  return (
    <div className="container max-w-7xl pb-32">
      <LandingHero />
      
      <section className="mt-32 grid gap-12 md:grid-cols-3">
        <div className="bg-white p-10 shadow-soft animate-reveal-up [animation-delay:600ms] opacity-0 flex flex-col justify-between">
          <div>
            <div className="text-5xl font-display font-bold text-sunset/20 mb-6">01</div>
            <h3 className="text-2xl font-display font-bold text-ink mb-4">Paste your URL</h3>
            <p className="text-lg text-body">We crawl your homepage and a handful of product/About pages — no install, no integrations.</p>
          </div>
        </div>
        
        <div className="bg-white p-10 shadow-soft animate-reveal-up [animation-delay:700ms] opacity-0 flex flex-col justify-between">
          <div>
            <div className="text-5xl font-display font-bold text-ocean/20 mb-6">02</div>
            <h3 className="text-2xl font-display font-bold text-ink mb-4">We infer your niche</h3>
            <p className="text-lg text-body">Claude reads your copy and pins your sub-niche, audience, tone, and price tier.</p>
          </div>
        </div>
        
        <div className="bg-white p-10 shadow-soft animate-reveal-up [animation-delay:800ms] opacity-0 flex flex-col justify-between">
          <div>
            <div className="text-5xl font-display font-bold text-ink/10 mb-6">03</div>
            <h3 className="text-2xl font-display font-bold text-ink mb-4">Ranked creator matches</h3>
            <p className="text-lg text-body">A transparent score per creator: niche fit, audience overlap, engagement, recency.</p>
          </div>
        </div>
      </section>

      <div className="mt-48 text-center animate-reveal-up [animation-delay:1000ms] opacity-0">
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-8">{t.landing.proofTitle}</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale contrast-125">
           {/* Placeholders for logos or social proof */}
           <div className="h-8 w-32 bg-ink/20 rounded-full" />
           <div className="h-8 w-24 bg-ink/20 rounded-full" />
           <div className="h-8 w-40 bg-ink/20 rounded-full" />
           <div className="h-8 w-28 bg-ink/20 rounded-full" />
        </div>
      </div>
    </div>

  );
}
