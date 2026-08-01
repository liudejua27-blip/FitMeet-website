import type {
  FitMeetAppConfig,
  FitMeetFeatureAvailability,
  FitMeetFeatureKey,
} from './fitmeet-api-contract';

function stableBucket(userId: number, feature: FitMeetFeatureKey) {
  let hash = 2166136261;
  for (const character of `${feature}:${userId}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100;
}

export function featureAvailability(
  config: FitMeetAppConfig | null | undefined,
  feature: FitMeetFeatureKey,
  userId?: number,
): FitMeetFeatureAvailability {
  const availability = config?.features?.[feature];
  if (!availability || availability.enabled !== true) {
    return { enabled: false, rolloutPercentage: 0 };
  }
  const rolloutPercentage = Math.max(0, Math.min(100, Number(availability.rolloutPercentage ?? 100)));
  if (rolloutPercentage >= 100) return { enabled: true, rolloutPercentage };
  if (!Number.isSafeInteger(userId) || Number(userId) <= 0) {
    return { enabled: false, rolloutPercentage };
  }
  return { enabled: stableBucket(Number(userId), feature) < rolloutPercentage, rolloutPercentage };
}

export function featureEnabled(
  config: FitMeetAppConfig | null | undefined,
  feature: FitMeetFeatureKey,
  userId?: number,
) {
  return featureAvailability(config, feature, userId).enabled;
}
