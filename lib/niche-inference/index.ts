import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedSite } from "@/lib/scraper";
import { brandSignalsSchema, type BrandSignals } from "./schema";
import { NICHE_INFERENCE_SYSTEM, buildUserPrompt } from "./prompt";
import { stubInfer } from "./stub";

export interface InferResult {
  signals: BrandSignals;
  source: "claude" | "stub";
  tokenCost: number;
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  // Strip code fences if present
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/.exec(trimmed);
  const candidate = fence?.[1] ?? trimmed;
  // Find first { and last }
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first < 0 || last < 0) throw new Error("No JSON object found in model output.");
  return JSON.parse(candidate.slice(first, last + 1));
}

export async function inferBrandSignals(site: ExtractedSite): Promise<InferResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { signals: stubInfer(site), source: "stub", tokenCost: 0 };
  }
  const client = new Anthropic({ apiKey });
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: NICHE_INFERENCE_SYSTEM,
      messages: [{ role: "user", content: buildUserPrompt(site) }],
    });
    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") throw new Error("No text block in Claude response.");
    const parsed = extractJsonObject(block.text);
    const signals = brandSignalsSchema.parse(parsed);
    const tokenCost = (res.usage?.input_tokens ?? 0) + (res.usage?.output_tokens ?? 0);
    return { signals, source: "claude", tokenCost };
  } catch (e) {
    // Fall back to stub on any model/parse error so the pipeline never hard-crashes the user request.
    console.warn("[niche-inference] Claude call failed, using stub:", (e as Error).message);
    return { signals: stubInfer(site), source: "stub", tokenCost: 0 };
  }
}

export { stubInfer } from "./stub";
export type { BrandSignals } from "./schema";
export { brandSignalsSchema } from "./schema";
