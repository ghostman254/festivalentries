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

/**
 * Generate a unique school abbreviation.
 * Uses first 2 letters of first word + first letter of subsequent words
 * to avoid collisions (e.g., "Sisoni Academy" → "SIA", "Spring Academy" → "SPA")
 */
export function generateSchoolAbbreviation(schoolName: string): string {
  const words = schoolName.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 'UNK';
  
  if (words.length === 1) {
    // Single word: take first 3 characters
    return words[0].slice(0, 3).toUpperCase();
  }
  
  // Multiple words: take first 2 chars of first word + first char of rest
  const firstWord = words[0].slice(0, 2).toUpperCase();
  const restInitials = words.slice(1).map(w => w[0].toUpperCase()).join('');
  
  return (firstWord + restInitials).slice(0, 4);
}

export function generateItemCode(schoolName: string, category: string, itemNumber: number): string {
  const schoolAbbr = generateSchoolAbbreviation(schoolName);
  const catAbbr = CATEGORY_ABBREVIATIONS[category] || 'UNK';
  const num = String(itemNumber).padStart(2, '0');
  return `${schoolAbbr}-${catAbbr}-${num}`;
}
