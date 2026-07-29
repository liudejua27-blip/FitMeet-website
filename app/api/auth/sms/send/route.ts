import { NextResponse } from 'next/server';
import { fitMeetServerApiBase, upstreamMessage } from '@/lib/fitmeet-web-auth-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const phone = body && typeof body === 'object' ? (body as { phone?: unknown }).phone : null;
  if (typeof phone !== 'string' || !/^1\d{10}$/.test(phone.trim()))
    return NextResponse.json({ message: '请输入有效手机号。' }, { status: 400 });

  try {
    const response = await fetch(`${fitMeetServerApiBase()}/auth/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() }),
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok)
      return NextResponse.json(
        { message: upstreamMessage(payload, '验证码发送失败，请稍后重试。') },
        { status: response.status },
      );
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch {
    return NextResponse.json({ message: '暂时无法连接 FitMeet 服务。' }, { status: 503 });
  }
}
