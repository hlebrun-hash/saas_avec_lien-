import type { Plan } from "@prisma/client";

export interface PlanLimits {
  monthlyAnalyses: number; // -1 = unlimited
  visibleCreators: number; // -1 = unlimited
  csvExport: boolean;
  contactInfo: boolean;
  apiAccess: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { monthlyAnalyses: 3, visibleCreators: 10, csvExport: false, contactInfo: false, apiAccess: false },
  PRO: { monthlyAnalyses: 50, visibleCreators: -1, csvExport: true, contactInfo: true, apiAccess: false },
  AGENCY: { monthlyAnalyses: -1, visibleCreators: -1, csvExport: true, contactInfo: true, apiAccess: true },
};

export function canAnalyze(plan: Plan, used: number): boolean {
  const limit = PLAN_LIMITS[plan].monthlyAnalyses;
  return limit === -1 || used < limit;
}

export function visibleLimit(plan: Plan): number {
  return PLAN_LIMITS[plan].visibleCreators;
}
