import { NextResponse } from 'next/server';
import { forwardFitMeetEmailAction } from '@/lib/fitmeet-email-action-server';
import { isValidEmailActionToken } from '@/lib/fitmeet-email-action-token';
import { validateFitMeetWebOrigin } from '@/lib/fitmeet-web-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = validateFitMeetWebOrigin(request);
  if (!origin.ok)
    return NextResponse.json(origin, { status: 403, headers: { 'Cache-Control': 'no-store, private' } });
  const body: unknown = await request.json().catch(() => null);
  const token = body && typeof body === 'object' ? (body as { token?: unknown }).token : null;
  if (!isValidEmailActionToken(token))
    return NextResponse.json({ message: '验证链接无效或已过期。' }, { status: 400 });
  return forwardFitMeetEmailAction({
    path: '/auth/email/verify',
    body: { token: token.trim() },
    fallbackMessage: '邮箱验证暂时不可用，请稍后重试。',
  });
}
