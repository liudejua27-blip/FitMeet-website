import { NextResponse } from 'next/server';
import { forwardFitMeetEmailAction } from '@/lib/fitmeet-email-action-server';
import { isValidEmailActionToken } from '@/lib/fitmeet-email-action-token';
import { isValidFitMeetPassword } from '@/lib/fitmeet-login-state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const token = body && typeof body === 'object' ? (body as { token?: unknown }).token : null;
  const password = body && typeof body === 'object' ? (body as { password?: unknown }).password : null;
  if (!isValidEmailActionToken(token))
    return NextResponse.json({ message: '重置链接无效或已过期。' }, { status: 400 });
  if (typeof password !== 'string' || !isValidFitMeetPassword(password))
    return NextResponse.json({ message: '密码需要 8–72 位。' }, { status: 400 });
  return forwardFitMeetEmailAction({
    path: '/auth/password/reset',
    body: { token: token.trim(), password },
    fallbackMessage: '密码重置暂时不可用，请稍后重试。',
  });
}
