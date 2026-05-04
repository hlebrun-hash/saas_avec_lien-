"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { ArrowLeft, Download } from "lucide-react";

interface Entry {
  id: string;
  addedAt: string;
  note: string | null;
  creator: {
    id: string;
    handle: string;
    platform: string;
    displayName: string;
    followers: number;
    engagementRate: number;
    country: string;
    categories: string[];
  };
}

interface Detail {
  id: string;
  name: string;
  entries: Entry[];
}

export function ShortlistDetail({
  id,
  canExport,
  onBack,
}: {
  id: string;
  canExport: boolean;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    fetch(`/api/shortlists/${id}`)
      .then((r) => r.json())
      .then((r) => { if (r.ok) setDetail(r.data); })
      .catch(() => {});
  }, [id]);

  async function remove(creatorId: string) {
    await fetch(`/api/shortlists/${id}/entries?creatorId=${creatorId}`, { method: "DELETE" });
    setDetail((d) => d ? { ...d, entries: d.entries.filter((e) => e.creator.id !== creatorId) } : null);
  }

  if (!detail) return <div className="container py-8">Loading…</div>;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-xl font-bold flex-1">{detail.name}</h1>
        {canExport && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/shortlists/${id}/export`} download>
              <Download className="h-4 w-4 mr-2" />{t.shortlists.export}
            </a>
          </Button>
        )}
        {!canExport && (
          <Button variant="outline" size="sm" disabled title="Upgrade to export CSV">
            <Download className="h-4 w-4 mr-2" />{t.shortlists.export}
          </Button>
        )}
      </div>
      {detail.entries.length === 0 && <p className="text-sm text-muted-foreground">No creators saved yet.</p>}
      <div className="space-y-2">
        {detail.entries.map((e) => (
          <div key={e.id} className="border rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">@{e.creator.handle}</span>
                <Badge variant="outline">{e.creator.platform}</Badge>
                <Badge variant="secondary">{e.creator.country}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatNumber(e.creator.followers)} followers · {formatPercent(e.creator.engagementRate)} ER
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {e.creator.categories.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(e.creator.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
