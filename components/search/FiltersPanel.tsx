"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import type { Filters } from "./types";

const PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "X", "TWITCH"] as const;
const COUNTRIES = ["US", "GB", "FR", "DE", "IT", "ES", "JP", "BR", "MX", "CA", "AU", "KR"];
const LANGS = ["en", "fr", "de", "it", "es", "ja", "ko", "pt"];
const CATEGORIES = ["wine", "fitness", "beauty", "tech", "parenting", "gaming", "travel", "food"];
const RECENCY = [
  { label: "7 days", v: 7 },
  { label: "30 days", v: 30 },
  { label: "90 days", v: 90 },
];

export function FiltersPanel({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  function toggle<T extends string>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  return (
    <aside className="w-full md:w-80 shrink-0 space-y-10 text-sm bg-white p-8 shadow-soft sticky top-32" aria-label={t.search.filtersTitle}>
      <h2 className="font-display text-2xl font-bold text-ink mb-6">{t.search.filtersTitle}</h2>

      <div className="space-y-4">
        <div className="font-display text-sm font-bold uppercase tracking-wider text-muted">{t.search.platform}</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...value, platforms: toggle(value.platforms, p) })}
              className={`px-3 py-2 rounded-sm border-2 text-xs font-bold transition-all ${
                value.platforms.includes(p) 
                ? "bg-sunset border-sunset text-white shadow-md scale-105" 
                : "border-accent bg-canvas text-body hover:border-sunset/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="follmin" className="font-display text-sm font-bold uppercase tracking-wider text-muted">{t.search.followerRange}</Label>
        <div className="flex gap-3">
          <Input
            id="follmin"
            type="number"
            placeholder="Min"
            value={value.followersMin ?? ""}
            className="h-10 text-xs"
            onChange={(e) => onChange({ ...value, followersMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={value.followersMax ?? ""}
            className="h-10 text-xs"
            onChange={(e) => onChange({ ...value, followersMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Label className="font-display text-sm font-bold uppercase tracking-wider text-muted block">
          {t.search.minEngagement} <span className="text-sunset ml-1">{((value.engagementMin ?? 0) * 100).toFixed(1)}%</span>
        </Label>
        <Slider
          min={0}
          max={0.1}
          step={0.005}
          value={[value.engagementMin ?? 0]}
          onValueChange={([v]) => onChange({ ...value, engagementMin: v ?? 0 })}
          className="py-2"
        />
      </div>

      <div className="space-y-4">
        <div className="font-display text-sm font-bold uppercase tracking-wider text-muted">{t.search.country}</div>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...value, countries: toggle(value.countries, c) })}
              className={`w-10 h-10 flex items-center justify-center rounded-sm border-2 text-xs font-bold transition-all ${
                value.countries.includes(c) 
                ? "bg-ocean border-ocean text-white shadow-md scale-105" 
                : "border-accent bg-canvas text-body hover:border-ocean/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="font-display text-sm font-bold uppercase tracking-wider text-muted">{t.search.category}</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...value, categories: toggle(value.categories, c) })}
              className={`px-3 py-1.5 rounded-sm border-2 text-xs font-bold transition-all ${
                value.categories.includes(c) 
                ? "bg-ink border-ink text-white shadow-md" 
                : "border-accent bg-canvas text-body hover:border-ink/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="font-display text-sm font-bold uppercase tracking-wider text-muted">{t.search.activeWithin}</div>
        <div className="flex gap-2">
          {RECENCY.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => onChange({ ...value, activeWithinDays: value.activeWithinDays === r.v ? undefined : r.v })}
              className={`flex-1 py-2 rounded-sm border-2 text-xs font-bold transition-all ${
                value.activeWithinDays === r.v 
                ? "bg-sunset border-sunset text-white" 
                : "border-accent bg-canvas text-body"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </aside>

  );
}
