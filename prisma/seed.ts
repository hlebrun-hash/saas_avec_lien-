import { PrismaClient, Platform } from "@prisma/client";

const prisma = new PrismaClient();

type NicheDef = {
  niche: string;
  categories: string[];
  keywords: string[];
  countries: string[];
  languages: string[];
  handlePrefixes: string[];
};

const NICHES: NicheDef[] = [
  {
    niche: "wine",
    categories: ["wine", "food", "lifestyle"],
    keywords: ["wine", "sommelier", "vineyard", "tasting", "vintage", "pairing", "rouge", "blanc", "natural wine", "grapes"],
    countries: ["FR", "IT", "ES", "US", "AU"],
    languages: ["en", "fr", "it", "es"],
    handlePrefixes: ["wino", "sommelier", "cellar", "grape", "vine", "bottleboss"],
  },
  {
    niche: "fitness",
    categories: ["fitness", "health", "wellness"],
    keywords: ["workout", "gym", "training", "strength", "hiit", "yoga", "macros", "fitfam", "homegym", "running"],
    countries: ["US", "GB", "CA", "AU", "DE"],
    languages: ["en", "de"],
    handlePrefixes: ["fit", "lift", "strong", "shred", "iron", "active"],
  },
  {
    niche: "beauty",
    categories: ["beauty", "skincare", "makeup"],
    keywords: ["skincare", "makeup", "lipstick", "serum", "glowy", "retinol", "lashes", "kbeauty", "selfcare", "cleanbeauty"],
    countries: ["US", "FR", "KR", "GB", "BR"],
    languages: ["en", "fr", "ko", "pt"],
    handlePrefixes: ["glow", "lush", "beauty", "blush", "kiss", "serum"],
  },
  {
    niche: "tech",
    categories: ["tech", "gadgets", "software"],
    keywords: ["coding", "react", "saas", "ai", "macbook", "iphone", "review", "indiehacker", "startup", "devtools"],
    countries: ["US", "GB", "IN", "DE", "CA"],
    languages: ["en", "de"],
    handlePrefixes: ["dev", "byte", "code", "tech", "stack", "pixel"],
  },
  {
    niche: "parenting",
    categories: ["parenting", "family", "kids"],
    keywords: ["mom", "dad", "toddler", "newborn", "schoolrun", "playtime", "familytravel", "momlife", "stroller", "tantrum"],
    countries: ["US", "GB", "CA", "AU", "FR"],
    languages: ["en", "fr"],
    handlePrefixes: ["mom", "dad", "tinyhuman", "family", "raising", "littles"],
  },
  {
    niche: "gaming",
    categories: ["gaming", "esports"],
    keywords: ["gameplay", "twitch", "speedrun", "valorant", "minecraft", "fortnite", "rpg", "indie", "controller", "fps"],
    countries: ["US", "BR", "JP", "KR", "DE"],
    languages: ["en", "pt", "ja", "ko", "de"],
    handlePrefixes: ["xX", "ggwp", "loot", "boss", "respawn", "1up"],
  },
  {
    niche: "travel",
    categories: ["travel", "lifestyle", "photography"],
    keywords: ["wanderlust", "backpacking", "passport", "hotel", "airbnb", "roadtrip", "beach", "mountain", "explore", "nomad"],
    countries: ["US", "FR", "TH", "MX", "PT"],
    languages: ["en", "fr", "es"],
    handlePrefixes: ["wander", "roam", "globe", "trekk", "passport", "horizons"],
  },
  {
    niche: "food",
    categories: ["food", "cooking", "recipes"],
    keywords: ["recipe", "homecook", "pasta", "baking", "sourdough", "vegan", "dinner", "mealprep", "foodie", "kitchen"],
    countries: ["US", "IT", "FR", "JP", "MX"],
    languages: ["en", "it", "fr", "ja", "es"],
    handlePrefixes: ["chef", "cook", "fork", "plate", "spice", "savor"],
  },
];

const PLATFORMS: Platform[] = [Platform.INSTAGRAM, Platform.TIKTOK, Platform.YOUTUBE, Platform.X, Platform.TWITCH];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pick<T>(arr: readonly T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)]!;
}

function buildCreators() {
  const r = rng(42);
  const creators: Array<Parameters<typeof prisma.creator.create>[0]["data"]> = [];
  const usedHandles = new Set<string>();

  // 25 per niche * 8 niches = 200
  for (const def of NICHES) {
    for (let i = 0; i < 25; i++) {
      const platform = pick(PLATFORMS, r);
      const prefix = pick(def.handlePrefixes, r);
      const suffix = Math.floor(r() * 9999);
      let handle = `${prefix}${suffix}`;
      while (usedHandles.has(`${platform}:${handle}`)) handle = `${prefix}${Math.floor(r() * 99999)}`;
      usedHandles.add(`${platform}:${handle}`);

      const tier = r();
      const followers =
        tier < 0.5
          ? Math.floor(1_000 + r() * 99_000) // nano-micro
          : tier < 0.85
            ? Math.floor(100_000 + r() * 900_000) // mid
            : Math.floor(1_000_000 + r() * 9_000_000); // macro-mega

      const engagementRate = Math.max(0.005, Math.min(0.12, 0.06 - Math.log10(followers) * 0.005 + (r() - 0.5) * 0.02));
      const avgViews = Math.floor(followers * (0.05 + r() * 0.5));
      const recentDays = Math.floor(r() * 120);

      // pick a topical sample of keywords
      const keywordSample = [...def.keywords].sort(() => r() - 0.5).slice(0, 5);

      creators.push({
        handle,
        platform,
        displayName: `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)} ${suffix}`,
        bio: `${def.niche} creator · ${keywordSample.slice(0, 3).join(" · ")}`,
        avatarUrl: `https://api.dicebear.com/7.x/thumbs/svg?seed=${platform}-${handle}`,
        followers,
        avgViews,
        engagementRate: Number(engagementRate.toFixed(4)),
        country: pick(def.countries, r),
        language: pick(def.languages, r),
        categories: def.categories,
        keywords: keywordSample,
        recentPostAt: new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000),
        brandSafetyScore: Number((0.6 + r() * 0.4).toFixed(2)),
        contactEmail: r() > 0.4 ? `${handle}@creators.example.com` : null,
      });
    }
  }
  return creators;
}

async function main() {
  console.log("→ Seeding creators…");
  const data = buildCreators();
  // Idempotent: clear and reinsert
  await prisma.shortlistEntry.deleteMany();
  await prisma.creator.deleteMany();
  for (const c of data) {
    await prisma.creator.create({ data: c });
  }
  console.log(`✓ Seeded ${data.length} creators.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
