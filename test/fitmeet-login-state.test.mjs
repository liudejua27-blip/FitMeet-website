import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  beginFitMeetAuthRequest,
  fitMeetSessionCredentialMatches,
  fitMeetLoginValidationMessage,
  invalidateFitMeetAuthRequest,
  isCurrentFitMeetAuthRequest,
  isValidFitMeetEmail,
  isValidFitMeetPassword,
  normalizeFitMeetEmail,
} from '../lib/fitmeet-login-state.ts';
import {
  fitMeetRegistrationConsentFromExplicitChoice,
  validateFitMeetRegistrationConsent,
} from '../lib/fitmeet-registration-consent.ts';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

test('normalizes the email used by the formal web account flow', () => {
  assert.equal(normalizeFitMeetEmail('  Hello.User@Example.COM  '), 'hello.user@example.com');
});

test('validates the email-only authentication contract', () => {
  assert.equal(isValidFitMeetEmail('hello@example.com'), true);
  assert.equal(isValidFitMeetEmail('not-an-email'), false);
  assert.equal(isValidFitMeetPassword('12345678'), true);
  assert.equal(isValidFitMeetPassword('1234567'), false);
  assert.equal(isValidFitMeetPassword('x'.repeat(73)), false);
});

test('returns the first actionable login validation message', () => {
  assert.equal(
    fitMeetLoginValidationMessage({
      mode: 'login',
      email: '',
      password: '',
      agreementAccepted: false,
    }),
    '请输入有效邮箱地址。',
  );
  assert.equal(
    fitMeetLoginValidationMessage({
      mode: 'login',
      email: 'hello@example.com',
      password: '123',
      agreementAccepted: false,
    }),
    '密码需要 8–72 位。',
  );
  assert.equal(
    fitMeetLoginValidationMessage({
      mode: 'login',
      email: 'hello@example.com',
      password: '12345678',
      agreementAccepted: false,
    }),
    '',
  );
});

test('registration requires a name, matching password and explicit consent', () => {
  const base = {
    mode: 'register',
    email: 'hello@example.com',
    password: '12345678',
    passwordConfirmation: '12345678',
    agreementAccepted: true,
  };
  assert.equal(
    fitMeetLoginValidationMessage({ ...base, name: '' }),
    '请输入你的展示昵称。',
  );
  assert.equal(
    fitMeetLoginValidationMessage({ ...base, name: '小福', passwordConfirmation: '87654321' }),
    '两次输入的密码不一致。',
  );
  assert.equal(
    fitMeetLoginValidationMessage({ ...base, name: '小福', agreementAccepted: false }),
    '请先同意《用户协议》和《隐私政策》。',
  );
  assert.equal(fitMeetLoginValidationMessage({ ...base, name: '小福' }), '');
});

test('registration consent is created only by an explicit checked choice', () => {
  assert.equal(fitMeetRegistrationConsentFromExplicitChoice(false), null);

  const consent = fitMeetRegistrationConsentFromExplicitChoice(
    true,
    new Date('2026-07-29T10:11:12.123Z'),
  );
  assert.deepEqual(consent, {
    termsVersion: '1.0',
    privacyVersion: '1.0',
    termsAccepted: true,
    privacyAccepted: true,
    acceptedAt: '2026-07-29T10:11:12.123Z',
  });
  assert.equal(fitMeetRegistrationConsentFromExplicitChoice(false), null);
});

test('same-origin registration boundary validates and allowlists legal consent', () => {
  const valid = validateFitMeetRegistrationConsent(
    {
      termsVersion: '1.0',
      privacyVersion: '1.0',
      termsAccepted: true,
      privacyAccepted: true,
      acceptedAt: '2026-07-29T10:11:12.123Z',
      unexpectedSensitiveField: 'must-not-forward',
    },
    Date.parse('2026-07-29T10:12:00.000Z'),
  );
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(Object.hasOwn(valid.value, 'unexpectedSensitiveField'), false);
  }

  for (const invalid of [
    null,
    { termsVersion: '0.9', privacyVersion: '1.0', termsAccepted: true, privacyAccepted: true, acceptedAt: '2026-07-29T10:11:12.123Z' },
    { termsVersion: '1.0', privacyVersion: '1.0', termsAccepted: false, privacyAccepted: true, acceptedAt: '2026-07-29T10:11:12.123Z' },
    { termsVersion: '1.0', privacyVersion: '1.0', termsAccepted: true, privacyAccepted: true, acceptedAt: 'not-a-date' },
  ]) {
    assert.equal(validateFitMeetRegistrationConsent(invalid).ok, false);
  }
});

test('a late initial refresh cannot overwrite a newer email login', async () => {
  const epoch = { current: 0 };
  const lateRefresh = deferred();
  const emailLogin = deferred();
  let committedOwner = 'anonymous';

  const refreshEpoch = beginFitMeetAuthRequest(epoch);
  const refreshCommit = lateRefresh.promise.then((owner) => {
    if (isCurrentFitMeetAuthRequest(epoch, refreshEpoch)) committedOwner = owner;
  });

  assert.equal(invalidateFitMeetAuthRequest(epoch, refreshEpoch), true);
  const loginEpoch = beginFitMeetAuthRequest(epoch);
  const loginCommit = emailLogin.promise.then((owner) => {
    if (isCurrentFitMeetAuthRequest(epoch, loginEpoch)) committedOwner = owner;
  });

  emailLogin.resolve('account-b');
  await loginCommit;
  lateRefresh.resolve('account-a');
  await refreshCommit;

  assert.equal(committedOwner, 'account-b');
  assert.equal(isCurrentFitMeetAuthRequest(epoch, refreshEpoch), false);
  assert.equal(invalidateFitMeetAuthRequest(epoch, refreshEpoch), false);
});

test('late profile and onboarding responses cannot update a newer session credential', async () => {
  const lateProfile = deferred();
  const lateOnboarding = deferred();
  const accountACredential = 'token-a';
  let sessionState = {
    accessToken: accountACredential,
    profile: 'profile-a-before',
    onboarding: 'onboarding-a-before',
  };

  const profileCommit = lateProfile.promise.then((profile) => {
    if (fitMeetSessionCredentialMatches(sessionState.accessToken, accountACredential))
      sessionState = { ...sessionState, profile };
  });
  const onboardingCommit = lateOnboarding.promise.then((onboarding) => {
    if (fitMeetSessionCredentialMatches(sessionState.accessToken, accountACredential))
      sessionState = { ...sessionState, onboarding };
  });

  sessionState = {
    accessToken: 'token-b',
    profile: 'profile-b',
    onboarding: 'onboarding-b',
  };
  lateProfile.resolve('profile-a-late');
  lateOnboarding.resolve('onboarding-a-late');
  await Promise.all([profileCommit, onboardingCommit]);

  assert.deepEqual(sessionState, {
    accessToken: 'token-b',
    profile: 'profile-b',
    onboarding: 'onboarding-b',
  });
  assert.equal(fitMeetSessionCredentialMatches('token-b', null), false);
});

test('session hook invalidates failed or aborted refreshes and hydrates with a token-scoped client', () => {
  const sessionHook = readFileSync(
    new URL('../components/fitmeet-app/useFitMeetSession.ts', import.meta.url),
    'utf8',
  );
  const apiClient = readFileSync(
    new URL('../lib/fitmeet-api-client.ts', import.meta.url),
    'utf8',
  );

  assert.match(sessionHook, /const authRequestEpochRef = useRef\(0\)/);
  assert.match(sessionHook, /beginFitMeetAuthRequest\(authRequestEpochRef\)/);
  assert.match(
    sessionHook,
    /invalidateFitMeetAuthRequest\(authRequestEpochRef, requestEpoch\)/,
  );
  assert.match(sessionHook, /new FitMeetApiClient\(\(\) => tokens\.accessToken\)/);
  assert.doesNotMatch(sessionHook, /SESSION_CHECK_TIMEOUT|Promise\.race|4500/);
  assert.match(apiClient, /refreshWebSession\(\)[\s\S]*signal: AbortSignal\.timeout\(5000\)/);
  assert.match(
    sessionHook,
    /isCurrentFitMeetAuthRequest\(authRequestEpochRef, requestEpoch\)[\s\S]*setState\(\{ status: "authenticated"/,
  );
  assert.match(
    sessionHook,
    /current\.status !== "authenticated"[\s\S]*fitMeetSessionCredentialMatches\(current\.session\?\.accessToken, expectedAccessToken\)/,
  );
});

test('all email authentication surfaces use the supplied login brand icon', () => {
  const workbench = readFileSync(
    new URL('../components/fitmeet-app/FitMeetCompleteExperience.tsx', import.meta.url),
    'utf8',
  );
  const emailActionShell = readFileSync(
    new URL('../components/fitmeet-app/EmailActionShell.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    workbench,
    /loadingWorkbench[\s\S]*FitMeetBrandIcon size=\{78\} priority src="\/brand\/fitmeet-login-icon\.png"/,
  );
  assert.match(
    emailActionShell,
    /FitMeetBrandIcon size=\{48\} priority src="\/brand\/fitmeet-login-icon\.png"/,
  );
});

test('the Agent entry is formal email authentication, never an invite-code gate', () => {
  const agentEntry = readFileSync(new URL('../app/agent/try/page.tsx', import.meta.url), 'utf8');
  const workbench = readFileSync(
    new URL('../components/fitmeet-app/FitMeetCompleteExperience.tsx', import.meta.url),
    'utf8',
  );

  assert.match(agentEntry, /FitMeetCompleteExperience/);
  assert.doesNotMatch(`${agentEntry}\n${workbench}`, /内测邀请码|进入内测|邀请码|invite.?code/i);
});
