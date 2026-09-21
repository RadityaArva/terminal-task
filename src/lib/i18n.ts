import id from '../locales/id.json';
import en from '../locales/en.json';

export type Language = 'id' | 'en';

type LocaleDict = Record<string, unknown>;

const locales: Record<Language, LocaleDict> = { id, en };

export function getTranslation(keyPath: string, lang: Language = 'id'): string {
  const parts = keyPath.split('.');
  let current: unknown = locales[lang] || locales['id'];
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      // Fallback to Indonesian if key missing
      let fallbackCurrent: unknown = locales['id'];
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = (fallbackCurrent as Record<string, unknown>)[fbPart];
        } else {
          return keyPath;
        }
      }
      return typeof fallbackCurrent === 'string' ? fallbackCurrent : keyPath;
    }
  }

  return typeof current === 'string' ? current : keyPath;
}

