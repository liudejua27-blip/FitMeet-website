import { NextResponse } from 'next/server';
import { forwardFitMeetEmailAuth } from '@/lib/fitmeet-email-auth-server';
import { isValidFitMeetEmail, isValidFitMeetPassword, normalizeFitMeetEmail } from '@/lib/fitmeet-login-state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const email = body && typeof body === 'object' ? (body as { email?: unknown }).email : null;
  const password = body && typeof body === 'object' ? (body as { password?: unknown }).password : null;

  if (typeof email !== 'string' || !isValidFitMeetEmail(email))
    return NextResponse.json({ message: '请输入有效邮箱地址。' }, { status: 400 });
  if (typeof password !== 'string' || !isValidFitMeetPassword(password))
    return NextResponse.json({ message: '密码需要 8–72 位。' }, { status: 400 });

  return forwardFitMeetEmailAuth({
    action: 'login',
    body: { email: normalizeFitMeetEmail(email), password },
    fallbackMessage: '邮箱或密码错误。',
  });
}
