"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

export function LandingHero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("scheme");
    } catch {
      setError(t.errors.invalidUrl);
      return;
    }
    router.push(`/search?url=${encodeURIComponent(url)}`);
  }

  return (
    <div className="text-center py-24 space-y-12">
      <h1 className="text-6xl md:text-8xl font-display font-semibold tracking-tight text-ink leading-[1.05] animate-reveal-up">
        {t.landing.heroTitle}
      </h1>
      <p className="text-xl md:text-2xl text-body max-w-3xl mx-auto leading-relaxed animate-reveal-up [animation-delay:200ms] opacity-0">
        {t.landing.heroSubtitle}
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto pt-8 animate-reveal-up [animation-delay:400ms] opacity-0" aria-label="Analyze website URL">
        <Input
          type="url"
          inputMode="url"
          placeholder={t.landing.placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-16 text-lg px-6 bg-white border-2 border-accent/50 focus:border-sunset"
          aria-label="Website URL"
          aria-invalid={!!error}
          required
        />
        <Button type="submit" size="lg" className="h-16 px-12 text-lg font-bold">
          {t.landing.cta}
        </Button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{error}</p>}
    </div>

  );
}
