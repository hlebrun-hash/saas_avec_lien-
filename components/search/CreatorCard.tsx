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
    <Card data-testid="creator-card">
      <CardContent className="p-4 flex gap-4 items-start">
        <div className="h-12 w-12 rounded-full bg-muted shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate">@{creator.handle}</span>
            <Badge variant="outline">{creator.platform}</Badge>
            <Badge variant="secondary">{creator.country}</Badge>
            <span className="text-xs text-muted-foreground">{creator.language}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatNumber(creator.followers)} followers · {formatPercent(creator.engagementRate)} ER · {formatNumber(creator.avgViews)} avg views
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {creator.categories.map((c) => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </div>
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-muted-foreground">Score breakdown</summary>
            <ul className="mt-2 space-y-1 grid grid-cols-2 gap-x-3">
              <li>Niche fit: <b>{score.niche_fit.toFixed(2)}</b></li>
              <li>Audience: <b>{score.audience_overlap.toFixed(2)}</b></li>
              <li>Engagement: <b>{score.engagement_quality.toFixed(2)}</b></li>
              <li>Recency: <b>{score.recency.toFixed(2)}</b></li>
              <li>Brand safety: <b>{score.brand_safety.toFixed(2)}</b></li>
            </ul>
          </details>
          {creator.contactEmail && contactInfoUnlocked && (
            <div className="mt-2 text-xs">📧 {creator.contactEmail}</div>
          )}
          {!contactInfoUnlocked && (
            <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> {t.search.contactLocked}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{t.search.score}</div>
            <div className="text-2xl font-bold">{score.final.toFixed(2)}</div>
          </div>
          {onSave && (
            <Button size="sm" variant={saved ? "secondary" : "outline"} onClick={onSave}>
              {saved ? t.search.saved : t.search.save}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
