import { describe, expect, it } from "vitest";
import { rankCreators, scoreCreator, type MatcherCreator } from "@/lib/matcher";
import type { BrandSignals } from "@/lib/niche-inference";

const wineBrand: BrandSignals = {
  niche: "natural wine",
  sub_niches: ["biodynamic", "rosé"],
  audience: {
    age_range: "28-45",
    gender_skew: "balanced",
    interests: ["wine tasting", "gastronomy", "vineyards"],
    geography: ["FR"],
    languages: ["fr", "en"],
  },
  brand_tone: ["refined", "warm"],
  price_tier: "premium",
  keywords: ["wine", "natural wine", "rouge", "blanc", "biodynamic", "vintage", "sommelier"],
};

function creator(overrides: Partial<MatcherCreator>): MatcherCreator {
  return {
    id: "c1",
    handle: "test",
    platform: "INSTAGRAM",
    displayName: "Test",
    followers: 50_000,
    avgViews: 12_000,
    engagementRate: 0.04,
    country: "FR",
    language: "fr",
    categories: ["wine"],
    keywords: ["wine", "rouge", "biodynamic"],
    recentPostAt: new Date(),
    brandSafetyScore: 0.9,
    ...overrides,
  };
}

describe("scoreCreator", () => {
  it("ranks an on-niche, in-country creator highly", () => {
    const s = scoreCreator(wineBrand, creator({}));
    expect(s.final).toBeGreaterThan(0.6);
    expect(s.niche_fit).toBeGreaterThan(0.5);
    expect(s.audience_overlap).toBeGreaterThan(0.6);
  });

  it("penalizes wrong-niche creators", () => {
    const wineFit = scoreCreator(wineBrand, creator({})).final;
    const fitnessFit = scoreCreator(
      wineBrand,
      creator({ categories: ["fitness"], keywords: ["gym", "workout", "training"] })
    ).final;
    expect(wineFit).toBeGreaterThan(fitnessFit);
  });

  it("penalizes stale creators", () => {
    const fresh = scoreCreator(wineBrand, creator({})).recency;
    const stale = scoreCreator(
      wineBrand,
      creator({ recentPostAt: new Date(Date.now() - 365 * 86_400_000) })
    ).recency;
    expect(fresh).toBeGreaterThan(stale);
  });

  it("rewards higher engagement at the same follower tier", () => {
    const lowEng = scoreCreator(wineBrand, creator({ engagementRate: 0.01 })).engagement_quality;
    const highEng = scoreCreator(wineBrand, creator({ engagementRate: 0.06 })).engagement_quality;
    expect(highEng).toBeGreaterThan(lowEng);
  });

  it("returns a score breakdown that includes all components", () => {
    const s = scoreCreator(wineBrand, creator({}));
    expect(s).toMatchObject({
      niche_fit: expect.any(Number),
      audience_overlap: expect.any(Number),
      engagement_quality: expect.any(Number),
      recency: expect.any(Number),
      brand_safety: expect.any(Number),
      final: expect.any(Number),
    });
    expect(s.final).toBeGreaterThanOrEqual(0);
    expect(s.final).toBeLessThanOrEqual(1);
  });
});

describe("rankCreators", () => {
  it("returns sorted by final desc", () => {
    const out = rankCreators(wineBrand, [
      creator({ id: "a", categories: ["fitness"], keywords: ["gym"] }),
      creator({ id: "b" }),
      creator({ id: "c", country: "JP", language: "ja" }),
    ]);
    expect(out[0]!.creator.id).toBe("b");
    expect(out[0]!.score.final).toBeGreaterThanOrEqual(out[1]!.score.final);
  });
});
