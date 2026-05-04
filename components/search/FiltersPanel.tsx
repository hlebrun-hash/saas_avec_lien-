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
    <aside className="w-full md:w-72 shrink-0 space-y-6 text-sm" aria-label={t.search.filtersTitle}>
      <h2 className="font-semibold">{t.search.filtersTitle}</h2>

      <div>
        <div className="mb-2 font-medium">{t.search.platform}</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <label key={p} className="flex items-center gap-2 text-xs">
              <Checkbox
                checked={value.platforms.includes(p)}
                onCheckedChange={() => onChange({ ...value, platforms: toggle(value.platforms, p) })}
                aria-label={p}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="follmin" className="mb-2 block">{t.search.followerRange}</Label>
        <div className="flex gap-2">
          <Input
            id="follmin"
            type="number"
            placeholder="min"
            value={value.followersMin ?? ""}
            onChange={(e) => onChange({ ...value, followersMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="max"
            value={value.followersMax ?? ""}
            onChange={(e) => onChange({ ...value, followersMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">
          {t.search.minEngagement} ({((value.engagementMin ?? 0) * 100).toFixed(1)}%)
        </Label>
        <Slider
          min={0}
          max={0.1}
          step={0.005}
          value={[value.engagementMin ?? 0]}
          onValueChange={([v]) => onChange({ ...value, engagementMin: v ?? 0 })}
        />
      </div>

      <div>
        <div className="mb-2 font-medium">{t.search.country}</div>
        <div className="flex flex-wrap gap-1">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...value, countries: toggle(value.countries, c) })}
              className={`px-2 py-0.5 rounded border text-xs ${value.countries.includes(c) ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
              aria-pressed={value.countries.includes(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-medium">{t.search.language}</div>
        <div className="flex flex-wrap gap-1">
          {LANGS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...value, languages: toggle(value.languages, c) })}
              className={`px-2 py-0.5 rounded border text-xs ${value.languages.includes(c) ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
              aria-pressed={value.languages.includes(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-medium">{t.search.category}</div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...value, categories: toggle(value.categories, c) })}
              className={`px-2 py-0.5 rounded border text-xs ${value.categories.includes(c) ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
              aria-pressed={value.categories.includes(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-medium">{t.search.activeWithin}</div>
        <div className="flex gap-2">
          {RECENCY.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => onChange({ ...value, activeWithinDays: value.activeWithinDays === r.v ? undefined : r.v })}
              className={`px-2 py-1 rounded border text-xs ${value.activeWithinDays === r.v ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
