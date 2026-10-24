// Серверный прокси к бэкенду. Браузер знает только этот адрес и свою cookie-сессию;
// Bearer-токен бэкенда (BACKEND_API_TOKEN) никогда не попадает в браузер.
import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin, SESSION_COOKIE, verifySession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 4 * 1024 * 1024; // лимит тела serverless-функции Vercel ≈ 4.5 МБ

// Разрешённые маршруты бэкенда и роли, которым они доступны. Всё остальное через прокси недоступно.
//   admin      — всё;
//   site_admin — только обзор, посты и публикация на сайт (см. дополнительные проверки ниже).
type Role = 'admin' | 'site_admin';
const BOTH: Role[] = ['admin', 'site_admin'];
const ADMIN: Role[] = ['admin'];
const ROUTES: [RegExp, string[], Role[]][] = [
  [/^stats$/, ['GET'], BOTH],
  [/^posts$/, ['GET'], BOTH],
  [/^posts\/\d+$/, ['GET'], BOTH],
  [/^posts\/\d+\/action$/, ['POST'], BOTH],
  [/^posts\/\d+\/images$/, ['POST'], BOTH],
  [/^admins$/, ['GET', 'POST'], ADMIN],
  [/^admins\/\d+$/, ['DELETE'], ADMIN],
  [/^parse-now$/, ['POST'], ADMIN],
  [/^parse-status$/, ['GET'], ADMIN],
  [/^health-check$/, ['GET'], ADMIN],
  [/^logs$/, ['GET'], ADMIN],
];

const json = (detail: string, status: number) => NextResponse.json({ detail }, { status });

async function siteAdminBodyDenied(sub: string, body: ArrayBuffer, contentType: string | null): Promise<string | null> {
  if (/^posts\/\d+\/action$/.test(sub)) {
    try {
      const data = JSON.parse(new TextDecoder().decode(body));
      return data?.channel === 'website' ? null : 'Недостаточно прав: доступна только публикация на сайт';
    } catch { return 'Некорректный запрос'; }
  }
  if (/^posts\/\d+\/images$/.test(sub)) {
    try {
      const form = await new Response(body, { headers: { 'content-type': contentType || '' } }).formData();
      const keys = new Set(Array.from(form.keys()));
      if (keys.has('tg_images') || keys.has('tg_existing_urls')) return 'Недостаточно прав: фото Telegram менять нельзя';
      if (form.get('keep_tg') !== 'true') return 'Недостаточно прав: запрос должен менять только фото сайта';
      return null;
    } catch { return 'Некорректный запрос'; }
  }
  return null;
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  if (!session) return json('Не авторизован', 401);

  const method = req.method;
  if (method !== 'GET' && !sameOrigin(req)) return json('Forbidden', 403);

  const { path } = await ctx.params;
  const sub = path.join('/');
  const route = ROUTES.find(([re]) => re.test(sub));
  if (!route) return json('Not found', 404);
  if (!route[1].includes(method)) return json('Method not allowed', 405);
  if (!route[2].includes(session.role)) return json('Недостаточно прав', 403);

  const base = (process.env.BACKEND_URL || '').replace(/\/$/, '');
  const token = process.env.BACKEND_API_TOKEN;
  if (!base || !token) return json('Бэкенд не настроен (BACKEND_URL / BACKEND_API_TOKEN)', 500);

  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  let body: ArrayBuffer | undefined;
  if (method === 'POST') {
    const len = Number(req.headers.get('content-length') || 0);
    if (len > MAX_BODY) return json('Слишком большой запрос (макс. 4 МБ)', 413);
    body = await req.arrayBuffer();
    if (body.byteLength > MAX_BODY) return json('Слишком большой запрос (макс. 4 МБ)', 413);
    const ct = req.headers.get('content-type');
    if (ct) headers['Content-Type'] = ct;

    // site_admin: только сайт. Проверяем содержимое запроса, а не доверяем интерфейсу.
    if (session.role === 'site_admin') {
      const denied = await siteAdminBodyDenied(sub, body, ct);
      if (denied) return json(denied, 403);
    }
  }

  try {
    const upstream = await fetch(`${base}/api/${sub}${req.nextUrl.search}`, {
      method, headers, body, cache: 'no-store', signal: AbortSignal.timeout(60_000),
    });
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json',
        'cache-control': 'no-store',
      },
    });
  } catch {
    return json('Сервер парсера недоступен', 502);
  }
}

export { handle as GET, handle as POST, handle as DELETE };
