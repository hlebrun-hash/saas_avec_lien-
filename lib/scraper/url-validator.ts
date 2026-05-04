// SSRF-safe URL validator.
// Rejects: non-http(s) schemes, embedded creds, IP literals in private/loopback/link-local ranges,
// and known cloud-metadata hosts. The DNS-resolution check is performed by the fetcher at request time.

const PRIVATE_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
]);

const FORBIDDEN_HOSTNAMES_REGEX = /^(0\.0\.0\.0|broadcasthost|ip6-localhost|ip6-loopback)$/i;

function isPrivateIPv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const parts = m.slice(1, 5).map(Number) as [number, number, number, number];
  if (parts.some((p) => p < 0 || p > 255)) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true; // loopback
  if (a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local incl. AWS metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIPv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h.includes(":")) return false;
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
  if (h.startsWith("fe80")) return true; // link-local
  if (h.startsWith("ff")) return true; // multicast
  if (h.startsWith("::ffff:")) {
    const v4 = h.slice(7);
    return isPrivateIPv4(v4);
  }
  return false;
}

export type UrlValidationError =
  | "INVALID_FORMAT"
  | "UNSUPPORTED_SCHEME"
  | "EMBEDDED_CREDENTIALS"
  | "PRIVATE_HOST"
  | "FORBIDDEN_PORT";

export type UrlValidationResult =
  | { ok: true; url: URL }
  | { ok: false; error: UrlValidationError; message: string };

const ALLOWED_PORTS = new Set([80, 443, 8080, 8443]);

export function validateUrl(input: string): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { ok: false, error: "INVALID_FORMAT", message: "URL is not parseable." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "UNSUPPORTED_SCHEME", message: `Scheme ${parsed.protocol} is not allowed.` };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: "EMBEDDED_CREDENTIALS", message: "URLs with embedded credentials are not allowed." };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) return { ok: false, error: "INVALID_FORMAT", message: "Empty hostname." };
  if (PRIVATE_HOSTS.has(hostname) || FORBIDDEN_HOSTNAMES_REGEX.test(hostname)) {
    return { ok: false, error: "PRIVATE_HOST", message: "Private or reserved hostname." };
  }
  if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
    return { ok: false, error: "PRIVATE_HOST", message: "Private/loopback/link-local IP." };
  }
  if (parsed.port) {
    const p = Number(parsed.port);
    if (!ALLOWED_PORTS.has(p)) return { ok: false, error: "FORBIDDEN_PORT", message: `Port ${p} not allowed.` };
  }
  // Strip credentials (defense in depth) and fragment
  parsed.username = "";
  parsed.password = "";
  parsed.hash = "";
  return { ok: true, url: parsed };
}

export function hashUrl(url: string): string {
  // Tiny non-crypto hash for indexing; avoids leaking exact URLs in some logs.
  let h = 5381;
  for (let i = 0; i < url.length; i++) h = ((h << 5) + h + url.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, "0");
}
