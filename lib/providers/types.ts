// Pluggable influencer-data provider interface.
// Adapter implementations should map their fields into MatcherCreator. Real adapters
// (Modash, Phyllo, HypeAuditor) only need to implement `searchCreators`.

import type { MatcherCreator } from "@/lib/matcher";

export interface CreatorSearchFilters {
  platforms?: string[];
  followersMin?: number;
  followersMax?: number;
  engagementMin?: number;
  countries?: string[];
  languages?: string[];
  categories?: string[];
  activeWithinDays?: number;
  keywords?: string[]; // niche keywords to bias the search
  limit?: number;
}

export interface InfluencerProvider {
  name: string;
  searchCreators(filters: CreatorSearchFilters): Promise<MatcherCreator[]>;
}
