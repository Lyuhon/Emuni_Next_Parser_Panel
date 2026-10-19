# EMU Parser — панель управления

Next.js 16 (App Router) + Tailwind 4. Деплой — Vercel. Подробная документация проекта: [`../../CLAUDE.md`](../../CLAUDE.md).

## Запуск

```bash
npm install
cp .env.example .env.local     # заполнить 5 переменных
npm run hash-password -- 'пароль-от-12-символов'   # результат → ADMIN_PASSWORD_HASH
npm run dev
```

## Как устроена защита

- `proxy.ts` пускает на страницы только с валидной сессией, иначе редирект на `/login`.
- `/api/auth/login` — проверка логина/пароля (scrypt), лимит попыток, подписанная httpOnly-cookie.
- `/api/backend/*` — серверный прокси к бэкенду: проверяет сессию и подставляет `BACKEND_API_TOKEN`.
  Ни токена, ни адреса бэкенда в браузере нет.

## Переменные окружения (серверные)

`BACKEND_URL`, `BACKEND_API_TOKEN`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` — см. `.env.example`.
