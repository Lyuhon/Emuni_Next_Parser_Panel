import { NextResponse } from 'next/server';
import { cookieOptions, createSession, sameOrigin, SESSION_COOKIE } from '@/lib/session';
import { safeEqual, verifyPassword } from '@/lib/password';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Ограничение подбора пароля: 5 неудач / 15 минут на IP.
// На serverless память живёт недолго, поэтому это «лучшее из возможного» поверх
// медленного scrypt и задержки при ошибке; для жёсткого лимита включите Vercel Firewall rate limit.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
}

function blocked(ip: string): boolean {
  const rec = fails.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) { fails.delete(ip); return false; }
  return rec.count >= MAX_FAILS;
}

function registerFail(ip: string) {
  const rec = fails.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) fails.set(ip, { count: 1, first: Date.now() });
  else rec.count += 1;
  if (fails.size > 5000) fails.clear();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash || (process.env.SESSION_SECRET || '').length < 32) {
    return NextResponse.json({ detail: 'Авторизация не настроена на сервере' }, { status: 500 });
  }

  const ip = clientIp(req);
  if (blocked(ip)) {
    return NextResponse.json({ detail: 'Слишком много попыток. Попробуйте через 15 минут.' }, { status: 429 });
  }

  let body: { username?: unknown; password?: unknown } = {};
  try { body = await req.json(); } catch { /* пустое тело */ }
  const username = typeof body.username === 'string' ? body.username.slice(0, 100) : '';
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

  // оба сравнения выполняются всегда — время ответа не выдаёт, что именно неверно
  const userOk = safeEqual(username, expectedUser);
  const passOk = verifyPassword(password, expectedHash);

  if (!(userOk && passOk)) {
    registerFail(ip);
    await sleep(600);
    return NextResponse.json({ detail: 'Неверный логин или пароль' }, { status: 401 });
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(username), cookieOptions);
  return res;
}
