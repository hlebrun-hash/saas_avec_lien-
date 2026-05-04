import type { ExtractedSite } from "@/lib/scraper";
import type { BrandSignals } from "./schema";

// Deterministic fallback used when ANTHROPIC_API_KEY is not configured (and in tests).
// Performs simple lexical heuristics over the extracted text.

const NICHE_LEXICON: Array<{ niche: string; subs: string[]; terms: string[]; interests: string[] }> = [
  { niche: "wine retail", subs: ["natural wine", "biodynamic", "rosé"], terms: ["wine", "vino", "vin", "vineyard", "sommelier", "bottle", "cellar", "cuvée", "rouge", "blanc"], interests: ["wine tasting", "food pairing", "vineyards", "gastronomy"] },
  { niche: "fitness", subs: ["strength training", "home gym", "yoga"], terms: ["gym", "workout", "fitness", "training", "muscle", "yoga", "hiit", "cardio", "macros"], interests: ["fitness", "wellness", "nutrition", "running"] },
  { niche: "beauty", subs: ["skincare", "clean beauty"], terms: ["skincare", "serum", "lipstick", "makeup", "cleanser", "moisturizer", "retinol", "spf"], interests: ["skincare", "makeup", "self-care"] },
  { niche: "consumer tech", subs: ["gadgets", "software"], terms: ["app", "software", "saas", "ai", "gadget", "device", "review", "iphone", "android"], interests: ["technology", "gadgets", "productivity"] },
  { niche: "parenting goods", subs: ["baby", "kids"], terms: ["baby", "toddler", "kids", "stroller", "diaper", "nursery", "parent"], interests: ["parenting", "family", "kids products"] },
  { niche: "gaming", subs: ["pc gaming", "esports"], terms: ["game", "gaming", "stream", "twitch", "console", "controller", "rpg"], interests: ["gaming", "esports", "streaming"] },
  { niche: "travel", subs: ["adventure", "luxury travel"], terms: ["travel", "trip", "hotel", "destination", "flight", "tour", "vacation"], interests: ["travel", "adventure", "photography"] },
  { niche: "food & cooking", subs: ["recipes", "kitchenware"], terms: ["recipe", "cook", "kitchen", "meal", "ingredient", "chef", "bake"], interests: ["cooking", "food", "recipes"] },
];

function score(text: string, terms: string[]): number {
  const t = text.toLowerCase();
  let s = 0;
  for (const w of terms) {
    const re = new RegExp(`\\b${w}\\b`, "g");
    const m = t.match(re);
    if (m) s += m.length;
  }
  return s;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9\s'-]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && w.length <= 24);
}

const STOPWORDS = new Set([
  "this", "that", "with", "from", "have", "been", "your", "their", "about", "more", "what", "they",
  "into", "shop", "store", "free", "menu", "page", "home", "just", "than", "when", "while", "also",
  "https", "html", "css", "javascript",
]);

export function stubInfer(site: ExtractedSite): BrandSignals {
  const blob = [
    site.title,
    site.description,
    site.ogTitle ?? "",
    site.ogDescription ?? "",
    site.headings.join(" "),
    site.productNames.join(" "),
    site.aboutText,
    site.bodyText,
  ].join(" ");

  let best = NICHE_LEXICON[0]!;
  let bestScore = -1;
  for (const def of NICHE_LEXICON) {
    const s = score(blob, def.terms);
    if (s > bestScore) {
      best = def;
      bestScore = s;
    }
  }

  // Top topical keywords from text, deduped, biased toward niche terms
  const counts = new Map<string, number>();
  for (const tok of tokenize(blob)) {
    if (STOPWORDS.has(tok)) continue;
    counts.set(tok, (counts.get(tok) ?? 0) + 1);
  }
  const topTokens = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);

  const keywords = Array.from(new Set([...best.terms, ...topTokens])).slice(0, 40);

  return {
    niche: best.niche,
    sub_niches: best.subs,
    audience: {
      age_range: "25-44",
      gender_skew: "balanced",
      interests: best.interests,
      geography: [],
      languages: ["en"],
    },
    brand_tone: ["modern", "approachable"],
    price_tier: "mid",
    keywords,
  };
}
