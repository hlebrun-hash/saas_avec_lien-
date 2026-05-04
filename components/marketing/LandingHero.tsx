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
    <div className="text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{t.landing.heroTitle}</h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{t.landing.heroSubtitle}</p>
      <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto" aria-label="Analyze website URL">
        <Input
          type="url"
          inputMode="url"
          placeholder={t.landing.placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-12 text-base"
          aria-label="Website URL"
          aria-invalid={!!error}
          required
        />
        <Button type="submit" size="lg" className="h-12 px-8">
          {t.landing.cta}
        </Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
