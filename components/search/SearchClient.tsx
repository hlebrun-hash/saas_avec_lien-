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
    <div className="container py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-4">{t.search.title}</h1>
      <URLInputForm initial={initialUrl} onSubmit={startAnalysis} disabled={phase === "submitting" || phase === "polling"} />

      {phase === "submitting" || phase === "polling" ? (
        <div className="mt-8 text-center text-muted-foreground" role="status" aria-live="polite">
          {t.search.analyzing}
        </div>
      ) : null}

      {phase === "error" && (
        <div className="mt-8 text-center text-destructive" role="alert">
          {errorMsg ?? t.search.failed}
        </div>
      )}

      {phase === "ready" && results && (
        <div className="mt-8 flex flex-col md:flex-row gap-8">
          <FiltersPanel value={filters} onChange={setFilters} />
          <div className="flex-1 space-y-3">
            <div className="text-sm text-muted-foreground">
              {results.total} matches · plan: <b>{results.plan}</b>
              {results.truncatedByPlan && " (top-N gated by plan)"}
            </div>
            {results.items.map(({ creator, score }) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                score={score}
                saved={savedIds.has(creator.id)}
                onSave={() => handleSave(creator.id, score)}
                contactInfoUnlocked={results.contactInfoUnlocked}
              />
            ))}
            {!results.items.length && <p className="text-sm text-muted-foreground">No creators match these filters.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
