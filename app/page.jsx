// with normal UI and API
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Instagram, Settings, LayoutDashboard,
  Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Clock, ExternalLink, ArrowUpRight,
  Menu, X, RefreshCw, ImageIcon, Globe, Send, Trash2,
  MoreHorizontal, FileText, CheckCheck, BanIcon, UserMinus,
  User, Plus, Loader2, Zap, ImagePlus, Pencil, AlertTriangle, LogOut
} from 'lucide-react';

// Все запросы идут на свой же origin: серверный прокси (app/api/backend) проверяет сессию
// и добавляет токен бэкенда. Ни токена, ни адреса бэкенда в браузере нет.
const API = '/api/backend';
const PAGE_SIZE = 10;

async function apiFetch(path, options = {}) {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const res = await fetch(`${API}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) },
  });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Сессия истекла');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = Array.isArray(err.detail) ? 'Некорректные данные' : err.detail;
    throw new Error(detail || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Ссылка на пост на сайте: бэкенд отдаёт путь (/slug/) или полный URL
function wpLink(link) {
  if (!link) return '';
  return /^https?:\/\//.test(link) ? link : `https://www.emuni.uz/blog${link}`;
}

// Сжатие перед загрузкой: JPEG до 1600px. Запрос идёт через Vercel (лимит тела ~4.5 МБ),
// а оригиналы с телефона весят по 3–8 МБ.
async function compressImage(file, maxSide = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('Не удалось прочитать изображение');
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
  if (!blob) throw new Error('Не удалось сжать изображение');
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

// Картинка с ленивой загрузкой и плавным появлением (key={src} сбрасывает состояние при смене картинки)
function ImgInner({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img src={src} alt={alt} loading="lazy" decoding="async"
      ref={(el) => { if (el?.complete) setLoaded(true); }}
      onLoad={() => setLoaded(true)} onError={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
  );
}
function Img({ src, alt = '', className = '' }) {
  return <ImgInner key={src} src={src} alt={alt} className={className} />;
}

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${min}, ${dd}.${mm}.${yyyy}`;
}
function fmtDateShort(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3" />Одобрено
    </span>
  );
  if (status === 'declined') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">
      <XCircle className="w-3 h-3" />Отклонено
    </span>
  );
  if (status === 'publishing') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">
      <Loader2 className="w-3 h-3 animate-spin" />Публикуется
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-50 text-amber-600 border border-amber-100 whitespace-nowrap">
      <Clock className="w-3 h-3" />Ожидает
    </span>
  );
}

function StatCard({ title, value, icon: Icon, accent, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || 'bg-gray-100'}`}>
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
      </div>
      <p className="text-[24px] sm:text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-1.5">{(value ?? 0).toLocaleString()}</p>
      <p className="text-[13px] text-gray-500 font-medium">{title}</p>
      {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Pagination({ currentPage, totalPages, total, onPageChange }) {
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) range.push(i);
  const btn = (p, label, active = false, disabled = false) => (
    <button key={typeof label === 'string' ? label : p} onClick={() => !disabled && onPageChange(p)} disabled={disabled}
      className={`min-w-[28px] h-7 px-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>{label}</button>
  );
  return (
    <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p className="text-[13px] text-gray-400 order-2 sm:order-1">{total.toLocaleString()} всего · стр. <span className="text-gray-600 font-medium">{currentPage}</span> из <span className="text-gray-600 font-medium">{totalPages}</span></p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {btn(currentPage - 1, <ChevronLeft className="w-3.5 h-3.5" />, false, currentPage === 1)}
        {range[0] > 1 && <>{btn(1, '1')}{range[0] > 2 && <span className="text-gray-300 text-xs px-0.5">…</span>}</>}
        {range.map(p => btn(p, p, p === currentPage))}
        {range[range.length - 1] < totalPages && <>{range[range.length - 1] < totalPages - 1 && <span className="text-gray-300 text-xs px-0.5">…</span>}{btn(totalPages, totalPages)}</>}
        {btn(currentPage + 1, <ChevronRight className="w-3.5 h-3.5" />, false, currentPage === totalPages)}
      </div>
    </div>
  );
}

function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{text}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ─── Parse Overlay ────────────────────────────────────────────────────────────

const RESULT_TEXT = {
  nothing: 'Новых постов нет',
  quota: 'OpenAI: закончились кредиты. Пополните баланс — перевод повторится автоматически.',
};

function ParseOverlay({ onDone }) {
  const [status, setStatus] = useState('running');
  const [msg, setMsg] = useState('Запрашиваем Instagram через Apify…');

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const finish = (st, text, delay) => { if (cancelled) return; setStatus(st); setMsg(text); setTimeout(onDone, delay); };

    (async () => {
      try {
        const before = await apiFetch('/parse-status');
        try { await apiFetch('/parse-now', { method: 'POST' }); }
        catch (e) { if (!/уже выполняется/.test(e.message)) throw e; }   // уже идёт — просто ждём

        const t0 = Date.now();
        while (!cancelled && Date.now() - t0 < 5 * 60 * 1000) {
          await sleep(2000);
          const st = await apiFetch('/parse-status');
          const elapsed = Date.now() - t0;
          setMsg(elapsed < 8000 ? 'Ищем новые посты…' : elapsed < 20000 ? 'Переводим через OpenAI…' : 'Сохраняем и отправляем уведомления…');
          if (!st.running && st.last_run && st.last_run !== before.last_run) {
            if (st.last_result === 'ok') return finish('done', `Добавлено постов: ${st.last_created}`, 1500);
            if (st.last_result === 'nothing') return finish('done', RESULT_TEXT.nothing, 1500);
            if (st.last_result === 'quota') return finish('error', RESULT_TEXT.quota, 4500);
            return finish('error', st.last_error || 'Ошибка парсинга', 3500);
          }
        }
        finish('error', 'Парсинг идёт дольше обычного — проверьте позже', 3000);
      } catch (e) {
        finish('error', 'Ошибка: ' + e.message, 3000);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 w-full max-w-sm mx-4 text-center space-y-5">
        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${status === 'done' ? 'bg-emerald-50' : status === 'error' ? 'bg-red-50' : 'bg-gray-50'}`}>
          {status === 'running' && <Loader2 className="w-7 h-7 text-gray-400 animate-spin" />}
          {status === 'done' && <CheckCircle2 className="w-7 h-7 text-emerald-500" />}
          {status === 'error' && <XCircle className="w-7 h-7 text-red-500" />}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-gray-900 mb-1">{status === 'running' ? 'Парсинг запущен' : status === 'done' ? 'Готово' : 'Ошибка'}</p>
          <p className="text-[13px] text-gray-500">{msg}</p>
        </div>
        {status === 'running' && <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden"><div className="h-full bg-gray-400 rounded-full animate-pulse" style={{ width: '60%' }} /></div>}
      </div>
    </div>
  );
}

// ─── TG Photo Gallery ─────────────────────────────────────────────────────────

const MAX_TG_PHOTOS = 4;
const MAX_FILE_MB = 15;   // размер исходника; перед отправкой фото сжимается до ~0.3–0.8 МБ

function TgPhotoGallery({ originalUrl, photos, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const prepare = async (file) => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`Исходный файл больше ${MAX_FILE_MB} МБ.`); return null; }
    if (!file.type.startsWith('image/')) { setError('Нужен файл-изображение.'); return null; }
    try { const small = await compressImage(file); setError(''); return small; }
    catch (e) { setError(e.message); return null; }
  };

  const handleAdd = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (photos.length >= MAX_TG_PHOTOS) { setError(`Максимум ${MAX_TG_PHOTOS} фото.`); return; }
    const small = await prepare(file);
    if (!small) return;
    onChange([...photos, { id: Date.now(), url: URL.createObjectURL(small), file: small, isOriginal: false }]);
  };

  const handleReplace = async (id, e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    const small = await prepare(file);
    if (!small) return;
    onChange(photos.map(p => p.id === id ? { ...p, url: URL.createObjectURL(small), file: small, isOriginal: false } : p));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-gray-500">До {MAX_TG_PHOTOS} фото, сжимаются автоматически</p>
        <span className="text-[12px] text-gray-400 font-medium">{photos.length}/{MAX_TG_PHOTOS}</span>
      </div>
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-[12px]"><XCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, idx) => (
          <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-video">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-[12px] font-medium text-gray-800 shadow cursor-pointer hover:bg-gray-50">
                <Pencil className="w-3 h-3" />Заменить
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReplace(photo.id, e)} />
              </label>
              <button onClick={() => onChange(photos.filter(p => p.id !== photo.id))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium shadow hover:bg-red-600 cursor-pointer">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</div>
            {photo.isOriginal && <div className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-md">Оригинал</div>}
          </div>
        ))}
        {photos.length < MAX_TG_PHOTOS && (
          <button onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 cursor-pointer">
            <ImagePlus className="w-6 h-6" />
            <span className="text-[12px] font-medium">Добавить фото</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAdd} />
      {photos.length === 0 && <p className="text-[12px] text-gray-400 text-center py-2">Нет фото — будет использовано оригинальное</p>}
    </div>
  );
}

// ─── Site Image Replace ───────────────────────────────────────────────────────

function SiteImageReplace({ originalUrl, siteUrl, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const activeUrl = (typeof siteUrl === 'string' ? siteUrl : siteUrl?.url) || originalUrl;

  const handleFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`Исходный файл больше ${MAX_FILE_MB} МБ.`); return; }
    if (!file.type.startsWith('image/')) { setError('Нужен файл-изображение.'); return; }
    try {
      const small = await compressImage(file);
      setError('');
      onChange({ url: URL.createObjectURL(small), file: small });
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray-500">Можно только <strong className="text-gray-700">заменить</strong> фото. Фото сжимается автоматически.</p>
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-[12px]"><XCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
      <div className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-video max-w-[50%]">
        {activeUrl ? <img src={activeUrl} alt="" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400"><ImageIcon className="w-8 h-8" /></div>}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[12px] font-medium text-gray-800 shadow hover:bg-gray-50 cursor-pointer">
            <Pencil className="w-3.5 h-3.5" />Заменить
          </button>
          {activeUrl && activeUrl !== originalUrl && (
            <button onClick={() => { onChange(null); setError(''); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium shadow hover:bg-red-600 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {siteUrl && siteUrl !== originalUrl && <div className="absolute top-2 right-2 text-[10px] font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">Заменено</div>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 text-[13px] text-gray-500 font-medium transition-all cursor-pointer">
        <Pencil className="w-3.5 h-3.5" />Заменить фото для сайта
      </button>
      {activeUrl && activeUrl !== originalUrl && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Фото заменено</p>
          <button onClick={() => { onChange(null); setError(''); }} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">← Вернуть оригинал</button>
        </div>
      )}
    </div>
  );
}

// ─── Post Modal ───────────────────────────────────────────────────────────────

function PostModal({ post, onClose, onAction, onRefresh }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeImageTab, setActiveImageTab] = useState('tg');
  const [activeContentTab, setActiveContentTab] = useState('site');
  const [acting, setActing] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [titlesExpanded, setTitlesExpanded] = useState(false);
  const [modalError, setModalError] = useState('');

  const [tgPhotos, setTgPhotos] = useState([]);
  const [siteImage, setSiteImage] = useState(null);

  // Синхронизация state при смене поста или после сохранения
  useEffect(() => {
    if (!post) return;
    if (post.tg_images?.length) {
      setTgPhotos(post.tg_images.map((url, i) => ({ id: `orig-${i}`, url, isOriginal: false, persisted: true })));
    } else if (post.image_url) {
      setTgPhotos([{ id: 'orig-main', url: post.image_url, isOriginal: true, persisted: true }]);
    } else {
      setTgPhotos([]);
    }
    setSiteImage(post.site_image_url ? { url: post.site_image_url, persisted: true } : null);
    setTitlesExpanded(false);
  }, [post?.id, post?.tg_images, post?.image_url, post?.site_image_url]);

  if (!post) return null;

  const hasNewTgFiles = tgPhotos.some(p => p.file);
  const hasNewSiteFile = !!siteImage?.file;
  const tgWasReset = (post.tg_images?.length || 0) > 0 && tgPhotos.length === 0;
  const siteWasReset = !!post.site_image_url && !siteImage;
  const imagesDirty = hasNewTgFiles || hasNewSiteFile || tgWasReset || siteWasReset;

  const handleSaveImages = async () => {
    setModalError('');
    const newFiles = [...tgPhotos.map(p => p.file), siteImage?.file].filter(Boolean);
    if (newFiles.reduce((sum, f) => sum + f.size, 0) > 3.8 * 1024 * 1024) {
      setModalError('Слишком много новых фото за раз (больше ~4 МБ после сжатия). Сохраните часть, затем добавьте остальные.');
      return;
    }
    setSavingImages(true);
    try {
      const form = new FormData();
      // существующие фото передаём по URL, новые — файлами
      tgPhotos.slice(0, 4).forEach(p => {
        if (p.file) form.append('tg_images', p.file);
        else if (p.url) form.append('tg_existing_urls', p.url);
      });
      if (siteImage?.file) form.append('site_image', siteImage.file);
      if (siteWasReset) form.append('reset_site_image', 'true');

      await apiFetch(`/posts/${post.id}/images`, { method: 'POST', body: form });
      await onRefresh();
    } catch (e) {
      setModalError('Ошибка сохранения: ' + e.message);
    } finally {
      setSavingImages(false);
    }
  };

  const doAction = async (channel, status) => {
    setActing(true);
    setModalError('');
    try {
      await onAction(post.id, channel, status);
      setConfirmAction(null);
      onClose();
    } catch (e) {
      setConfirmAction(null);
      setModalError('Ошибка: ' + e.message);
    } finally {
      setActing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {confirmAction && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          onClick={() => !acting && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${confirmAction.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {confirmAction.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">{confirmAction.status === 'approved' ? 'Опубликовать пост?' : 'Отклонить пост?'}</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">{confirmAction.channel === 'telegram' ? 'Telegram' : 'Сайт'}</p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 line-clamp-2">«{post.title_ru}»</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmAction(null)} disabled={acting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-40">Отмена</button>
              <button onClick={() => doAction(confirmAction.channel, confirmAction.status)} disabled={acting}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white text-[13px] font-medium transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${confirmAction.status === 'approved' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'}`}>
                {acting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Публикуем…</> : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-semibold text-gray-900">Пост #{post.id}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Контент */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50/60">
              {[{ key: 'site', label: 'Сайт', icon: Globe }, { key: 'tg', label: 'Telegram', icon: Send }].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveContentTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium transition-all border-b-2 cursor-pointer ${activeContentTab === key ? 'border-gray-900 text-gray-900 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeContentTab === 'site' ? (
                <div className="space-y-4">
                  <div>
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[['RU', post.title_ru], ['UZ', post.title_uz], ['EN', post.title_en]].map(([lang, val]) => (
                          <div key={lang} className="space-y-1">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Заголовок ({lang})</p>
                            <p className={`text-[14px] text-gray-900 font-medium leading-snug ${titlesExpanded ? '' : 'line-clamp-2'}`}>{val}</p>
                          </div>
                        ))}
                      </div>
                      {[post.title_ru, post.title_uz, post.title_en].some(t => (t || '').length > 10) && (
                        <button
                          onClick={() => setTitlesExpanded(v => !v)}
                          className="border-1 px-2 rounded-md mt-2 text-[12px] text-gray-500 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                        >
                          {titlesExpanded ? 'Свернуть ↑' : 'Читать больше ↓'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden transition-all duration-300 ${titlesExpanded ? '' : 'max-h-24'}`}>
                    {[['RU', post.content_ru], ['UZ', post.content_uz], ['EN', post.content_en]].map(([lang, val]) => (
                      <div key={lang} className="space-y-1">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Текст ({lang})</p>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Текст поста</p>
                  <p className="text-[15px] font-semibold text-gray-900 leading-snug">{post.title_ru}</p>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{post.content_ru}</p>
                </div>
              )}
            </div>
          </div>

          {/* Статусы */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1"><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Telegram</p><StatusBadge status={post.telegram_status} /></div>
            <div className="space-y-1"><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Сайт</p><StatusBadge status={post.website_status} /></div>
            <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Дата поста</p><p className="text-[13px] text-gray-600 font-mono">{fmtDate(post.post_date)}</p></div>
            <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Получен</p><p className="text-[13px] text-gray-600 font-mono">{fmtDate(post.received_at)}</p></div>
          </div>

          {/* Фото */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[{ key: 'tg', label: 'Telegram (до 4 фото)', icon: Send }, { key: 'site', label: 'Сайт (заменить)', icon: Globe }].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveImageTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium transition-all border-b-2 cursor-pointer ${activeImageTab === key ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeImageTab === 'tg'
                ? <TgPhotoGallery originalUrl={post.image_url} photos={tgPhotos} onChange={setTgPhotos} />
                : <SiteImageReplace originalUrl={post.image_url} siteUrl={siteImage} onChange={setSiteImage} />
              }
            </div>
          </div>

          {modalError && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[13px]">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" /><span className="flex-1">{modalError}</span>
              <button onClick={() => setModalError('')} className="text-red-400 hover:text-red-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Баннер несохранённых изменений */}
          {imagesDirty && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[13px] text-amber-700 flex-1">Есть несохранённые изменения в фото</p>
              <button onClick={handleSaveImages} disabled={savingImages}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-medium transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                {savingImages ? <><Loader2 className="w-3 h-3 animate-spin" />Сохраняем…</> : 'Сохранить фото'}
              </button>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <a href={post.post_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
              <Instagram className="w-3.5 h-3.5" />Instagram
            </a>
            {post.wp_post_link && (
              <a href={wpLink(post.wp_post_link)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-[13px] font-medium text-blue-700 hover:bg-blue-100 transition-all cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" />На сайте
              </a>
            )}
            {post.telegram_status === 'pending' && (<>
              <button onClick={() => setConfirmAction({ channel: 'telegram', status: 'approved' })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-medium text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer">
                <Send className="w-3.5 h-3.5" />Опубл. в TG
              </button>
              <button onClick={() => setConfirmAction({ channel: 'telegram', status: 'declined' })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-all cursor-pointer">
                <XCircle className="w-3.5 h-3.5" />Откл. TG
              </button>
            </>)}
            {post.website_status === 'pending' && (<>
              <button onClick={() => setConfirmAction({ channel: 'website', status: 'approved' })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[13px] font-medium text-blue-700 hover:bg-blue-100 transition-all cursor-pointer">
                <Globe className="w-3.5 h-3.5" />Опубл. на сайте
              </button>
              <button onClick={() => setConfirmAction({ channel: 'website', status: 'declined' })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-all cursor-pointer">
                <XCircle className="w-3.5 h-3.5" />Откл. сайт
              </button>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="px-4 py-3"><div className="h-3 w-6 bg-gray-100 rounded" /></td>
      <td className="px-4 py-3"><div className="w-16 h-16 rounded-xl bg-gray-100" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-40 bg-gray-100 rounded mb-2" /><div className="h-3 w-24 bg-gray-50 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-100 rounded-md" /></td>
      <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-100 rounded-md" /></td>
      <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-100 rounded-lg" /></td>
      <td className="px-4 py-3"><div className="h-6 w-24 bg-gray-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="px-4 py-3 flex gap-3 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2"><div className="h-3.5 w-3/4 bg-gray-100 rounded" /><div className="h-5 w-28 bg-gray-100 rounded-md" /></div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ items: [], total: 0, total_pages: 1 });   // вкладка «Посты» (серверная пагинация)
  const [pendingPosts, setPendingPosts] = useState([]);                         // блок «Ожидают модерации»
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [stats, setStats] = useState({ total: 0, telegram_pending: 0, website_pending: 0, website_approved: 0 });
  const [admins, setAdmins] = useState([]);
  const [parseInfo, setParseInfo] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterTg, setFilterTg] = useState('');
  const [filterWp, setFilterWp] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminChatId, setNewAdminChatId] = useState('');
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);
  const reqId = useRef(0);
  const listTopRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadStats = useCallback(async () => {
    try { setStats(await apiFetch('/stats')); } catch (e) { console.error(e); }
  }, []);

  // silent=true — фоновое обновление: список не мигает и не показывает загрузку
  const loadPosts = useCallback(async (silent = false) => {
    const id = ++reqId.current;                      // ответы от устаревших запросов игнорируем
    if (!silent) setPostsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
      if (filterTg) params.set('tg_status', filterTg);
      if (filterWp) params.set('wp_status', filterWp);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await apiFetch(`/posts?${params}`);
      if (id !== reqId.current) return;
      if (res.page > res.total_pages) { setPage(res.total_pages); return; }   // страница опустела — шаг назад
      setData(res);
      setInitialLoaded(true);
      setError('');
    } catch (e) {
      if (id === reqId.current) setError('Не удалось загрузить посты: ' + e.message);
    } finally {
      if (id === reqId.current) setPostsLoading(false);
    }
  }, [page, filterTg, filterWp, debouncedSearch]);

  const loadPending = useCallback(async () => {
    try {
      const res = await apiFetch('/posts?pending=true&page_size=5');
      setPendingPosts(res.items);
    } catch (e) { console.error(e); }
    finally { setPendingLoaded(true); }
  }, []);

  const loadAdmins = useCallback(async () => {
    try { setAdmins(await apiFetch('/admins')); } catch (e) { console.error(e); }
  }, []);

  const loadParseInfo = useCallback(async () => {
    try { setParseInfo(await apiFetch('/parse-status')); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadStats(); loadPending(); loadAdmins(); }, [loadStats, loadPending, loadAdmins]);
  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { if (activeTab === 'settings') loadParseInfo(); }, [activeTab, loadParseInfo]);

  // поиск с задержкой, чтобы не слать запрос на каждую букву
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(prev => { if (prev !== search.trim()) setPage(1); return search.trim(); }); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // фоновое обновление раз в 30 с, только пока вкладка браузера видима
  useEffect(() => {
    const iv = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      loadStats(); loadPosts(true); loadPending();
    }, 30000);
    return () => clearInterval(iv);
  }, [loadStats, loadPosts, loadPending]);

  const goToPage = (p) => {
    setPage(p);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const changeFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleRefresh = async () => {
    setLoading(true);
    try { await Promise.all([loadStats(), loadPosts(true), loadPending(), loadAdmins()]); showToast('Данные обновлены'); }
    finally { setLoading(false); }
  };

  const handleAction = async (postId, channel, status) => {
    await apiFetch(`/posts/${postId}/action`, { method: 'POST', body: JSON.stringify({ channel, status }) });
    showToast(status === 'approved' ? '✅ Опубликовано!' : '❌ Отклонено');
    await Promise.all([loadPosts(true), loadPending(), loadStats()]);
  };

  const requestAction = (post, channel, status) => {
    setActionConfirm({ postId: post.id, postTitle: post.title_ru, channel, status });
  };

  const confirmActionDo = async () => {
    if (!actionConfirm) return;
    try { await handleAction(actionConfirm.postId, actionConfirm.channel, actionConfirm.status); }
    catch (e) { showToast('Ошибка: ' + e.message, 'error'); await Promise.all([loadPosts(true), loadPending()]); }
    setActionConfirm(null);
  };

  const addAdmin = async () => {
    if (!newAdminName.trim() || !newAdminChatId.trim()) return;
    try {
      await apiFetch('/admins', { method: 'POST', body: JSON.stringify({ name: newAdminName.trim(), chat_id: newAdminChatId.trim() }) });
      setNewAdminName(''); setNewAdminChatId('');
      showToast('Администратор добавлен'); loadAdmins();
    } catch (e) { showToast('Ошибка: ' + e.message, 'error'); }
  };

  const removeAdmin = async (id) => {
    try { await apiFetch(`/admins/${id}`, { method: 'DELETE' }); showToast('Удалён'); loadAdmins(); }
    catch (e) { showToast('Ошибка: ' + e.message, 'error'); }
  };

  const handleParseDone = async () => {
    setParsing(false);
    await Promise.all([loadStats(), loadPosts(true), loadPending()]);
    if (activeTab === 'settings') loadParseInfo();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  };

  const totalPages = data.total_pages;
  const paginated = data.items;
  const syncedSelected = selectedPost
    ? paginated.find(p => p.id === selectedPost.id) || pendingPosts.find(p => p.id === selectedPost.id) || selectedPost
    : null;
  const firstLoad = postsLoading && !initialLoaded;

  const tabs = [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    { id: 'posts', label: 'Посты', icon: Instagram },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];
  const tabTitle = { dashboard: 'Обзор', posts: 'Посты', settings: 'Настройки' }[activeTab];
  const tabSub = { dashboard: 'Общая статистика', posts: `${data.total} записей`, settings: 'Конфигурация' }[activeTab];

  const SidebarNav = () => (
    <>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-2 py-2 mt-1">Навигация</p>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[14px] font-medium transition-all cursor-pointer ${activeTab === tab.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
          <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-gray-700' : 'text-gray-400'}`} />
          {tab.label}
          {tab.id === 'posts' && (stats.telegram_pending + stats.website_pending) > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">{stats.telegram_pending + stats.website_pending}</span>
          )}
        </button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>
      {parsing && <ParseOverlay onDone={handleParseDone} />}

      {toast && (
        <div className={`fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-[14px] font-medium ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
          <CheckCircle2 className="w-4 h-4" />{toast.msg}
        </div>
      )}

      {actionConfirm && (
        <div onClick={() => setActionConfirm(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm p-6 space-y-4"><div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${actionConfirm.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {actionConfirm.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{actionConfirm.status === 'approved' ? 'Опубликовать пост?' : 'Отклонить пост?'}</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">{actionConfirm.channel === 'telegram' ? 'Telegram' : 'Сайт'}</p>
            </div>
          </div>
            <p className="text-[13px] text-gray-600 line-clamp-2">«{actionConfirm.postTitle}»</p>
            <div className="flex gap-2">
              <button onClick={() => setActionConfirm(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">Отмена</button>
              <button onClick={confirmActionDo} className={`flex-1 px-4 py-2.5 rounded-lg text-white text-[14px] font-medium transition-all cursor-pointer ${actionConfirm.status === 'approved' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'}`}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}

      <PostModal
        key={syncedSelected?.id ?? 'none'}
        post={syncedSelected}
        onClose={() => setSelectedPost(null)}
        onAction={handleAction}
        onRefresh={loadPosts}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[240px] bg-white border-r border-gray-200 flex flex-col z-50">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0"><Instagram className="w-3.5 h-3.5 text-white" /></div>
                <div><p className="text-[14px] font-semibold text-gray-900 leading-tight">EMU Парсер</p><p className="text-[11px] text-gray-400">Панель управления</p></div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-0.5"><SidebarNav /></nav>
          </div>
        </div>
      )}

      <div className="hidden lg:flex fixed left-0 top-0 h-full w-[220px] bg-white border-r border-gray-200 flex-col z-10">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0"><Instagram className="w-3.5 h-3.5 text-white" /></div>
            <div><p className="text-[14px] font-semibold text-gray-900 leading-tight">EMU Парсер</p><p className="text-[11px] text-gray-400">Панель управления</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5"><SidebarNav /></nav>
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="px-2 py-1.5 rounded-lg bg-emerald-50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] text-emerald-700 font-medium truncate">Сервер подключён</span>
          </div>
          <button onClick={logout} className="mt-2 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all cursor-pointer">
            <LogOut className="w-4 h-4 text-gray-400" />Выйти
          </button>
        </div>
      </div>

      <div className="lg:pl-[220px]">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"><Menu className="w-5 h-5" /></button>
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-semibold text-gray-900">{tabTitle}</h2>
              <p className="text-[12px] sm:text-[13px] text-gray-400 mt-0.5 hidden sm:block">{tabSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setParsing(true)} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
              <Zap className="w-3.5 h-3.5" />Парсить сейчас
            </button>
            <button onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-all cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard title="Всего постов" value={stats.total} icon={FileText} accent="bg-gray-100" />
                <StatCard title="Ожидают (TG)" value={stats.telegram_pending} icon={Clock} accent="bg-amber-50" sub="Ждут модерации" />
                <StatCard title="Ожидают (Сайт)" value={stats.website_pending} icon={Globe} accent="bg-violet-50" sub="Ждут публикации" />
                <StatCard title="Опубликовано" value={stats.website_approved} icon={CheckCircle2} accent="bg-emerald-50"
                  sub={stats.total > 0 ? `${Math.round(stats.website_approved / stats.total * 100)}% от всех` : '—'} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-gray-900">Ожидают модерации</h3>
                  <button onClick={() => setActiveTab('posts')} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Все посты →</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {!pendingLoaded ? (
                    <div className="px-5 py-10 text-center"><Loader2 className="w-6 h-6 text-gray-300 mx-auto animate-spin" /></div>
                  ) : pendingPosts.length === 0 ? (
                    <div className="px-5 py-10 text-center"><CheckCheck className="w-8 h-8 text-emerald-300 mx-auto mb-2" /><p className="text-[14px] text-gray-400">Все посты промодерированы</p></div>
                  ) : pendingPosts.map(post => (
                    <div key={post.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/80 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {post.image_url ? <Img src={post.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-400 m-auto mt-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate">{post.title_ru}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{fmtDateShort(post.post_date)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end pr-2">
                        {post.telegram_status === 'pending' && (<>
                          <Tooltip text="Опубл. TG"><button onClick={() => requestAction(post, 'telegram', 'approved')} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"><Send className="w-3.5 h-3.5" /></button></Tooltip>
                          <Tooltip text="Откл. TG"><button onClick={() => requestAction(post, 'telegram', 'declined')} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"><XCircle className="w-3.5 h-3.5" /></button></Tooltip>
                        </>)}
                        {post.website_status === 'pending' && (<>
                          <Tooltip text="Опубл. сайт"><button onClick={() => requestAction(post, 'website', 'approved')} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"><Globe className="w-3.5 h-3.5" /></button></Tooltip>
                          <Tooltip text="Откл. сайт"><button onClick={() => requestAction(post, 'website', 'declined')} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"><BanIcon className="w-3.5 h-3.5" /></button></Tooltip>
                        </>)}
                        <Tooltip text="Подробнее"><button onClick={() => setSelectedPost(post)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button></Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div ref={listTopRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-20">
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию или ID…"
                    className="w-full pl-[30px] pr-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/8 focus:border-gray-300 focus:bg-white transition-all" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={filterTg} onChange={changeFilter(setFilterTg)} className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none transition-all cursor-pointer">
                    <option value="">Все (TG)</option><option value="pending">Ожидает</option><option value="approved">Одобрено</option><option value="declined">Отклонено</option>
                  </select>
                  <select value={filterWp} onChange={changeFilter(setFilterWp)} className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none transition-all cursor-pointer">
                    <option value="">Все (Сайт)</option><option value="pending">Ожидает</option><option value="approved">Опубликовано</option><option value="declined">Отклонено</option>
                  </select>
                  {(filterTg || filterWp || search) && <button onClick={() => { setFilterTg(''); setFilterWp(''); setSearch(''); setPage(1); }} className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
              {error && <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-[13px] text-red-600 flex items-center gap-2"><XCircle className="w-4 h-4 shrink-0" />{error}</div>}

              <div className={`transition-opacity duration-200 ${postsLoading && initialLoaded ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} aria-busy={postsLoading}>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-20">Фото</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Заголовок</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Дата</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Telegram</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Сайт</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Ссылка</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-32">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstLoad ? (
                      Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-[14px] text-gray-400">Посты не найдены</td></tr>
                    ) : paginated.map((post, i) => (
                      <tr key={post.id} style={{ animationDelay: `${i * 25}ms` }} className={`row-in border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${i % 2 ? 'bg-gray-50/30' : ''}`}>
                        <td className="px-4 py-3 text-[13px] font-mono text-gray-400">{post.id}</td>
                        <td className="px-4 py-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                            {post.image_url ? <Img src={post.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-400 m-auto mt-6" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="text-[14px] font-medium text-gray-900 line-clamp-2 leading-snug">{post.title_ru}</p>
                          <p className="text-[12px] text-gray-400 truncate mt-0.5">{post.category}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-400 font-mono whitespace-nowrap">{fmtDateShort(post.post_date)}</td>
                        <td className="px-4 py-3"><StatusBadge status={post.telegram_status} /></td>
                        <td className="px-4 py-3"><StatusBadge status={post.website_status} /></td>
                        <td className="px-4 py-3">
                          {post.wp_post_link
                            ? <a href={wpLink(post.wp_post_link)} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-100 bg-blue-50 text-[12px] font-medium text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap cursor-pointer">
                              <ExternalLink className="w-3 h-3" />Открыть
                            </a>
                            : <span className="text-[13px] text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 pr-8">
                          <div className="flex items-center gap-1 justify-end flex-nowrap">
                            {post.telegram_status === 'pending' && (<>
                              <Tooltip text="Опубл. TG"><button onClick={() => requestAction(post, 'telegram', 'approved')} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"><Send className="w-3.5 h-3.5" /></button></Tooltip>
                              <Tooltip text="Откл. TG"><button onClick={() => requestAction(post, 'telegram', 'declined')} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"><XCircle className="w-3.5 h-3.5" /></button></Tooltip>
                            </>)}
                            {post.website_status === 'pending' && (<>
                              <Tooltip text="Опубл. сайт"><button onClick={() => requestAction(post, 'website', 'approved')} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"><Globe className="w-3.5 h-3.5" /></button></Tooltip>
                              <Tooltip text="Откл. сайт"><button onClick={() => requestAction(post, 'website', 'declined')} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"><BanIcon className="w-3.5 h-3.5" /></button></Tooltip>
                            </>)}
                            <Tooltip text="Подробнее"><button onClick={() => setSelectedPost(post)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button></Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-gray-100">
                {firstLoad ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : paginated.length === 0 ? (
                  <p className="px-4 py-12 text-center text-[14px] text-gray-400">Посты не найдены</p>
                ) : paginated.map(post => (
                  <div key={post.id} className="row-in px-4 py-3 flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {post.image_url ? <Img src={post.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-400 m-auto mt-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-2">{post.title_ru}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap"><StatusBadge status={post.telegram_status} /><StatusBadge status={post.website_status} /></div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => setSelectedPost(post)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        {post.telegram_status === 'pending' && <button onClick={() => requestAction(post, 'telegram', 'approved')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"><Send className="w-3.5 h-3.5" /></button>}
                        {post.website_status === 'pending' && <button onClick={() => requestAction(post, 'website', 'approved')} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"><Globe className="w-3.5 h-3.5" /></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
              {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} total={data.total} onPageChange={goToPage} />}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-[15px] font-semibold text-gray-900">Парсер</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-600 space-y-1">
                  <p>Последний запуск: <span className="font-medium text-gray-800">{parseInfo?.last_run ? fmtDate(parseInfo.last_run) : '—'}</span></p>
                  <p>Результат: <span className="font-medium text-gray-800">{{ ok: 'новые посты добавлены', nothing: 'новых постов нет', quota: 'нет кредитов OpenAI', error: 'ошибка' }[parseInfo?.last_result] || '—'}</span></p>
                  {parseInfo?.queued > 0 && <p className="text-amber-600">В очереди на перевод: {parseInfo.queued}</p>}
                  {parseInfo?.last_error && <p className="text-red-600">{parseInfo.last_error}</p>}
                </div>
                <button onClick={() => setParsing(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium transition-all cursor-pointer">
                  <Zap className="w-3.5 h-3.5" />Запустить парсинг вручную
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-[15px] font-semibold text-gray-900">Администраторы Telegram</h3>
                  <p className="text-[13px] text-gray-400 mt-0.5">Получают уведомления о новых постах</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {admins.length === 0
                    ? <p className="px-5 py-6 text-center text-[14px] text-gray-400">Администраторы не добавлены</p>
                    : admins.map(admin => (
                      <div key={admin.id} className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-gray-500" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-gray-900">{admin.name}</p>
                          <p className="text-[12px] text-gray-400 font-mono">Chat ID: {admin.chat_id}</p>
                        </div>
                        <button onClick={() => removeAdmin(admin.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"><UserMinus className="w-4 h-4" /></button>
                      </div>
                    ))
                  }
                </div>
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Добавить администратора</p>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input value={newAdminName} onChange={e => setNewAdminName(e.target.value)} placeholder="Имя"
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all" />
                    <input value={newAdminChatId} onChange={e => setNewAdminChatId(e.target.value)} placeholder="Chat ID"
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all font-mono"
                      onKeyDown={e => e.key === 'Enter' && addAdmin()} />
                    <button onClick={addAdmin} disabled={!newAdminName.trim() || !newAdminChatId.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium transition-all disabled:opacity-40 shrink-0 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />Добавить
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-400">Узнать Chat ID: <span className="font-medium text-gray-600">@userinfobot</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}