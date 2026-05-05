"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { CreatorRow, ScoreBreakdown } from "./types";
import { Lock } from "lucide-react";

export function CreatorCard({
  creator,
  score,
  saved,
  onSave,
  contactInfoUnlocked,
}: {
  creator: CreatorRow;
  score: ScoreBreakdown;
  saved?: boolean;
  onSave?: () => void;
  contactInfoUnlocked: boolean;
}) {
  return (
    <Card data-testid="creator-card" className="wow-reveal bg-white overflow-hidden group">
      <CardContent className="p-6 flex gap-6 items-start">
        <div className="h-16 w-16 rounded-none bg-surface-sand shrink-0 overflow-hidden relative" aria-hidden>
           <div className="absolute inset-0 bg-sunset/10 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display text-xl font-bold text-ink truncate">@{creator.handle}</span>
            <Badge className="rounded-sm bg-ocean text-white border-none">{creator.platform}</Badge>
            <Badge className="rounded-sm bg-surface-sand text-ink border-none">{creator.country}</Badge>
            <span className="text-sm font-medium text-muted">{creator.language}</span>
          </div>
          <div className="text-base text-body mt-2 font-medium">
            <span className="text-ink">{formatNumber(creator.followers)}</span> followers · <span className="text-ink">{formatPercent(creator.engagementRate)}</span> ER · <span className="text-ink">{formatNumber(creator.avgViews)}</span> avg views
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {creator.categories.map((c) => (
              <Badge key={c} variant="outline" className="rounded-sm border-accent text-body bg-canvas/50 px-3 py-1">{c}</Badge>
            ))}
          </div>
          <details className="mt-6 text-sm group/details">
            <summary className="cursor-pointer text-muted font-semibold hover:text-ink transition-colors list-none flex items-center gap-2">
              <span className="group-open/details:rotate-90 transition-transform">▸</span>
              {t.search.score} breakdown
            </summary>
            <ul className="mt-4 p-4 bg-canvas/30 rounded-sm space-y-2 grid grid-cols-2 gap-x-6 border border-accent/30">
              <li className="flex justify-between"><span>Niche fit:</span> <b className="text-ink">{score.niche_fit.toFixed(2)}</b></li>
              <li className="flex justify-between"><span>Audience:</span> <b className="text-ink">{score.audience_overlap.toFixed(2)}</b></li>
              <li className="flex justify-between"><span>Engagement:</span> <b className="text-ink">{score.engagement_quality.toFixed(2)}</b></li>
              <li className="flex justify-between"><span>Recency:</span> <b className="text-ink">{score.recency.toFixed(2)}</b></li>
              <li className="flex justify-between"><span>Brand safety:</span> <b className="text-ink">{score.brand_safety.toFixed(2)}</b></li>
            </ul>
          </details>
          {creator.contactEmail && contactInfoUnlocked && (
            <div className="mt-4 text-sm font-semibold text-ocean flex items-center gap-2">
              <span>📧</span> {creator.contactEmail}
            </div>
          )}
          {!contactInfoUnlocked && (
            <div className="mt-4 text-sm text-muted font-medium inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-sm">
              <Lock className="h-4 w-4" /> {t.search.contactLocked}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-6 h-full justify-between">
          <div className="text-right">
            <div className="text-sm font-semibold text-muted uppercase tracking-wider">{t.search.score}</div>
            <div className="text-4xl font-display font-bold text-sunset">{score.final.toFixed(0)}</div>
          </div>
          {onSave && (
            <Button size="lg" variant={saved ? "secondary" : "default"} onClick={onSave} className="w-full">
              {saved ? t.search.saved : t.search.save}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

  );
}
