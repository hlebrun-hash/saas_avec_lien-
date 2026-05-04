"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpgradeButton({ plan, label }: { plan: "PRO" | "AGENCY"; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await r.json();
      if (json.ok && json.data.url) window.location.href = json.data.url;
      else alert(json.message ?? "Upgrade unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handle} disabled={loading} className="w-full">
      {loading ? "…" : label}
    </Button>
  );
}
