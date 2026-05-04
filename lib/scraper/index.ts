import { fetchHtml } from "./fetch";
import { extractFromHtml, type ExtractedSite } from "./extract";

const PLAYWRIGHT_TEXT_THRESHOLD = 1024;

export type ScrapeError = { ok: false; code: string; message: string };
export type ScrapeOk = { ok: true; site: ExtractedSite; usedPlaywright: boolean };
export type ScrapeResult = ScrapeOk | ScrapeError;

export async function scrape(url: string): Promise<ScrapeResult> {
  const r = await fetchHtml(url);
  if (!r.ok) return r;
  const site = extractFromHtml(r.html, r.finalUrl);
  if (site.textLength >= PLAYWRIGHT_TEXT_THRESHOLD) {
    return { ok: true, site, usedPlaywright: false };
  }
  // Lazy-load Playwright fallback only when needed (avoids cold-starting Chromium for static sites).
  try {
    const { renderWithPlaywright } = await import("./playwright-fallback");
    const html = await renderWithPlaywright(r.finalUrl);
    if (!html) return { ok: true, site, usedPlaywright: false };
    return { ok: true, site: extractFromHtml(html, r.finalUrl), usedPlaywright: true };
  } catch {
    return { ok: true, site, usedPlaywright: false };
  }
}

export type { ExtractedSite };
