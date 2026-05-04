import { prisma } from "@/lib/db";
import type { InfluencerProvider, CreatorSearchFilters } from "./types";
import type { MatcherCreator } from "@/lib/matcher";

export const mockProvider: InfluencerProvider = {
  name: "mock",
  async searchCreators(filters: CreatorSearchFilters): Promise<MatcherCreator[]> {
    const where: Parameters<typeof prisma.creator.findMany>[0] extends infer P
      ? P extends { where?: infer W }
        ? W
        : never
      : never = {};
    const conditions: Record<string, unknown> = {};

    if (filters.platforms?.length) conditions.platform = { in: filters.platforms };
    if (filters.followersMin !== undefined || filters.followersMax !== undefined) {
      conditions.followers = {
        ...(filters.followersMin !== undefined ? { gte: filters.followersMin } : {}),
        ...(filters.followersMax !== undefined ? { lte: filters.followersMax } : {}),
      };
    }
    if (filters.engagementMin !== undefined) conditions.engagementRate = { gte: filters.engagementMin };
    if (filters.countries?.length) conditions.country = { in: filters.countries };
    if (filters.languages?.length) conditions.language = { in: filters.languages };
    if (filters.categories?.length) conditions.categories = { hasSome: filters.categories };
    if (filters.activeWithinDays !== undefined) {
      conditions.recentPostAt = { gte: new Date(Date.now() - filters.activeWithinDays * 86_400_000) };
    }

    // We don't filter by keyword at the DB layer — the matcher does that more accurately.
    // Pull up to 1000 candidates and let the matcher rank.
    const limit = Math.min(1000, filters.limit ?? 1000);
    const rows = await prisma.creator.findMany({ where: conditions as never, take: limit });

    return rows.map((r) => ({
      id: r.id,
      handle: r.handle,
      platform: r.platform,
      displayName: r.displayName,
      followers: r.followers,
      avgViews: r.avgViews,
      engagementRate: r.engagementRate,
      country: r.country,
      language: r.language,
      categories: r.categories,
      keywords: r.keywords,
      recentPostAt: r.recentPostAt,
      brandSafetyScore: r.brandSafetyScore,
    }));
  },
};
