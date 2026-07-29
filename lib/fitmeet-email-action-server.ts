import 'server-only';

import { NextResponse } from 'next/server';
import {
  fitMeetServerApiBase,
  fitMeetWebClientHeaders,
  upstreamCode,
  upstreamMessage,
} from '@/lib/fitmeet-web-auth-server';

export async function forwardFitMeetEmailAction({
  path,
  body,
  fallbackMessage,
}: {
  path: string;
  body: Record<string, string>;
  fallbackMessage: string;
}) {
  try {
    const response = await fetch(`${fitMeetServerApiBase()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...fitMeetWebClientHeaders() },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(9000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          message: upstreamMessage(payload, fallbackMessage),
          ...(upstreamCode(payload) ? { code: upstreamCode(payload) } : {}),
        },
        {
          status: response.status,
          headers: {
            'Cache-Control': 'no-store, private',
            ...(response.headers.get('retry-after')
              ? { 'Retry-After': response.headers.get('retry-after') as string }
              : {}),
          },
        },
      );
    }
    return NextResponse.json(payload, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store, private' },
    });
  } catch {
    return NextResponse.json(
      { message: fallbackMessage },
      { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }
}
