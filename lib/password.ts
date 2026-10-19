// Проверка пароля: scrypt, формат хэша  scrypt:N:r:p:<salt base64url>:<hash base64url>
// Хэш создаётся командой `npm run hash-password` (scripts/hash-password.mjs).
// Двоеточия вместо `$` — чтобы dotenv не пытался раскрывать переменные.
import { scryptSync, timingSafeEqual } from 'node:crypto';

// Хэш-пустышка: при неверном логине тратим то же время, что и при неверном пароле
const DUMMY = 'scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA:' + 'A'.repeat(86);

export function verifyPassword(password: string, stored: string | undefined): boolean {
  const parts = (stored || DUMMY).split(':');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  try {
    const salt = Buffer.from(saltB64, 'base64url');
    const expected = Buffer.from(hashB64, 'base64url');
    const actual = scryptSync(password, salt, expected.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 128 * 1024 * 1024,
    });
    return stored !== undefined && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
