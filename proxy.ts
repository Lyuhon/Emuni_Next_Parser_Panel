// Next.js 16: proxy.ts (бывший middleware.ts). Закрывает все страницы, кроме /login.
// API-маршруты дополнительно проверяют сессию сами (defense in depth).
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);

  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL('/', req.url)) : NextResponse.next();
  }
  if (pathname.startsWith('/api/auth/')) return NextResponse.next();

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ detail: 'Не авторизован' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  // всё, кроме статики Next и картинок (логотип нужен на странице входа, до авторизации).
  // API-маршрутов с расширением файла нет, так что закрытые данные под это исключение не попадают.
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
};
