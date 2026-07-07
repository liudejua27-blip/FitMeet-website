export const waitlistNeedTypes = ["运动搭子", "旅游 / 城市搭子", "附近新朋友", "新城市社交"] as const;
export const waitlistInferenceConfidenceValues = ["high", "medium", "fallback", "preset", "manual", "unknown"] as const;
export const waitlistPlanSourceValues = ["custom", "preset", "manual-edit", "unknown"] as const;

export type WaitlistNeedType = (typeof waitlistNeedTypes)[number];
export type WaitlistInferenceConfidence = (typeof waitlistInferenceConfidenceValues)[number];
export type WaitlistPlanSource = (typeof waitlistPlanSourceValues)[number];

export function isWaitlistNeedType(value: string | undefined): value is WaitlistNeedType {
  return Boolean(value && (waitlistNeedTypes as readonly string[]).includes(value));
}

export function isWaitlistInferenceConfidence(value: string | undefined): value is WaitlistInferenceConfidence {
  return Boolean(value && (waitlistInferenceConfidenceValues as readonly string[]).includes(value));
}

export function isWaitlistPlanSource(value: string | undefined): value is WaitlistPlanSource {
  return Boolean(value && (waitlistPlanSourceValues as readonly string[]).includes(value));
}
