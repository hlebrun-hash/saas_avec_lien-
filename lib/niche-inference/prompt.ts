import type { ExtractedSite } from "@/lib/scraper";

export const NICHE_INFERENCE_SYSTEM = `You are a brand-niche analyst. Given the public-facing copy of a website, infer the brand's niche, target audience, tone, and price tier. Output STRICT JSON only — no prose, no markdown fences. The schema is:

{
  "niche": "<single short noun phrase, e.g. 'natural wine retail'>",
  "sub_niches": ["<up to 8 narrower niches>"],
  "audience": {
    "age_range": "<e.g. '25-44'>",
    "gender_skew": "female" | "male" | "balanced" | "unknown",
    "interests": ["<up to 20 topical interests>"],
    "geography": ["<ISO country codes; empty array if unclear>"],
    "languages": ["<ISO 639-1 codes>"]
  },
  "brand_tone": ["<up to 6 adjectives, e.g. 'minimalist', 'playful'>"],
  "price_tier": "budget" | "mid" | "premium" | "luxury" | "unknown",
  "keywords": ["<up to 40 lowercase tokens — single words or 2-grams — useful for matching with creator content>"]
}

Rules:
- Be specific. "wine" alone is too broad if the site clearly sells "natural wine".
- "keywords" should mix product terms, audience interests, and topical hashtags a creator would actually use.
- If a field is genuinely unknowable, return "unknown" or an empty array. Do NOT invent geography or demographics.
- Output JSON only.`;

export function buildUserPrompt(site: ExtractedSite): string {
  const productList = site.productNames.length ? `Product names:\n- ${site.productNames.join("\n- ")}` : "";
  const headingList = site.headings.length ? `Headings:\n- ${site.headings.slice(0, 15).join("\n- ")}` : "";
  const about = site.aboutText ? `About text:\n${site.aboutText}` : "";

  // Cap body to keep token usage predictable.
  const body = site.bodyText.slice(0, 4_000);

  return [
    `URL: ${site.url}`,
    `Title: ${site.title}`,
    site.description ? `Meta description: ${site.description}` : "",
    site.ogTitle ? `OG title: ${site.ogTitle}` : "",
    site.ogDescription ? `OG description: ${site.ogDescription}` : "",
    headingList,
    productList,
    about,
    `Body excerpt:\n${body}`,
    "",
    "Return the JSON object now.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
