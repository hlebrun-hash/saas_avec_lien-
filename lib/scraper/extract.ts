import * as cheerio from "cheerio";

export interface ExtractedSite {
  url: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  headings: string[];
  productNames: string[];
  aboutText: string;
  bodyText: string;
  textLength: number;
}

const PRODUCT_SELECTORS = [
  "[itemtype*='Product'] [itemprop='name']",
  ".product-title",
  ".product__title",
  ".product-card__name",
  ".product-name",
  ".product .title",
  "article h2",
  "[data-product-name]",
];

const ABOUT_SELECTORS = [
  "main section:contains('About')",
  "#about",
  ".about",
  "[id*='about' i]",
];

function clean(s: string | undefined | null): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

export function extractFromHtml(html: string, url: string): ExtractedSite {
  const $ = cheerio.load(html);

  // Strip noisy elements before text extraction
  $("script, style, noscript, svg, iframe").remove();

  const title = clean($("head > title").first().text());
  const description = clean($('meta[name="description"]').attr("content"));
  const ogTitle = clean($('meta[property="og:title"]').attr("content")) || undefined;
  const ogDescription = clean($('meta[property="og:description"]').attr("content")) || undefined;

  const headings: string[] = [];
  $("h1, h2").each((_, el) => {
    const t = clean($(el).text());
    if (t && headings.length < 30) headings.push(t);
  });

  const productNames = new Set<string>();
  for (const sel of PRODUCT_SELECTORS) {
    $(sel).each((_, el) => {
      const t = clean($(el).text());
      if (t && t.length < 200) productNames.add(t);
    });
    if (productNames.size >= 20) break;
  }

  let aboutText = "";
  for (const sel of ABOUT_SELECTORS) {
    const node = $(sel).first();
    if (node.length) {
      aboutText = clean(node.text()).slice(0, 1500);
      if (aboutText.length > 100) break;
    }
  }

  const bodyText = clean($("body").text()).slice(0, 8_000);

  return {
    url,
    title,
    description,
    ogTitle,
    ogDescription,
    headings,
    productNames: [...productNames].slice(0, 20),
    aboutText,
    bodyText,
    textLength: bodyText.length,
  };
}
