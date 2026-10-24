import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Кто вошёл и с какой ролью (интерфейс прячет недоступные разделы; настоящая проверка — в прокси)
export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  if (!session) return NextResponse.json({ detail: 'Не авторизован' }, { status: 401 });
  return NextResponse.json(session, { headers: { 'cache-control': 'no-store' } });
}
