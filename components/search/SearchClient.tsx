"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { URLInputForm } from "./URLInputForm";
import { FiltersPanel } from "./FiltersPanel";
import { CreatorCard } from "./CreatorCard";
import { t } from "@/lib/i18n";
import { DEFAULT_FILTERS, type Filters, type SearchResults } from "./types";

type Phase = "idle" | "submitting" | "polling" | "ready" | "error";

function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.platforms.length) p.set("platforms", f.platforms.join(","));
  if (f.countries.length) p.set("countries", f.countries.join(","));
  if (f.languages.length) p.set("languages", f.languages.join(","));
  if (f.categories.length) p.set("categories", f.categories.join(","));
  if (f.followersMin !== undefined) p.set("followersMin", String(f.followersMin));
  if (f.followersMax !== undefined) p.set("followersMax", String(f.followersMax));
  if (f.engagementMin) p.set("engagementMin", String(f.engagementMin));
  if (f.activeWithinDays) p.set("activeWithinDays", String(f.activeWithinDays));
  return p;
}

function paramsToFilters(sp: URLSearchParams): Filters {
  return {
    platforms: sp.get("platforms")?.split(",").filter(Boolean) ?? [],
    countries: sp.get("countries")?.split(",").filter(Boolean) ?? [],
    languages: sp.get("languages")?.split(",").filter(Boolean) ?? [],
    categories: sp.get("categories")?.split(",").filter(Boolean) ?? [],
    followersMin: sp.get("followersMin") ? Number(sp.get("followersMin")) : undefined,
    followersMax: sp.get("followersMax") ? Number(sp.get("followersMax")) : undefined,
    engagementMin: sp.get("engagementMin") ? Number(sp.get("engagementMin")) : undefined,
    activeWithinDays: sp.get("activeWithinDays") ? Number(sp.get("activeWithinDays")) : undefined,
  };
}

export function SearchClient({ initialUrl }: { initialUrl: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(searchParams.get("job"));
  const [results, setResults] = useState<SearchResults | null>(null);
  const [filters, setFilters] = useState<Filters>(() => paramsToFilters(searchParams));
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [defaultShortlistId, setDefaultShortlistId] = useState<string | null>(null);

  const startedRef = useRef(false);

  const startAnalysis = useCallback(async (url: string) => {
    setPhase("submitting");
    setErrorMsg(null);
    setResults(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      let j: { ok: boolean; data?: { jobId: string }; message?: string };
      try {
        j = await r.json();
      } catch {
        // Server returned non-JSON (HTML 500) — show HTTP status
        setPhase("error");
        setErrorMsg(`Server error (HTTP ${r.status}). Check terminal for details.`);
        return;
      }
      if (!j.ok) {
        setPhase("error");
        setErrorMsg(j.message ?? t.search.failed);
        return;
      }
      setJobId(j.data!.jobId);
      setPhase("polling");
    } catch (e) {
      setPhase("error");
      setErrorMsg(`Network error: ${(e as Error).message}`);
    }
  }, []);

  // Auto-start if initialUrl was passed and no job yet
  useEffect(() => {
    if (!startedRef.current && initialUrl && !jobId) {
      startedRef.current = true;
      void startAnalysis(initialUrl);
    }
  }, [initialUrl, jobId, startAnalysis]);

  // Poll job
  useEffect(() => {
    if (phase !== "polling" || !jobId) return;
    const id = setInterval(async () => {
      const r = await fetch(`/api/jobs/${jobId}`);
      const j = await r.json();
      if (!j.ok) return;
      if (j.data.status === "COMPLETED") {
        clearInterval(id);
        setPhase("ready");
      } else if (j.data.status === "FAILED") {
        clearInterval(id);
        setPhase("error");
        setErrorMsg(j.data.error ?? t.search.failed);
      }
    }, 1200);
    return () => clearInterval(id);
  }, [phase, jobId]);

  // Search creators when ready or filters change
  const runSearch = useCallback(async () => {
    if (!jobId) return;
    const r = await fetch("/api/creators/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, filters }),
    });
    const j = await r.json();
    if (j.ok) setResults(j.data as SearchResults);
  }, [jobId, filters]);

  useEffect(() => {
    if (phase !== "ready") return;
    void runSearch();
  }, [phase, runSearch]);

  // Sync filters → URL
  useEffect(() => {
    const p = filtersToParams(filters);
    if (jobId) p.set("job", jobId);
    router.replace(`/search?${p.toString()}`, { scroll: false });
  }, [filters, jobId, router]);

  // Ensure a default shortlist exists when needed
  async function ensureShortlist(): Promise<string | null> {
    if (defaultShortlistId) return defaultShortlistId;
    const list = await fetch("/api/shortlists").then((r) => r.json());
    if (list.ok && list.data.length) {
      setDefaultShortlistId(list.data[0].id);
      return list.data[0].id;
    }
    const created = await fetch("/api/shortlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My shortlist" }),
    }).then((r) => r.json());
    if (created.ok) {
      setDefaultShortlistId(created.data.id);
      return created.data.id;
    }
    return null;
  }

  async function handleSave(creatorId: string, score: unknown) {
    const sid = await ensureShortlist();
    if (!sid) return;
    const r = await fetch(`/api/shortlists/${sid}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId, scoreSnapshot: score }),
    });
    if (r.ok) setSavedIds((prev) => new Set(prev).add(creatorId));
  }

  return (
    <div className="container max-w-7xl pb-24">
      <div className="py-20 text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-display font-semibold tracking-tight text-ink max-w-4xl mx-auto leading-[1.1]">
          {t.search.title}
        </h1>
        <p className="text-xl text-body max-w-2xl mx-auto">
          {t.landing.subtitle}
        </p>
        <div className="pt-4">
          <URLInputForm initial={initialUrl} onSubmit={startAnalysis} disabled={phase === "submitting" || phase === "polling"} />
        </div>
      </div>

      <div className="min-h-[400px]">
        {phase === "submitting" || phase === "polling" ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse" role="status" aria-live="polite">
            <div className="h-12 w-12 border-4 border-sunset border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium text-body">{t.search.analyzing}</p>
          </div>
        ) : null}

        {phase === "error" && (
          <div className="max-w-md mx-auto mt-12 p-6 bg-destructive/10 border border-destructive/20 rounded-sm text-center" role="alert">
            <p className="text-destructive font-semibold mb-2">Analysis failed</p>
            <p className="text-sm text-destructive/80">{errorMsg ?? t.search.failed}</p>
          </div>
        )}

        {phase === "ready" && results && (
          <div className="mt-12 flex flex-col md:flex-row gap-12 items-start">
            <FiltersPanel value={filters} onChange={setFilters} />
            
            <div className="flex-1 w-full space-y-6">
              <div className="flex items-center justify-between border-b border-accent pb-4">
                <div className="text-lg font-display font-bold text-ink">
                  {results.total} <span className="text-muted font-sans font-medium text-sm ml-2">creators found</span>
                </div>
                <div className="text-sm font-medium px-3 py-1 bg-surface-sand rounded-sm text-ink">
                  Plan: <span className="font-bold text-ocean uppercase">{results.plan}</span>
                </div>
              </div>

              <div className="grid gap-6">
                {results.items.map(({ creator, score }, idx) => (
                  <div key={creator.id} style={{ animationDelay: `${idx * 100}ms` }}>
                    <CreatorCard
                      creator={creator}
                      score={score}
                      saved={savedIds.has(creator.id)}
                      onSave={() => handleSave(creator.id, score)}
                      contactInfoUnlocked={results.contactInfoUnlocked}
                    />
                  </div>
                ))}
              </div>

              {!results.items.length && (
                <div className="py-20 text-center border-2 border-dashed border-accent rounded-none">
                  <p className="text-body font-medium">No creators match these filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

