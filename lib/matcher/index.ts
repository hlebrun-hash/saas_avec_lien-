import type { BrandSignals } from "@/lib/niche-inference";

export interface MatcherCreator {
  id: string;
  handle: string;
  platform: string;
  displayName: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  country: string;
  language: string;
  categories: string[];
  keywords: string[];
  recentPostAt: Date;
  brandSafetyScore: number;
}

export interface ScoreBreakdown {
  niche_fit: number;
  audience_overlap: number;
  engagement_quality: number;
  recency: number;
  brand_safety: number;
  final: number;
}

export interface RankedCreator {
  creator: MatcherCreator;
  score: ScoreBreakdown;
}

const NOW = () => Date.now();

// ── TF-IDF-style cosine similarity over keyword sets ──────────────────────────

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/\s+/).filter(Boolean);
}

function termVector(terms: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const raw of terms) {
    for (const t of tokenize(raw)) m.set(t, (m.get(t) ?? 0) + 1);
  }
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  if (!a.size || !b.size) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (const [k, v] of a) {
    na += v * v;
    const bv = b.get(k);
    if (bv) dot += v * bv;
  }
  for (const v of b.values()) nb += v * v;
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function nicheFit(brand: BrandSignals, creator: MatcherCreator): number {
  const brandTerms = [brand.niche, ...brand.sub_niches, ...brand.keywords];
  const creatorTerms = [...creator.categories, ...creator.keywords];
  const sim = cosine(termVector(brandTerms), termVector(creatorTerms));
  // Boost if any explicit category contains the niche head noun
  const nicheHead = brand.niche.toLowerCase().split(" ")[0] ?? "";
  const categoryBoost = creator.categories.some((c) => c.toLowerCase().includes(nicheHead)) ? 0.15 : 0;
  return Math.min(1, sim * 1.4 + categoryBoost);
}

function audienceOverlap(brand: BrandSignals, creator: MatcherCreator): number {
  let geoScore = 0.5;
  if (brand.audience.geography.length === 0) geoScore = 0.6; // unknown: neutral-positive
  else if (brand.audience.geography.includes(creator.country)) geoScore = 1;
  else geoScore = 0.2;

  const langScore = brand.audience.languages.length === 0 || brand.audience.languages.includes(creator.language) ? 1 : 0.3;

  const interestVec = termVector(brand.audience.interests);
  const creatorVec = termVector([...creator.keywords, ...creator.categories]);
  const interestSim = cosine(interestVec, creatorVec);

  return Math.min(1, geoScore * 0.4 + langScore * 0.3 + interestSim * 0.3);
}

function engagementQuality(creator: MatcherCreator): number {
  // Tiered: nano/micro creators get a higher engagement ceiling weight
  const tierBaseline =
    creator.followers < 10_000 ? 0.04 : creator.followers < 100_000 ? 0.03 : creator.followers < 1_000_000 ? 0.02 : 0.012;
  const ratio = creator.engagementRate / tierBaseline;
  // 1.0 = baseline, cap at ~1.5x
  const er = Math.min(1, Math.max(0, (ratio - 0.5) / 1.0));
  // Combine with view-through ratio (avg_views / followers) capped
  const vtr = Math.min(1, creator.avgViews / Math.max(1, creator.followers) / 0.3);
  return Math.min(1, er * 0.7 + vtr * 0.3);
}

function recencyScore(creator: MatcherCreator): number {
  const days = (NOW() - creator.recentPostAt.getTime()) / 86_400_000;
  if (days <= 7) return 1;
  if (days <= 30) return 0.85;
  if (days <= 90) return 0.6;
  if (days <= 180) return 0.3;
  return 0.1;
}

function brandSafety(creator: MatcherCreator): number {
  return Math.max(0, Math.min(1, creator.brandSafetyScore));
}

export interface ScoringWeights {
  niche_fit: number;
  audience_overlap: number;
  engagement_quality: number;
  recency: number;
  brand_safety: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  niche_fit: 0.45,
  audience_overlap: 0.25,
  engagement_quality: 0.15,
  recency: 0.1,
  brand_safety: 0.05,
};

export function scoreCreator(brand: BrandSignals, creator: MatcherCreator, weights = DEFAULT_WEIGHTS): ScoreBreakdown {
  const nf = nicheFit(brand, creator);
  const ao = audienceOverlap(brand, creator);
  const eq = engagementQuality(creator);
  const rc = recencyScore(creator);
  const bs = brandSafety(creator);
  const final =
    nf * weights.niche_fit +
    ao * weights.audience_overlap +
    eq * weights.engagement_quality +
    rc * weights.recency +
    bs * weights.brand_safety;
  return {
    niche_fit: round(nf),
    audience_overlap: round(ao),
    engagement_quality: round(eq),
    recency: round(rc),
    brand_safety: round(bs),
    final: round(final),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function rankCreators(brand: BrandSignals, creators: MatcherCreator[], weights?: ScoringWeights): RankedCreator[] {
  return creators
    .map((c) => ({ creator: c, score: scoreCreator(brand, c, weights) }))
    .sort((a, b) => b.score.final - a.score.final);
}
