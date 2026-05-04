import { mockProvider } from "./mock";
import type { InfluencerProvider } from "./types";

// TODO: Implement real adapters and switch via INFLUENCER_PROVIDER env var.
// Reference shape:
//   export const modashProvider: InfluencerProvider = {
//     name: "modash",
//     async searchCreators(filters) {
//       // Call Modash REST API, map the response into MatcherCreator[]
//     },
//   };

export function getProvider(): InfluencerProvider {
  const name = process.env.INFLUENCER_PROVIDER ?? "mock";
  switch (name) {
    case "mock":
      return mockProvider;
    // case "modash": return modashProvider;
    // case "phyllo": return phylloProvider;
    default:
      console.warn(`[providers] Unknown provider "${name}", falling back to mock.`);
      return mockProvider;
  }
}

export type { InfluencerProvider, CreatorSearchFilters } from "./types";
