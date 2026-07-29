import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import { fitMeetEmailActionTokenFromFragment } from '../lib/fitmeet-email-action-client.ts';
import { isValidEmailActionToken } from '../lib/fitmeet-email-action-token.ts';

test('accepts only bounded URL-safe email action tokens from the fragment', () => {
  const token = 'A_b-'.repeat(11);
  assert.equal(token.length, 44);
  assert.equal(isValidEmailActionToken(token), true);
  assert.equal(fitMeetEmailActionTokenFromFragment(`#token=${token}`), token);
  assert.equal(fitMeetEmailActionTokenFromFragment(`?token=${token}`), null);
  assert.equal(fitMeetEmailActionTokenFromFragment('#token=short'), null);
  assert.equal(fitMeetEmailActionTokenFromFragment(`#other=${token}`), null);
});

test('email action pages strip URL data, keep tokens out of browser storage and send actions to same-origin proxies', async () => {
  const [verify, reset, forgot, nextConfig] = await Promise.all([
    fs.readFile(new URL('../components/fitmeet-app/EmailVerificationExperience.tsx', import.meta.url), 'utf8'),
    fs.readFile(new URL('../components/fitmeet-app/ResetPasswordExperience.tsx', import.meta.url), 'utf8'),
    fs.readFile(new URL('../components/fitmeet-app/ForgotPasswordExperience.tsx', import.meta.url), 'utf8'),
    fs.readFile(new URL('../next.config.mjs', import.meta.url), 'utf8'),
  ]);

  for (const source of [verify, reset]) {
    assert.match(source, /window\.location\.hash/);
    assert.match(source, /history\.replaceState\(null, '', window\.location\.pathname\)/);
    assert.doesNotMatch(source, /localStorage|sessionStorage|useSearchParams/);
  }
  assert.match(verify, /verifyWebEmail\(token\)/);
  assert.match(reset, /resetWebPassword\(token, password\)/);
  assert.match(forgot, /requestWebPasswordReset\(normalizeFitMeetEmail\(email\)\)/);
  assert.match(nextConfig, /no-store, private, max-age=0, must-revalidate/);
  assert.match(nextConfig, /Referrer-Policy', value: 'no-referrer'/);
  assert.match(nextConfig, /X-Robots-Tag', value: 'noindex, nofollow, noarchive'/);
  assert.match(nextConfig, /websocketUrl\.protocol = apiUrl\.protocol === 'https:' \? 'wss:' : 'ws:'/);
  assert.match(nextConfig, /developmentConnectOrigins/);
});
