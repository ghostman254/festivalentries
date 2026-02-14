import type { ItemFormData } from './validation';

export interface ItemRegulation {
  itemType: string;
  code: string;
  maxTime: string | null;
  maxCast: number | null;
}

/**
 * Mapping of school categories to their allowed items.
 * 
 * Category A: Early Years Education (EYE)
 *   - Pre-Primary (A1–A3)
 *   - Lower Primary (A3–A5)
 * 
 * Category B: Primary Schools (B1–B10)
 */
export const CATEGORY_REGULATIONS: Record<string, ItemRegulation[]> = {
  'Pre-Primary': [
    { itemType: 'Dramatized Singing Games', code: 'A1', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Solo)', code: 'A2', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Choral)', code: 'A3', maxTime: null, maxCast: null },
  ],
  'Lower Primary': [
    { itemType: 'Dramatized Verse (Choral)', code: 'A3', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Solo Verse', code: 'A4', maxTime: null, maxCast: null },
    { itemType: 'Film for Early Years', code: 'A5', maxTime: null, maxCast: null },
  ],
  'Primary': [
    { itemType: 'Play', code: 'B1', maxTime: null, maxCast: null },
    { itemType: 'Cultural Creative Dance', code: 'B2', maxTime: null, maxCast: null },
    { itemType: 'Modern Creative Dance', code: 'B3', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Solo)', code: 'B4', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Choral)', code: 'B5', maxTime: null, maxCast: null },
    { itemType: 'Narrative', code: 'B6', maxTime: null, maxCast: null },
    { itemType: 'Film', code: 'B7', maxTime: null, maxCast: null },
    { itemType: 'Play in Kenyan Sign Language', code: 'B8', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Dance for Special Needs (Mentally Handicapped)', code: 'B9', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Dance for Special Needs (Physically Handicapped)', code: 'B10', maxTime: null, maxCast: null },
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
