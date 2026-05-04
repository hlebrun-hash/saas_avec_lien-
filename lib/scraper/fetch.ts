import { validateUrl } from "./url-validator";

const USER_AGENT = "InfluenceMatchBot/1.0 (+https://influencematch.app/bot)";
const MAX_BYTES = 2_000_000; // 2MB cap
const FETCH_TIMEOUT_MS = 8_000;

export interface FetchResult {
  ok: true;
  html: string;
  finalUrl: string;
  status: number;
}

export interface FetchError {
  ok: false;
  code: "INVALID_URL" | "TIMEOUT" | "HTTP_ERROR" | "TOO_LARGE" | "NETWORK";
  message: string;
}

export async function fetchHtml(rawUrl: string): Promise<FetchResult | FetchError> {
  const v = validateUrl(rawUrl);
  if (!v.ok) return { ok: false, code: "INVALID_URL", message: v.message };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(v.url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) return { ok: false, code: "HTTP_ERROR", message: `HTTP ${res.status}` };

    // Re-validate the final URL after redirects (defense-in-depth against redirect-to-internal)
    const finalCheck = validateUrl(res.url);
    if (!finalCheck.ok) return { ok: false, code: "INVALID_URL", message: `Redirect target rejected: ${finalCheck.message}` };

    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      if (text.length > MAX_BYTES) return { ok: false, code: "TOO_LARGE", message: "Response too large." };
      return { ok: true, html: text, finalUrl: res.url, status: res.status };
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        return { ok: false, code: "TOO_LARGE", message: "Response exceeded 2MB cap." };
      }
      chunks.push(value);
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(concat(chunks));
    return { ok: true, html, finalUrl: res.url, status: res.status };
  } catch (e) {
    const err = e as { name?: string; message?: string };
    if (err.name === "AbortError") return { ok: false, code: "TIMEOUT", message: "Fetch timed out." };
    return { ok: false, code: "NETWORK", message: err.message ?? "Network error." };
  } finally {
    clearTimeout(timeout);
  }
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.byteLength;
  }
  return out;
}
