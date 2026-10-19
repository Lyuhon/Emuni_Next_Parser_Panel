'use client';

import { useState, type FormEvent } from 'react';
import { Instagram, Loader2, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.href = '/';   // полная перезагрузка — страница получит cookie
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.detail || `Ошибка ${res.status}`);
      setPassword('');
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4"
      style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-gray-900 leading-tight">EMU Парсер</h1>
            <p className="text-[12px] text-gray-400">Вход в панель управления</p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Логин</span>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required
              className="w-full pl-9 pr-3 py-2.5 text-[14px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:bg-white transition-all" />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Пароль</span>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
              className="w-full pl-9 pr-3 py-2.5 text-[14px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:bg-white transition-all" />
          </div>
        </label>

        <div role="alert" aria-live="polite" className={`text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 ${error ? '' : 'hidden'}`}>
          {error}
        </div>

        <button type="submit" disabled={loading || !username || !password}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Входим…</> : 'Войти'}
        </button>
      </form>
    </main>
  );
}
