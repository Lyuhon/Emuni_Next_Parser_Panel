#!/usr/bin/env node
// Использование:
//   npm run hash-password -- 'ваш-пароль'
//   npm run hash-password            (спросит пароль без вывода на экран)
// Результат вставить в ADMIN_PASSWORD_HASH (Vercel → Settings → Environment Variables).
import { randomBytes, scryptSync } from 'node:crypto';

async function readHidden(prompt) {
  process.stdout.write(prompt);
  const stdin = process.stdin;
  stdin.setRawMode?.(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  let buf = '';
  return new Promise((resolve) => {
    stdin.on('data', (ch) => {
      for (const c of ch) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode?.(false); stdin.pause(); process.stdout.write('\n'); return resolve(buf);
        }
        if (c === '\u0003') process.exit(1);
        if (c === '\u007f') buf = buf.slice(0, -1); else buf += c;
      }
    });
  });
}

const password = process.argv[2] ?? (await readHidden('Новый пароль: '));
if (password.length < 12) {
  console.error('Пароль должен быть не короче 12 символов.');
  process.exit(1);
}

const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N, r, p });
console.log(`scrypt:${N}:${r}:${p}:${salt.toString('base64url')}:${hash.toString('base64url')}`);
