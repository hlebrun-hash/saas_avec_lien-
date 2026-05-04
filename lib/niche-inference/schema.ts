import { z } from "zod";

export const audienceSchema = z.object({
  age_range: z.string(),
  gender_skew: z.enum(["female", "male", "balanced", "unknown"]),
  interests: z.array(z.string()).max(20),
  geography: z.array(z.string()).max(10),
  languages: z.array(z.string()).max(5),
});

export const brandSignalsSchema = z.object({
  niche: z.string().min(1),
  sub_niches: z.array(z.string()).max(8),
  audience: audienceSchema,
  brand_tone: z.array(z.string()).max(6),
  price_tier: z.enum(["budget", "mid", "premium", "luxury", "unknown"]),
  keywords: z.array(z.string()).min(1).max(40),
});

export type BrandSignals = z.infer<typeof brandSignalsSchema>;
export type Audience = z.infer<typeof audienceSchema>;
