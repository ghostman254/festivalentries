import type { ItemFormData } from './validation';

export interface ItemRegulation {
  itemType: string;
  maxTime: string;
  maxCast: number | null;
}

/**
 * Mapping of school categories to their allowed items with time/cast regulations.
 * 
 * Category mapping:
 * - Pre School → Pre-Primary (from regulation tables)
 * - Lower Grade → Primary (from regulation tables)
 * - Primary → Primary (from regulation tables)
 * - Junior Academy → Junior School (from regulation tables)
 */
export const CATEGORY_REGULATIONS: Record<string, ItemRegulation[]> = {
  'Pre School': [
    { itemType: 'Solo Verse', maxTime: '4 min', maxCast: 2 },
    { itemType: 'Choral Verse', maxTime: '4 min', maxCast: 16 },
    { itemType: 'Singing Games', maxTime: '5 min', maxCast: 20 },
    { itemType: 'Podcast', maxTime: '10 min', maxCast: null },
    { itemType: 'Documentary', maxTime: '10 min', maxCast: null },
    { itemType: 'Advert', maxTime: '5 min', maxCast: null },
  ],
  'Lower Grade': [
    { itemType: 'Play', maxTime: '15 min', maxCast: 20 },
    { itemType: 'Solo Verse', maxTime: '6 min', maxCast: 2 },
    { itemType: 'Choral Verse', maxTime: '6 min', maxCast: 18 },
    { itemType: 'Narratives', maxTime: '5 min', maxCast: 4 },
    { itemType: 'Modern Dance', maxTime: '7 min', maxCast: 9 },
    { itemType: 'Cultural Creative Dance', maxTime: '7 min', maxCast: 30 },
    { itemType: 'Live Broadcast', maxTime: '5 min', maxCast: 2 },
    { itemType: 'Video Song', maxTime: '10 min', maxCast: null },
    { itemType: 'Podcast', maxTime: '10 min', maxCast: null },
    { itemType: 'Documentary', maxTime: '10 min', maxCast: null },
    { itemType: 'Advert', maxTime: '5 min', maxCast: null },
  ],
  'Primary': [
    { itemType: 'Play', maxTime: '15 min', maxCast: 20 },
    { itemType: 'Solo Verse', maxTime: '6 min', maxCast: 2 },
    { itemType: 'Choral Verse', maxTime: '6 min', maxCast: 18 },
    { itemType: 'Narratives', maxTime: '5 min', maxCast: 4 },
    { itemType: 'Modern Dance', maxTime: '7 min', maxCast: 9 },
    { itemType: 'Cultural Creative Dance', maxTime: '7 min', maxCast: 30 },
    { itemType: 'Live Broadcast', maxTime: '5 min', maxCast: 2 },
    { itemType: 'Video Song', maxTime: '10 min', maxCast: null },
    { itemType: 'Podcast', maxTime: '10 min', maxCast: null },
    { itemType: 'Documentary', maxTime: '10 min', maxCast: null },
    { itemType: 'Advert', maxTime: '5 min', maxCast: null },
  ],
  'Junior Academy': [
    { itemType: 'Play', maxTime: '35 min', maxCast: 25 },
    { itemType: 'Solo Verse', maxTime: '6 min', maxCast: 2 },
    { itemType: 'Choral Verse', maxTime: '6 min', maxCast: 18 },
    { itemType: 'Spoken Word', maxTime: '5 min', maxCast: 2 },
    { itemType: 'Narratives', maxTime: '5 min', maxCast: 4 },
    { itemType: 'Modern Dance', maxTime: '7 min', maxCast: 9 },
    { itemType: 'Cultural Creative Dance', maxTime: '12 min', maxCast: 35 },
    { itemType: 'Comedy', maxTime: '5 min', maxCast: 2 },
    { itemType: 'Live Broadcast', maxTime: '5 min', maxCast: 2 },
    { itemType: 'Video Song', maxTime: '10 min', maxCast: null },
    { itemType: 'Podcast', maxTime: '10 min', maxCast: null },
    { itemType: 'Documentary', maxTime: '10 min', maxCast: null },
    { itemType: 'Advert', maxTime: '5 min', maxCast: null },
  ],
};

/**
 * Get the list of allowed item types for a given school category.
 */
export function getAllowedItemTypes(category: string): string[] {
  const regulations = CATEGORY_REGULATIONS[category];
  if (!regulations) return [];
  return regulations.map(r => r.itemType);
}

/**
 * Get regulation details for a specific item in a category.
 */
export function getItemRegulation(category: string, itemType: string): ItemRegulation | undefined {
  return CATEGORY_REGULATIONS[category]?.find(r => r.itemType === itemType);
}
