export const SCHOOL_CATEGORIES = [
  'Pre School',
  'Lower Grade',
  'Primary',
  'Junior Academy',
] as const;

export const ITEM_TYPES = [
  'Choral Verse',
  'Play',
  'Spoken Word',
  'Solo Verse',
  'Modern Dance',
  'Comedy',
  'Live Broadcast',
  'Podcast',
  'Singing Games',
  'Narratives',
  'Cultural Creative Dance',
  'Video Song',
  'Documentary',
  'Advert',
] as const;

export const LANGUAGES = ['English', 'French', 'German'] as const;

export const MAX_ITEMS = 4;

export const CATEGORY_ABBREVIATIONS: Record<string, string> = {
  'Pre School': 'PRE',
  'Lower Grade': 'LGR',
  'Primary': 'PRI',
  'Junior Academy': 'JAC',
};

export function generateItemCode(schoolName: string, category: string, itemNumber: number): string {
  const schoolAbbr = schoolName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const catAbbr = CATEGORY_ABBREVIATIONS[category] || 'UNK';
  const num = String(itemNumber).padStart(2, '0');
  return `${schoolAbbr}-${catAbbr}-${num}`;
}
