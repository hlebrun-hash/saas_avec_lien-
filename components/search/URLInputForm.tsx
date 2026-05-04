"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useState } from "react";

export function URLInputForm({
  initial,
  onSubmit,
  disabled,
}: {
  initial: string;
  onSubmit: (url: string) => void;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (url.trim()) onSubmit(url.trim());
      }}
      className="flex gap-3 items-stretch"
      aria-label="Analyze URL"
    >
      <Input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t.landing.placeholder}
        className="flex-1 h-11"
        aria-label="Website URL"
        required
      />
      <Button type="submit" disabled={disabled} size="lg">
        {disabled ? "…" : t.search.submit}
      </Button>
    </form>
  );
}
