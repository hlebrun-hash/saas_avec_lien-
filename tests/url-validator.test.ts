import { describe, expect, it } from "vitest";
import { validateUrl } from "@/lib/scraper/url-validator";

describe("validateUrl — accepts public URLs", () => {
  it.each(["https://example.com", "http://example.com/path?x=1", "https://shop.example.com:443/p"])(
    "%s",
    (url) => {
      const r = validateUrl(url);
      expect(r.ok).toBe(true);
    }
  );
});

describe("validateUrl — rejects SSRF and bad inputs", () => {
  const cases: Array<[string, string]> = [
    ["", "INVALID_FORMAT"],
    ["not a url", "INVALID_FORMAT"],
    ["ftp://example.com", "UNSUPPORTED_SCHEME"],
    ["file:///etc/passwd", "UNSUPPORTED_SCHEME"],
    ["javascript:alert(1)", "UNSUPPORTED_SCHEME"],
    ["http://user:pass@example.com", "EMBEDDED_CREDENTIALS"],
    ["http://localhost", "PRIVATE_HOST"],
    ["http://127.0.0.1", "PRIVATE_HOST"],
    ["http://10.0.0.1", "PRIVATE_HOST"],
    ["http://192.168.1.1", "PRIVATE_HOST"],
    ["http://172.16.0.5", "PRIVATE_HOST"],
    ["http://169.254.169.254/latest/meta-data/", "PRIVATE_HOST"], // AWS metadata
    ["http://0.0.0.0", "PRIVATE_HOST"],
    ["http://[::1]", "PRIVATE_HOST"],
    ["http://[fc00::1]", "PRIVATE_HOST"],
    ["http://[fe80::1]", "PRIVATE_HOST"],
    ["http://metadata.google.internal/", "PRIVATE_HOST"],
    ["http://example.com:22", "FORBIDDEN_PORT"],
    ["http://example.com:6379", "FORBIDDEN_PORT"],
  ];
  it.each(cases)("rejects %s", (url, code) => {
    const r = validateUrl(url);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(code);
  });
});

describe("validateUrl — strips credentials/fragments on success", () => {
  it("removes hash", () => {
    const r = validateUrl("https://example.com/path#frag");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url.hash).toBe("");
  });
});
