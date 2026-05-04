"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { ShortlistDetail } from "./ShortlistDetail";

interface ShortlistMeta {
  id: string;
  name: string;
  createdAt: string;
  entryCount: number;
}

export function ShortlistsClient() {
  const [lists, setLists] = useState<ShortlistMeta[]>([]);
  const [newName, setNewName] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [canExport, setCanExport] = useState(false);

  async function load() {
    const r = await fetch("/api/shortlists").then((x) => x.json());
    if (r.ok) setLists(r.data);
  }

  useEffect(() => {
    void load();
    // Check if user can export (plan gate)
    fetch("/api/creators/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signals: { niche: "test", sub_niches: [], audience: { age_range: "", gender_skew: "balanced", interests: [], geography: [], languages: [] }, brand_tone: [], price_tier: "unknown", keywords: ["test"] }, filters: {}, page: 1, pageSize: 1 }),
    })
      .then((x) => x.json())
      .then((x) => { if (x.ok) setCanExport(x.data.csvExportUnlocked); })
      .catch(() => {});
  }, []);

  async function create() {
    if (!newName.trim()) return;
    await fetch("/api/shortlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    void load();
  }

  if (selected) {
    return (
      <ShortlistDetail
        id={selected}
        canExport={canExport}
        onBack={() => { setSelected(null); void load(); }}
      />
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{t.shortlists.title}</h1>
      <div className="flex gap-3 mb-8">
        <Input
          placeholder="New shortlist name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <Button onClick={create}>Create</Button>
      </div>
      {lists.length === 0 && <p className="text-sm text-muted-foreground">{t.shortlists.empty}</p>}
      <div className="space-y-3">
        {lists.map((l) => (
          <Card key={l.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(l.id)}>
            <CardHeader>
              <CardTitle className="text-base">{l.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{l.entryCount} creators · {new Date(l.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
