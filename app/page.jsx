'use client';

import { useState, useRef } from 'react';
import {
  Instagram, Settings, LayoutDashboard, LogOut,
  Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Clock, ExternalLink, ArrowUpRight,
  Menu, X, RefreshCw, ImageIcon, Globe, Send, Trash2,
  MoreHorizontal, FileText, CheckCheck, BanIcon, UserMinus,
  User, Plus, Upload, ImagePlus, Pencil, AlertTriangle
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_STATS = {
  total: 142,
  telegram_pending: 8,
  website_pending: 14,
  website_approved: 89,
};

const MOCK_POSTS = [
  {
    id: 1,
    title_ru: 'Erasmus+, больше чем учёба за границей!',
    title_uz: 'Erasmus+, chet elda o\'qishdan ko\'proq!',
    title_en: 'Erasmus+, more than just studying abroad!',
    content_ru: 'Для студентов EMU University участие в программе Erasmus+ — это не просто возможность выехать за границу. Это уникальный шанс расширить горизонты, познакомиться с новыми культурами и получить бесценный опыт.',
    content_uz: 'EMU University talabalari uchun Erasmus+ dasturida ishtirok etish — bu yangi madaniyatlar bilan tanishish va bebaho tajriba orttirish uchun noyob imkoniyat.',
    content_en: 'For EMU University students, participating in the Erasmus+ program is not just an opportunity to go abroad. It\'s a unique chance to broaden horizons, meet new cultures and gain invaluable experience.',
    image_url: 'https://next.emu.web-perfomance.uz/wp-content/uploads/2025/05/erasmus-news-1024x681.webp',
    tg_image_url: null,
    site_image_url: null,
    post_url: 'https://instagram.com/p/abc123',
    post_date: '2025-03-15T10:30:00',
    received_at: '2025-03-15T10:35:00',
    telegram_status: 'pending',
    website_status: 'pending',
    wp_post_id: null,
    category: 'Новости Университета',
  },
  {
    id: 2,
    title_ru: 'Меньше отходов — больше смысла, как EMU становится примером осознанного прогресса',
    title_uz: 'Kamroq chiqindi — ko\'proq ma\'no',
    title_en: 'Less waste — more meaning',
    content_ru: 'EMU University выбирает не просто прогресс, а осознанный прогресс. Мы считаем, что современный университет должен быть примером для общества не только в образовании, но и в бережном отношении к окружающей среде.',
    content_uz: 'EMU University shunchaki taraqqiyotni emas, balki ongli taraqqiyotni tanlaydi.',
    content_en: 'EMU University chooses not just progress, but conscious progress.',
    image_url: 'https://next.emu.web-perfomance.uz/wp-content/uploads/2025/05/erasmus-news-1024x681.webp',
    tg_image_url: null,
    site_image_url: null,
    post_url: 'https://instagram.com/',
    post_date: '2025-03-14T14:00:00',
    received_at: '2025-03-14T14:05:00',
    telegram_status: 'approved',
    website_status: 'approved',
    wp_post_id: 245,
    category: 'Новости Университета',
  },
  {
    id: 3,
    title_ru: 'Возможность обучения в аспирантуре Howard University',
    title_uz: 'Howard Universitetida aspirantura imkoniyati',
    title_en: 'Opportunity to study at Howard University',
    content_ru: 'Возможность получения степени PhD в Howard University для сотрудников EMU University! Говардский университет открывает свои двери.',
    content_uz: 'EMU University xodimlari uchun Howard Universitetida PhD darajasini olish imkoniyati!',
    content_en: 'Opportunity to get a PhD at Howard University for EMU staff!',
    image_url: 'https://next.emu.web-perfomance.uz/wp-content/uploads/2025/05/erasmus-news-1024x681.webp',
    tg_image_url: null,
    site_image_url: null,
    post_url: 'https://instagram.com/',
    post_date: '2025-03-13T09:00:00',
    received_at: '2025-03-13T09:10:00',
    telegram_status: 'approved',
    website_status: 'pending',
    wp_post_id: null,
    category: 'Новости Университета',
  },
  {
    id: 4,
    title_ru: 'Откройте новые горизонты научной карьеры с Momentum MSCA',
    title_uz: 'Momentum MSCA bilan yangi ufqlarini oching',
    title_en: 'Open new horizons with Momentum MSCA',
    content_ru: 'Рады сообщить об открытии новых возможностей для развития научной карьеры в рамках Momentum MSCA Postdoctoral Fellowship Programme.',
    content_uz: 'Momentum MSCA Postdoctoral Fellowship Programme doirasida yangi imkoniyatlar ochildi.',
    content_en: 'New opportunities within the Momentum MSCA Postdoctoral Fellowship Programme.',
    image_url: 'https://next.emu.web-perfomance.uz/wp-content/uploads/2025/05/erasmus-news-1024x681.webp',
    tg_image_url: null,
    site_image_url: null,
    post_url: 'https://instagram.com/',
    post_date: '2025-03-12T16:20:00',
    received_at: '2025-03-12T16:25:00',
    telegram_status: 'pending',
    website_status: 'pending',
    wp_post_id: null,
    category: 'Новости Университета',
  },
  {
    id: 5,
    title_ru: 'Профессор Литовского университета выступила с лекцией в EMU',
    title_uz: 'Litva universiteti professori EMU da ma\'ruza o\'qidi',
    title_en: 'Lithuanian professor gave a lecture at EMU',
    content_ru: 'В EMU University состоялись лекции профессора Литовского университета наук о здоровье Елены Логинович.',
    content_uz: 'EMU da Elena Loginovich ma\'ruzalari bo\'lib o\'tdi.',
    content_en: 'EMU hosted lectures by Prof. Elena Loginovich from Lithuanian University of Health Sciences.',
    image_url: 'https://next.emu.web-perfomance.uz/wp-content/uploads/2025/05/erasmus-news-1024x681.webp',
    tg_image_url: null,
    site_image_url: null,
    post_url: 'https://instagram.com/',
    post_date: '2025-03-11T11:00:00',
    received_at: '2025-03-11T11:05:00',
    telegram_status: 'declined',
    website_status: 'declined',
    wp_post_id: null,
    category: 'Новости Университета',
  },
  {
    id: 6,
    title_ru: 'Бесплатные онлайн-курсы от Гарварда для студентов EMU University',
    title_uz: 'Garvarddan bepul onlayn kurslar',
    title_en: 'Free Harvard online courses for EMU students',
    content_ru: 'Уникальная возможность пройти бесплатные онлайн-курсы от Гарвардского университета.',
    content_uz: 'Garvard universitetining bepul onlayn kurslarini o\'tash imkoniyatingiz bor.',
    content_en: 'A unique opportunity to take free online courses from Harvard University.',
    image_url: 'https://next.emu.web-perfomance.uz/wp-content/uploads/2025/05/erasmus-news-1024x681.webp',
    tg_image_url: null,
    site_image_url: null,
    post_url: 'https://instagram.com/',
    post_date: '2025-03-10T13:45:00',
    received_at: '2025-03-10T13:50:00',
    telegram_status: 'approved',
    website_status: 'approved',
    wp_post_id: 238,
    category: 'Новости Университета',
  },
];

const MOCK_ADMINS = [
  { id: 1, name: 'Акбар', chat_id: '123456789' },
  { id: 2, name: 'Илья', chat_id: '987654321' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateShort(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

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
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-50 text-amber-600 border border-amber-100 whitespace-nowrap">
      <Clock className="w-3 h-3" />Ожидает
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, accent, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || 'bg-gray-100'}`}>
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
      </div>
      <p className="text-[24px] sm:text-[28px] font-semibold text-gray-900 tracking-tight leading-none mb-1.5">
        {value.toLocaleString()}
      </p>
      <p className="text-[13px] text-gray-500 font-medium">{title}</p>
      {sub && <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, total, onPageChange }) {
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) range.push(i);

  const btn = (p, label, active = false, disabled = false) => (
    <button key={typeof label === 'string' ? label : p} onClick={() => !disabled && onPageChange(p)} disabled={disabled}
      className={`min-w-[28px] h-7 px-1.5 text-xs rounded-md font-medium transition-all
        ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>{label}</button>
  );

  return (
    <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p className="text-[13px] text-gray-400 order-2 sm:order-1">
        {total.toLocaleString()} всего · стр. <span className="text-gray-600 font-medium">{currentPage}</span> из <span className="text-gray-600 font-medium">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {btn(currentPage - 1, <ChevronLeft className="w-3.5 h-3.5" />, false, currentPage === 1)}
        {range[0] > 1 && <>{btn(1, '1')}{range[0] > 2 && <span className="text-gray-300 text-xs px-0.5">…</span>}</>}
        {range.map(p => btn(p, p, p === currentPage))}
        {range[range.length - 1] < totalPages && <>
          {range[range.length - 1] < totalPages - 1 && <span className="text-gray-300 text-xs px-0.5">…</span>}
          {btn(totalPages, totalPages)}
        </>}
        {btn(currentPage + 1, <ChevronRight className="w-3.5 h-3.5" />, false, currentPage === totalPages)}
      </div>
    </div>
  );
}

// ─── TG Photo Gallery (up to 4 images, 2MB each) ────────────────────────────

const MAX_TG_PHOTOS = 4;
const MAX_FILE_MB = 2;

function TgPhotoGallery({ originalUrl, photos, onChange }) {
  // photos: array of { id, url, isOriginal }
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`);
      return;
    }
    if (photos.length >= MAX_TG_PHOTOS) {
      setError(`Максимум ${MAX_TG_PHOTOS} фотографии.`);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange([...photos, { id: Date.now(), url: ev.target.result, isOriginal: false }]);
    };
    reader.readAsDataURL(file);
  };

  const handleReplace = (id, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(photos.map(p => p.id === id ? { ...p, url: ev.target.result, isOriginal: false } : p));
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (id) => {
    onChange(photos.filter(p => p.id !== id));
  };

  const canAdd = photos.length < MAX_TG_PHOTOS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-gray-500">
          Можно <strong className="text-gray-700">добавить</strong> до {MAX_TG_PHOTOS} фото или <strong className="text-gray-700">заменить</strong> оригинальное. Лимит: {MAX_FILE_MB} МБ на файл.
        </p>
        <span className="text-[12px] text-gray-400 font-medium shrink-0 ml-2">{photos.length}/{MAX_TG_PHOTOS}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-[12px] font-medium">
          <XCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      {/* Grid of photos */}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, idx) => {
          const replaceRef = { current: null };
          return (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-video">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              {/* overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-[12px] font-medium text-gray-800 shadow cursor-pointer hover:bg-gray-50 transition-all">
                  <Pencil className="w-3 h-3" />Заменить
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReplace(photo.id, e)} />
                </label>
                <button onClick={() => handleRemove(photo.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium shadow hover:bg-red-600 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {/* index badge */}
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              {photo.isOriginal && (
                <div className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-md">
                  Оригинал
                </div>
              )}
            </div>
          );
        })}

        {/* Add slot */}
        {canAdd && (
          <button onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600">
            <ImagePlus className="w-6 h-6" />
            <span className="text-[12px] font-medium">Добавить фото</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {photos.length === 0 && (
        <p className="text-[12px] text-gray-400 text-center py-2">
          Фото не добавлены — будет использовано оригинальное из Instagram
        </p>
      )}
    </div>
  );
}

// ─── Site Image Replace ───────────────────────────────────────────────────────

function SiteImageReplace({ originalUrl, siteUrl, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const activeUrl = siteUrl || originalUrl;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray-500">
        Для сайта можно только <strong className="text-gray-700">заменить</strong> фото. Лимит: {MAX_FILE_MB} МБ.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-[12px] font-medium">
          <XCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      <div className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-video max-w-[50%]">
        {activeUrl
          ? <img src={activeUrl} alt="" className="w-full h-full object-cover" />
          : <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400"><ImageIcon className="w-8 h-8" /><p className="text-[12px]">Нет изображения</p></div>
        }
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[12px] font-medium text-gray-800 shadow hover:bg-gray-50 transition-all">
            <Pencil className="w-3.5 h-3.5" />Заменить
          </button>
          {siteUrl && siteUrl !== originalUrl && (
            <button onClick={() => { onChange(null); setError(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium shadow hover:bg-red-600 transition-all">
              <Trash2 className="w-3.5 h-3.5" />Убрать
            </button>
          )}
        </div>
        {siteUrl && siteUrl !== originalUrl && (
          <div className="absolute top-2 right-2 text-[10px] font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">Заменено</div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <button onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 text-[13px] text-gray-500 font-medium transition-all">
        <Pencil className="w-3.5 h-3.5" />Заменить фото для сайта
      </button>

      {siteUrl && siteUrl !== originalUrl && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />Фото заменено
          </p>
          <button onClick={() => { onChange(null); setError(''); }} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
            ← Вернуть оригинал
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post Modal ───────────────────────────────────────────────────────────────

function PostModal({ post, onClose, onAction, onUpdateImages }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeImageTab, setActiveImageTab] = useState('tg');
  // tgPhotos: array of {id, url, isOriginal}
  const [tgPhotos, setTgPhotos] = useState(() => {
    if (!post) return [];
    if (post.tg_image_url) return [{ id: 1, url: post.tg_image_url, isOriginal: false }];
    // Start with original from instagram
    return [{ id: 0, url: post.image_url, isOriginal: true }];
  });
  const [siteImage, setSiteImage] = useState(post?.site_image_url || null);

  if (!post) return null;

  const doAction = (channel, status) => {
    onAction(post.id, channel, status);
    setConfirmAction(null);
    onClose();
  };

  const handleSaveImages = () => {
    // For tgImage store: use first non-original, or null if only original remains
    const customTg = tgPhotos.find(p => !p.isOriginal);
    onUpdateImages(post.id, customTg?.url || null, siteImage);
    onClose();
  };

  const imagesDirty =
    JSON.stringify(tgPhotos.filter(p => !p.isOriginal).map(p => p.url)) !== JSON.stringify([post.tg_image_url].filter(Boolean)) ||
    siteImage !== post.site_image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      {/* Inner confirm overlay */}
      {confirmAction && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${confirmAction.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {confirmAction.status === 'approved'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  : <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {confirmAction.status === 'approved' ? 'Опубликовать пост?' : 'Отклонить пост?'}
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">{confirmAction.channel === 'telegram' ? 'Telegram' : 'Сайт'}</p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 line-clamp-2">«{post.title_ru}»</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-all">
                Отмена
              </button>
              <button onClick={() => doAction(confirmAction.channel, confirmAction.status)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white text-[13px] font-medium transition-all
                  ${confirmAction.status === 'approved' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'}`}>
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-semibold text-gray-900">Пост #{post.id}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Titles: RU / UZ / EN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['RU', post.title_ru], ['UZ', post.title_uz], ['EN', post.title_en]].map(([lang, val]) => (
              <div key={lang} className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Заголовок ({lang})</p>
                <p className="text-[14px] text-gray-900 font-medium leading-snug">{val}</p>
              </div>
            ))}
          </div>

          {/* Texts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['RU', post.content_ru], ['UZ', post.content_uz], ['EN', post.content_en]].map(([lang, val]) => (
              <div key={lang} className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Текст ({lang})</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">{val}</p>
              </div>
            ))}
          </div>

          {/* Statuses */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Telegram</p>
              <StatusBadge status={post.telegram_status} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Сайт</p>
              <StatusBadge status={post.website_status} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Дата поста</p>
              <p className="text-[13px] text-gray-600 font-mono">{fmtDate(post.post_date)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Получен</p>
              <p className="text-[13px] text-gray-600 font-mono">{fmtDate(post.received_at)}</p>
            </div>
          </div>

          {/* ── Photo management ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[
                { key: 'tg', label: 'Telegram', icon: Send },
                { key: 'site', label: 'Сайт', icon: Globe },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveImageTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium transition-all border-b-2
                    ${activeImageTab === key
                      ? 'border-gray-900 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeImageTab === 'tg' ? (
                <TgPhotoGallery
                  originalUrl={post.image_url}
                  photos={tgPhotos}
                  onChange={setTgPhotos}
                />
              ) : (
                <SiteImageReplace
                  originalUrl={post.image_url}
                  siteUrl={siteImage}
                  onChange={setSiteImage}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-3">
          {/* Save images if changed */}
          {imagesDirty && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[13px] text-amber-700 flex-1">Есть несохранённые изменения в фото</p>
              <button onClick={handleSaveImages}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-medium transition-all">
                Сохранить фото
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <a href={post.post_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <Instagram className="w-3.5 h-3.5" />Instagram
            </a>
            {post.telegram_status === 'pending' && (
              <>
                <button onClick={() => setConfirmAction({ channel: 'telegram', status: 'approved' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] font-medium text-emerald-700 hover:bg-emerald-100 transition-all">
                  <Send className="w-3.5 h-3.5" />Опубл. в TG
                </button>
                <button onClick={() => setConfirmAction({ channel: 'telegram', status: 'declined' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-all">
                  <XCircle className="w-3.5 h-3.5" />Откл. TG
                </button>
              </>
            )}
            {post.website_status === 'pending' && (
              <>
                <button onClick={() => setConfirmAction({ channel: 'website', status: 'approved' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[13px] font-medium text-blue-700 hover:bg-blue-100 transition-all">
                  <Globe className="w-3.5 h-3.5" />Опубл. на сайте
                </button>
                <button onClick={() => setConfirmAction({ channel: 'website', status: 'declined' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-all">
                  <XCircle className="w-3.5 h-3.5" />Откл. сайт
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const [stats] = useState(MOCK_STATS);
  const [search, setSearch] = useState('');
  const [filterTg, setFilterTg] = useState('');
  const [filterWp, setFilterWp] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminChatId, setNewAdminChatId] = useState('');

  const PAGE_SIZE = 5;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (postId, channel, newStatus) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, [`${channel}_status`]: newStatus } : p
    ));
    showToast('Статус обновлён');
  };

  const requestAction = (post, channel, status) => {
    setActionConfirm({ postId: post.id, postTitle: post.title_ru, channel, status });
  };

  const confirmActionDo = () => {
    if (!actionConfirm) return;
    handleAction(actionConfirm.postId, actionConfirm.channel, actionConfirm.status);
    setActionConfirm(null);
  };

  const handleUpdateImages = (postId, tgUrl, siteUrl) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, tg_image_url: tgUrl, site_image_url: siteUrl } : p
    ));
    showToast('Фото сохранены');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); showToast('Данные обновлены'); }, 800);
  };

  const addAdmin = () => {
    if (!newAdminName.trim() || !newAdminChatId.trim()) return;
    setAdmins(prev => [...prev, { id: Date.now(), name: newAdminName.trim(), chat_id: newAdminChatId.trim() }]);
    setNewAdminName('');
    setNewAdminChatId('');
    showToast('Администратор добавлен');
  };

  const removeAdmin = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    showToast('Администратор удалён');
  };

  const filtered = posts.filter(p => {
    const matchSearch = !search ||
      p.title_ru.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    const matchTg = !filterTg || p.telegram_status === filterTg;
    const matchWp = !filterWp || p.website_status === filterWp;
    return matchSearch && matchTg && matchWp;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Keep selectedPost in sync with posts state
  const syncedSelected = selectedPost ? posts.find(p => p.id === selectedPost.id) || null : null;

  const tabs = [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    { id: 'posts', label: 'Посты', icon: Instagram },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  const tabTitle = { dashboard: 'Обзор', posts: 'Посты', settings: 'Настройки' }[activeTab];
  const tabSub = {
    dashboard: 'Общая статистика',
    posts: `${filtered.length} записей`,
    settings: 'Конфигурация плагина',
  }[activeTab];

  const SidebarNav = () => (
    <>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-2 py-2 mt-1">Навигация</p>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[14px] font-medium transition-all duration-150
            ${activeTab === tab.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
          <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-gray-700' : 'text-gray-400'}`} />
          {tab.label}
          {tab.id === 'posts' && (stats.telegram_pending + stats.website_pending) > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
              {stats.telegram_pending + stats.website_pending}
            </span>
          )}
        </button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-[14px] font-medium
          ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
          <CheckCircle2 className="w-4 h-4" />{toast.msg}
        </div>
      )}

      {/* Action confirm */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${actionConfirm.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {actionConfirm.status === 'approved'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  : <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {actionConfirm.status === 'approved' ? 'Опубликовать пост?' : 'Отклонить пост?'}
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {actionConfirm.channel === 'telegram' ? 'Telegram' : 'Сайт'}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 line-clamp-2">«{actionConfirm.postTitle}»</p>
            <div className="flex gap-2">
              <button onClick={() => setActionConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition-all">
                Отмена
              </button>
              <button onClick={confirmActionDo}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white text-[14px] font-medium transition-all
                  ${actionConfirm.status === 'approved' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'}`}>
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post modal */}
      <PostModal
        post={syncedSelected}
        onClose={() => setSelectedPost(null)}
        onAction={handleAction}
        onUpdateImages={handleUpdateImages}
      />

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[240px] bg-white border-r border-gray-200 flex flex-col z-50">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                  <Instagram className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 leading-tight">EMU Парсер</p>
                  <p className="text-[11px] text-gray-400">Панель управления</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-0.5"><SidebarNav /></nav>
            <div className="px-3 py-3 border-t border-gray-100">
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[14px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
                <LogOut className="w-4 h-4 text-gray-400" />Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-[220px] bg-white border-r border-gray-200 flex-col z-10">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
              <Instagram className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900 leading-tight">EMU Парсер</p>
              <p className="text-[11px] text-gray-400">Панель управления</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5"><SidebarNav /></nav>
        <div className="px-3 py-3 border-t border-gray-100">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[14px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
            <LogOut className="w-4 h-4 text-gray-400" />Выйти
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[220px]">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-semibold text-gray-900">{tabTitle}</h2>
              <p className="text-[12px] sm:text-[13px] text-gray-400 mt-0.5 hidden sm:block">{tabSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
            </button>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Онлайн
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ── Обзор ── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard title="Всего постов" value={stats.total} icon={FileText} accent="bg-gray-100" />
                <StatCard title="Ожидают (TG)" value={stats.telegram_pending} icon={Clock} accent="bg-amber-50" sub="Ждут модерации" />
                <StatCard title="Ожидают (Сайт)" value={stats.website_pending} icon={Globe} accent="bg-violet-50" sub="Ждут публикации" />
                <StatCard title="Опубликовано" value={stats.website_approved} icon={CheckCircle2} accent="bg-emerald-50"
                  sub={`${Math.round(stats.website_approved / stats.total * 100)}% от всех`} />
              </div>

              {/* Pending list */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-gray-900">Ожидают модерации</h3>
                  <button onClick={() => setActiveTab('posts')}
                    className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
                    Все посты →
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {posts.filter(p => p.telegram_status === 'pending' || p.website_status === 'pending').slice(0, 5).map(post => (
                    <div key={post.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/80 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {post.image_url
                          ? <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                          : <ImageIcon className="w-4 h-4 text-gray-400 m-auto mt-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate">{post.title_ru}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{fmtDateShort(post.post_date)}</p>
                      </div>
                      {/* FIX 1: Both TG and site decline buttons */}
                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                        {post.telegram_status === 'pending' && (
                          <>
                            <button onClick={() => requestAction(post, 'telegram', 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Опубл. TG">
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => requestAction(post, 'telegram', 'declined')}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Откл. TG">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {post.website_status === 'pending' && (
                          <>
                            <button onClick={() => requestAction(post, 'website', 'approved')}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Опубл. сайт">
                              <Globe className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => requestAction(post, 'website', 'declined')}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Откл. сайт">
                              <BanIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedPost(post)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Подробнее">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {posts.filter(p => p.telegram_status === 'pending' || p.website_status === 'pending').length === 0 && (
                    <div className="px-5 py-10 text-center">
                      <CheckCheck className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                      <p className="text-[14px] text-gray-400">Все посты промодерированы</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Посты ── */}
          {activeTab === 'posts' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Поиск по названию или ID…"
                    className="w-full pl-[30px] pr-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/8 focus:border-gray-300 focus:bg-white transition-all" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={filterTg} onChange={e => { setFilterTg(e.target.value); setPage(1); }}
                    className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none transition-all">
                    <option value="">Все (TG)</option>
                    <option value="pending">Ожидает</option>
                    <option value="approved">Одобрено</option>
                    <option value="declined">Отклонено</option>
                  </select>
                  <select value={filterWp} onChange={e => { setFilterWp(e.target.value); setPage(1); }}
                    className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none transition-all">
                    <option value="">Все (Сайт)</option>
                    <option value="pending">Ожидает</option>
                    <option value="approved">Опубликовано</option>
                    <option value="declined">Отклонено</option>
                  </select>
                  {(filterTg || filterWp || search) && (
                    <button onClick={() => { setFilterTg(''); setFilterWp(''); setSearch(''); setPage(1); }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-20">Фото</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Заголовок</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Дата</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Telegram</th>
                      {/* FIX 2: Separate "Сайт" and "На сайте" columns */}
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-28">Сайт</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-32">На сайте</th>
                      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-32">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((post, i) => (
                      <tr key={post.id} className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${i % 2 ? 'bg-gray-50/30' : ''}`}>
                        <td className="px-4 py-3 text-[13px] font-mono text-gray-400">{post.id}</td>
                        <td className="px-4 py-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {post.image_url
                              ? <img src={post.tg_image_url || post.image_url} alt="" className="w-full h-full object-cover" />
                              : <ImageIcon className="w-4 h-4 text-gray-400 m-auto mt-6" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="text-[14px] font-medium text-gray-900 line-clamp-2 leading-snug">{post.title_ru}</p>
                          <p className="text-[12px] text-gray-400 truncate mt-0.5">{post.category}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-400 font-mono whitespace-nowrap">
                          {fmtDateShort(post.post_date)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={post.telegram_status} /></td>
                        {/* Status column */}
                        <td className="px-4 py-3"><StatusBadge status={post.website_status} /></td>
                        {/* FIX 2: Separate "View on site" column */}
                        <td className="px-4 py-3">
                          {post.wp_post_id ? (
                            <a href="#" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-100 bg-blue-50 text-[12px] font-medium text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap">
                              <ExternalLink className="w-3 h-3" />Открыть пост
                            </a>
                          ) : (
                            <span className="text-[13px] text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 shrink-0 justify-end flex-nowrap">
                            {post.telegram_status === 'pending' && (
                              <>
                                <button onClick={() => requestAction(post, 'telegram', 'approved')}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Опубл. TG">
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => requestAction(post, 'telegram', 'declined')}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Откл. TG">
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {post.website_status === 'pending' && (
                              <>
                                <button onClick={() => requestAction(post, 'website', 'approved')}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Опубл. сайт">
                                  <Globe className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => requestAction(post, 'website', 'declined')}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Откл. сайт">
                                  <BanIcon className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button onClick={() => setSelectedPost(post)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Подробнее">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-[14px] text-gray-400">Посты не найдены</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {paginated.map(post => (
                  <div key={post.id} className="px-4 py-3 flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {post.image_url
                        ? <img src={post.tg_image_url || post.image_url} alt="" className="w-full h-full object-cover" />
                        : <ImageIcon className="w-5 h-5 text-gray-400 m-auto mt-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-2">{post.title_ru}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StatusBadge status={post.telegram_status} />
                        <StatusBadge status={post.website_status} />
                        {post.wp_post_id && (
                          <a href="#" className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline">
                            <ExternalLink className="w-2.5 h-2.5" />На сайте
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => setSelectedPost(post)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {post.telegram_status === 'pending' && (
                          <button onClick={() => requestAction(post, 'telegram', 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {post.website_status === 'pending' && (
                          <button onClick={() => requestAction(post, 'website', 'approved')}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {paginated.length === 0 && (
                  <p className="px-4 py-12 text-center text-[14px] text-gray-400">Посты не найдены</p>
                )}
              </div>

              {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
              )}
            </div>
          )}

          {/* ── Настройки ── */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-2xl">
              {settingsSaved && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-[14px] font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />Настройки сохранены!
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
                <h3 className="text-[15px] font-semibold text-gray-900">Webhook URL (для Python-скрипта)</h3>
                <p className="text-[13px] text-gray-500">Используйте этот URL в вашем Instagram-парсере:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-[13px] text-gray-700 select-all break-all">
                  https://emuni.uz/wp-json/instagram/v1/webhook
                </div>
                {/* <p className="text-[12px] text-gray-400">Обновите <code className="bg-gray-100 px-1 rounded">WEBHOOK_URL</code> в вашем .env файле</p> */}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-[15px] font-semibold text-gray-900">Администраторы Telegram</h3>
                  <p className="text-[13px] text-gray-400 mt-0.5">Пользователи, которые получают уведомления и управляют постами через бота</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {admins.map(admin => (
                    <div key={admin.id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-gray-900">{admin.name}</p>
                        <p className="text-[12px] text-gray-400 font-mono">Chat ID: {admin.chat_id}</p>
                      </div>
                      {/* <button onClick={() => removeAdmin(admin.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <UserMinus className="w-4 h-4" />
                      </button> */}
                    </div>
                  ))}
                  {admins.length === 0 && (
                    <p className="px-5 py-6 text-center text-[14px] text-gray-400">Администраторы не добавлены</p>
                  )}
                </div>
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Добавить администратора</p>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input value={newAdminName} onChange={e => setNewAdminName(e.target.value)}
                      placeholder="Имя"
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all" />
                    <input value={newAdminChatId} onChange={e => setNewAdminChatId(e.target.value)}
                      placeholder="Chat ID (123456789)"
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all font-mono"
                      onKeyDown={e => e.key === 'Enter' && addAdmin()} />
                    <button onClick={addAdmin} disabled={!newAdminName.trim() || !newAdminChatId.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium transition-all disabled:opacity-40 shrink-0">
                      <Plus className="w-3.5 h-3.5" />Добавить
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-400">Узнать свой Chat ID можно у <span className="font-medium text-gray-600">@userinfobot</span></p>
                </div>
              </div>

              <button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); showToast('Настройки сохранены!'); }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg text-[14px] transition-all">
                Сохранить настройки
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}