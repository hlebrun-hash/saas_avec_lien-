import { Mistral } from "@mistralai/mistralai";
import type { ExtractedSite } from "@/lib/scraper";
import { brandSignalsSchema, type BrandSignals } from "./schema";
import { NICHE_INFERENCE_SYSTEM, buildUserPrompt } from "./prompt";
import { stubInfer } from "./stub";

export interface InferResult {
  signals: BrandSignals;
  source: "mistral" | "stub";
  tokenCost: number;
}

const MODEL = process.env.MISTRAL_MODEL ?? "mistral-small-latest";

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
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return { signals: stubInfer(site), source: "stub", tokenCost: 0 };
  }
  const client = new Mistral({ apiKey });
  try {
    const res = await client.chat.complete({
      model: MODEL,
      maxTokens: 1500,
      messages: [
        { role: "system", content: NICHE_INFERENCE_SYSTEM },
        { role: "user", content: buildUserPrompt(site) },
      ],
    });
    const block = res.choices?.[0]?.message?.content;
    if (!block || typeof block !== "string") throw new Error("No text content in Mistral response.");
    const parsed = extractJsonObject(block);
    const signals = brandSignalsSchema.parse(parsed);
    const tokenCost = (res.usage?.promptTokens ?? 0) + (res.usage?.completionTokens ?? 0);
    return { signals, source: "mistral", tokenCost };
  } catch (e) {
    // Fall back to stub on any model/parse error so the pipeline never hard-crashes the user request.
    console.warn("[niche-inference] Mistral call failed, using stub:", (e as Error).message);
    return { signals: stubInfer(site), source: "stub", tokenCost: 0 };
  }
}

export { stubInfer } from "./stub";
export type { BrandSignals } from "./schema";
export { brandSignalsSchema } from "./schema";
