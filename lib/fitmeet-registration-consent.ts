export const FITMEET_CURRENT_REGISTRATION_POLICY = Object.freeze({
  termsVersion: '1.0',
  privacyVersion: '1.0',
});

export type FitMeetRegistrationConsent = {
  termsVersion: typeof FITMEET_CURRENT_REGISTRATION_POLICY.termsVersion;
  privacyVersion: typeof FITMEET_CURRENT_REGISTRATION_POLICY.privacyVersion;
  termsAccepted: true;
  privacyAccepted: true;
  acceptedAt: string;
};

export type FitMeetRegistrationConsentValidation =
  | { ok: true; value: FitMeetRegistrationConsent }
  | {
      ok: false;
      status: 400 | 409;
      code:
        | 'CONSENT_VERSION_REQUIRED'
        | 'CONSENT_VERSION_OUTDATED'
        | 'EXPLICIT_LEGAL_CONSENT_REQUIRED'
        | 'CONSENT_TIMESTAMP_INVALID';
      message: string;
    };

const utcTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

/**
 * Creates a consent record only from the checkbox change event. Calling this
 * with false also discards the prior timestamp, so re-consent is explicit.
 */
export function fitMeetRegistrationConsentFromExplicitChoice(
  accepted: boolean,
  now: Date = new Date(),
): FitMeetRegistrationConsent | null {
  if (!accepted) return null;
  return {
    ...FITMEET_CURRENT_REGISTRATION_POLICY,
    termsAccepted: true,
    privacyAccepted: true,
    acceptedAt: now.toISOString(),
  };
}

/**
 * Re-validates the browser payload at the same-origin boundary. This function
 * returns a new allowlisted object and never forwards arbitrary request keys.
 */
export function validateFitMeetRegistrationConsent(
  input: unknown,
  now = Date.now(),
): FitMeetRegistrationConsentValidation {
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : null;
  const termsVersion = typeof source?.termsVersion === 'string' ? source.termsVersion.trim() : '';
  const privacyVersion = typeof source?.privacyVersion === 'string' ? source.privacyVersion.trim() : '';

  if (!termsVersion || !privacyVersion) {
    return {
      ok: false,
      status: 400,
      code: 'CONSENT_VERSION_REQUIRED',
      message: '请先阅读并同意当前版本的用户协议和隐私政策。',
    };
  }
  if (
    termsVersion !== FITMEET_CURRENT_REGISTRATION_POLICY.termsVersion ||
    privacyVersion !== FITMEET_CURRENT_REGISTRATION_POLICY.privacyVersion
  ) {
    return {
      ok: false,
      status: 409,
      code: 'CONSENT_VERSION_OUTDATED',
      message: '法律文件已更新，请重新阅读并确认后再注册。',
    };
  }
  if (source?.termsAccepted !== true || source?.privacyAccepted !== true) {
    return {
      ok: false,
      status: 400,
      code: 'EXPLICIT_LEGAL_CONSENT_REQUIRED',
      message: '请明确同意《用户协议》和《隐私政策》。',
    };
  }

  const acceptedAt = typeof source.acceptedAt === 'string' ? source.acceptedAt.trim() : '';
  const acceptedAtMs = Date.parse(acceptedAt);
  if (
    !utcTimestampPattern.test(acceptedAt) ||
    !Number.isFinite(acceptedAtMs) ||
    acceptedAtMs > now + 5 * 60 * 1_000
  ) {
    return {
      ok: false,
      status: 400,
      code: 'CONSENT_TIMESTAMP_INVALID',
      message: '同意记录无效，请重新勾选后再注册。',
    };
  }

  return {
    ok: true,
    value: {
      ...FITMEET_CURRENT_REGISTRATION_POLICY,
      termsAccepted: true,
      privacyAccepted: true,
      acceptedAt: new Date(acceptedAtMs).toISOString(),
    },
  };
}
