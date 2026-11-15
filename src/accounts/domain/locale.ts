export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export function readLocale(value: unknown): Locale {
  return value === 'en' ? 'en' : 'es';
}
