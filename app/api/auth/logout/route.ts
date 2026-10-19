import { NextResponse } from 'next/server';
import { sameOrigin, SESSION_COOKIE, cookieOptions } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return res;
}
