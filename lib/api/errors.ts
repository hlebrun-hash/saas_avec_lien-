import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "UPSTREAM_ERROR"
  | "INTERNAL";

export interface ApiErrorEnvelope {
  ok: false;
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

export interface ApiOkEnvelope<T> {
  ok: true;
  data: T;
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiOkEnvelope<T>> {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(code: ApiErrorCode, message: string, status = 400, details?: unknown): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json({ ok: false, code, message, ...(details !== undefined ? { details } : {}) }, { status });
}

const STATUS: Record<ApiErrorCode, number> = {
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  QUOTA_EXCEEDED: 402,
  UPSTREAM_ERROR: 502,
  INTERNAL: 500,
};

export function failCode(code: ApiErrorCode, message: string, details?: unknown) {
  return fail(code, message, STATUS[code], details);
}
