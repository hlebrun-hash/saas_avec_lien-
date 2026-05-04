export interface ScoreBreakdown {
  niche_fit: number;
  audience_overlap: number;
  engagement_quality: number;
  recency: number;
  brand_safety: number;
  final: number;
}

export interface CreatorRow {
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
  recentPostAt: string;
  brandSafetyScore: number;
  contactEmail: string | null;
}

export interface SearchResults {
  total: number;
  page: number;
  pageSize: number;
  items: { creator: CreatorRow; score: ScoreBreakdown }[];
  plan: "FREE" | "PRO" | "AGENCY";
  contactInfoUnlocked: boolean;
  csvExportUnlocked: boolean;
  truncatedByPlan: boolean;
}

export interface Filters {
  platforms: string[];
  followersMin?: number;
  followersMax?: number;
  engagementMin?: number;
  countries: string[];
  languages: string[];
  categories: string[];
  activeWithinDays?: number;
}

export const DEFAULT_FILTERS: Filters = {
  platforms: [],
  countries: [],
  languages: [],
  categories: [],
};
