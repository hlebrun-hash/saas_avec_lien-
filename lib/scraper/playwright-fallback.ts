// Heavy fallback for JS-heavy SPAs. Imported dynamically only when the static fetch yields too little text.
import { validateUrl } from "./url-validator";

export async function renderWithPlaywright(url: string): Promise<string | null> {
  const v = validateUrl(url);
  if (!v.ok) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ userAgent: "InfluenceMatchBot/1.0" });
    const page = await ctx.newPage();
    await page.goto(v.url.toString(), { waitUntil: "networkidle", timeout: 12_000 });
    const html = await page.content();
    return html;
  } catch {
    return null;
  } finally {
    await browser.close().catch(() => {});
  }
}
