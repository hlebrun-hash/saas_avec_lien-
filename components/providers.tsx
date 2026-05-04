"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect } from "react";
import posthog from "posthog-js";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function PostHogBoot() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === "undefined") return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: true,
    });
  }, []);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const inner = (
    <>
      <PostHogBoot />
      {children}
    </>
  );
  if (!isClerkConfigured) return inner;
  return <ClerkProvider>{inner}</ClerkProvider>;
}
