import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { validateFitMeetWebOrigin } from '../lib/fitmeet-web-origin.ts';

function request(url, origin, fetchSite = 'same-origin') {
  return new Request(url, {
    method: 'POST',
    headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(fetchSite ? { 'Sec-Fetch-Site': fetchSite } : {}),
    },
  });
}

test('production auth mutations require the canonical FitMeet origin', () => {
  assert.deepEqual(
    validateFitMeetWebOrigin(request('https://fitmeet.cn/api/auth/login'), 'production'),
    {
      ok: false,
      code: 'AUTH_ORIGIN_REQUIRED',
      message: '无法确认登录请求来源，请刷新页面后重试。',
    },
  );
  assert.equal(
    validateFitMeetWebOrigin(
      request('https://fitmeet.cn/api/auth/login', 'https://fitmeet.cn'),
      'production',
    ).ok,
    true,
  );
  assert.equal(
    validateFitMeetWebOrigin(
      request('https://www.fitmeet.cn/api/auth/login', 'https://www.fitmeet.cn'),
      'production',
    ).ok,
    true,
  );
  assert.equal(
    validateFitMeetWebOrigin(
      request('https://fitmeet.cn/api/auth/login', 'https://www.ourfitmeet.cn'),
      'production',
    ).ok,
    false,
  );
  assert.equal(
    validateFitMeetWebOrigin(
      request('https://fitmeet.cn/api/auth/login', 'https://fitmeet.cn', 'cross-site'),
      'production',
    ).ok,
    false,
  );
});

test('local auth mutations remain available only on the exact development origin', () => {
  assert.equal(
    validateFitMeetWebOrigin(
      request('http://127.0.0.1:3000/api/auth/login', 'http://127.0.0.1:3000'),
      'development',
    ).ok,
    true,
  );
  assert.equal(
    validateFitMeetWebOrigin(
      request('http://127.0.0.1:3000/api/auth/login', 'http://127.0.0.1:3001'),
      'development',
    ).ok,
    false,
  );
});

test('every same-origin auth mutation route enforces the shared origin boundary', async () => {
  const routes = [
    'app/api/auth/login/route.ts',
    'app/api/auth/register/route.ts',
    'app/api/auth/refresh/route.ts',
    'app/api/auth/logout/route.ts',
    'app/api/auth/email/verification/resend/route.ts',
    'app/api/auth/email/verify/route.ts',
    'app/api/auth/password/forgot/route.ts',
    'app/api/auth/password/reset/route.ts',
  ];
  for (const route of routes) {
    const source = await readFile(new URL(`../${route}`, import.meta.url), 'utf8');
    assert.match(source, /validateFitMeetWebOrigin\(request\)/, route);
    assert.match(source, /status: 403/, route);
  }
});
