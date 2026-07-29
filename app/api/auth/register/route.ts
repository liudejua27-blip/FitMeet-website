import { NextResponse } from 'next/server';
import { forwardFitMeetEmailAuth } from '@/lib/fitmeet-email-auth-server';
import { isValidFitMeetEmail, isValidFitMeetPassword, normalizeFitMeetEmail } from '@/lib/fitmeet-login-state';
import { validateFitMeetRegistrationConsent } from '@/lib/fitmeet-registration-consent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const email = body && typeof body === 'object' ? (body as { email?: unknown }).email : null;
  const password = body && typeof body === 'object' ? (body as { password?: unknown }).password : null;
  const name = body && typeof body === 'object' ? (body as { name?: unknown }).name : null;
  const consents = body && typeof body === 'object' ? (body as { consents?: unknown }).consents : null;

  if (typeof name !== 'string' || !name.trim() || name.trim().length > 32)
    return NextResponse.json({ message: '请输入 1–32 位展示昵称。' }, { status: 400 });
  if (typeof email !== 'string' || !isValidFitMeetEmail(email))
    return NextResponse.json({ message: '请输入有效邮箱地址。' }, { status: 400 });
  if (typeof password !== 'string' || !isValidFitMeetPassword(password))
    return NextResponse.json({ message: '密码需要 8–72 位。' }, { status: 400 });

  const consent = validateFitMeetRegistrationConsent(consents);
  if (!consent.ok)
    return NextResponse.json(
      { code: consent.code, message: consent.message },
      { status: consent.status, headers: { 'Cache-Control': 'no-store, private' } },
    );

  return forwardFitMeetEmailAuth({
    action: 'register',
    body: {
      email: normalizeFitMeetEmail(email),
      password,
      name: name.trim(),
      consents: consent.value,
    },
    fallbackMessage: '暂时无法创建账号，请稍后重试。',
  });
}
