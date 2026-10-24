// Сессия панели: подписанный JWT в httpOnly-cookie. Секреты живут только на сервере (Vercel env).
import { SignJWT, jwtVerify } from 'jose';

const isProd = process.env.NODE_ENV === 'production';
// В проде префикс __Host- запрещает перезапись cookie с поддоменов
export const SESSION_COOKIE = isProd ? '__Host-emu_session' : 'emu_session';
export type Role = 'admin' | 'site_admin';
export const SESSION_TTL_SEC = 12 * 60 * 60;

function key(): Uint8Array {
  const secret = process.env.SESSION_SECRET || '';
  if (secret.length < 32) throw new Error('SESSION_SECRET должен быть не короче 32 символов');
  return new TextEncoder().encode(secret);
}

export async function createSession(username: string, role: Role): Promise<string> {
  return new SignJWT({ sub: username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(key());
}

export async function verifySession(token?: string): Promise<{ username: string; role: Role } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    if (!payload.sub) return null;
    // сессии, выданные до появления ролей, принадлежали единственному админу
    const role: Role = payload.role === 'site_admin' ? 'site_admin' : 'admin';
    return { username: String(payload.sub), role };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: SESSION_TTL_SEC,
};

/** CSRF: изменяющие запросы принимаем только с нашего же origin. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
