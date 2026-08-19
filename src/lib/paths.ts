import { languages, type Lang } from '@/lib/i18n';

export { languages };
export type { Lang };

export function withBase(path = '') {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/');
}

export function langPath(lang: Lang, path = '') {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return withBase(`${lang}/${cleanPath}${cleanPath ? '/' : ''}`);
}
