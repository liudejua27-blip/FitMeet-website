import { NextResponse } from 'next/server';
import { forwardFitMeetEmailAction } from '@/lib/fitmeet-email-action-server';
import { isValidFitMeetEmail, normalizeFitMeetEmail } from '@/lib/fitmeet-login-state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const email = body && typeof body === 'object' ? (body as { email?: unknown }).email : null;
  if (typeof email !== 'string' || !isValidFitMeetEmail(email))
    return NextResponse.json({ message: '请输入有效邮箱地址。' }, { status: 400 });
  return forwardFitMeetEmailAction({
    path: '/auth/email/verification/resend',
    body: { email: normalizeFitMeetEmail(email) },
    fallbackMessage: '验证邮件暂时无法发送，请稍后重试。',
  });
}
