import { describe, expect, it } from "vitest";
import { extractFromHtml } from "@/lib/scraper/extract";

const HTML = `
<!doctype html>
<html><head>
  <title>Maison Vino — Natural wines from Bordeaux</title>
  <meta name="description" content="Curated natural wines from small French producers." />
  <meta property="og:title" content="Maison Vino" />
</head>
<body>
  <h1>Natural wines, curated</h1>
  <h2>Featured bottles</h2>
  <section><h2 class="product-title">Domaine Truc Rouge 2021</h2></section>
  <section><h2 class="product-title">Cuvée Étoile Blanc 2022</h2></section>
  <section id="about"><h2>About</h2><p>We import natural wines from small biodynamic producers across France.</p></section>
  <script>var x=1;</script>
</body></html>
`;

describe("extractFromHtml", () => {
  it("pulls title, meta, og, headings, products, about", () => {
    const s = extractFromHtml(HTML, "https://example.com");
    expect(s.title).toContain("Maison Vino");
    expect(s.description).toMatch(/natural wines/i);
    expect(s.ogTitle).toBe("Maison Vino");
    expect(s.headings).toEqual(expect.arrayContaining(["Natural wines, curated", "Featured bottles"]));
    expect(s.productNames).toEqual(expect.arrayContaining(["Domaine Truc Rouge 2021", "Cuvée Étoile Blanc 2022"]));
    expect(s.aboutText).toMatch(/biodynamic/);
    expect(s.bodyText).not.toMatch(/var x=1/); // script stripped
  });
});
