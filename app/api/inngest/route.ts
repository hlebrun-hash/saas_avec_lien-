// Inngest serve handler. Add your functions to the array to register them.
// See: https://www.inngest.com/docs/sdk/serve
//
// Example production wiring:
//   import { inngest } from "@/lib/inngest/client";
//   import { analyzeUrl } from "@/lib/inngest/functions";
//   serve({ client: inngest, functions: [analyzeUrl] })

import { NextResponse } from "next/server";

// Stub — returns 200 so routes don't 404 before Inngest is configured.
export function GET() {
  return NextResponse.json({ ok: true, message: "Inngest endpoint (not yet configured)" });
}
export function POST() {
  return NextResponse.json({ ok: true, message: "Inngest endpoint (not yet configured)" });
}
export function PUT() {
  return NextResponse.json({ ok: true, message: "Inngest endpoint (not yet configured)" });
}
