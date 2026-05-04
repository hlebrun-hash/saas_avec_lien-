import { describe, expect, it } from "vitest";
import { stubInfer } from "@/lib/niche-inference/stub";
import { brandSignalsSchema } from "@/lib/niche-inference/schema";
import type { ExtractedSite } from "@/lib/scraper";

function makeSite(overrides: Partial<ExtractedSite>): ExtractedSite {
  return {
    url: "https://example.com",
    title: "",
    description: "",
    headings: [],
    productNames: [],
    aboutText: "",
    bodyText: "",
    textLength: 0,
    ...overrides,
  };
}

describe("stubInfer", () => {
  it("classifies a wine shop", () => {
    const site = makeSite({
      title: "Maison Vino — natural wines",
      description: "Curated natural wines from small producers.",
      headings: ["Natural wines", "Featured bottles"],
      productNames: ["Domaine Truc Rouge 2021", "Cuvée Étoile Blanc 2022"],
      aboutText: "We import natural wines from biodynamic vineyards.",
      bodyText: "wine vineyard rouge blanc cuvée sommelier biodynamic bottle cellar",
      textLength: 200,
    });
    const out = stubInfer(site);
    expect(out.niche).toMatch(/wine/i);
    expect(out.keywords).toEqual(expect.arrayContaining(["wine"]));
    // Output must conform to schema
    expect(() => brandSignalsSchema.parse(out)).not.toThrow();
  });

  it("classifies a fitness brand", () => {
    const site = makeSite({
      title: "IronCore — strength training apparel",
      headings: ["Workout gear", "Protein"],
      bodyText: "gym workout fitness training muscle hiit cardio strength",
      textLength: 100,
    });
    const out = stubInfer(site);
    expect(out.niche).toMatch(/fitness/i);
  });

  it("always returns schema-valid output even on empty input", () => {
    const out = stubInfer(makeSite({}));
    expect(() => brandSignalsSchema.parse(out)).not.toThrow();
  });
});
