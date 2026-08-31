export const localeConfig = {
  zh: {
    htmlLang: 'zh-CN',
    dateLocale: 'zh-CN',
    switchLabel: '中',
  },
  en: {
    htmlLang: 'en',
    dateLocale: 'en-US',
    switchLabel: 'EN',
  },
} as const;

export type Lang = keyof typeof localeConfig;
export type Localized<T> = Partial<Record<Lang, T>>;

export const languages = Object.keys(localeConfig) as Lang[];
export const defaultLanguage: Lang = 'zh';

export function localized<T>(value: Localized<T>, lang: Lang, fallback: Lang = defaultLanguage): T {
  const result = value[lang] ?? value[fallback] ?? Object.values(value)[0];
  if (result === undefined) throw new Error(`Missing localized value for ${lang}`);
  return result as T;
}
