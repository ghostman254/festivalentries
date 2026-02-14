import type { ItemFormData } from './validation';

export interface ItemRegulation {
  itemType: string;
  itemCode: string;
  maxTime: string | null;
  maxCast: number | null;
}

/**
 * Mapping of school categories to their allowed items with codes.
 * 
 * Category A: Early Years Education (EYE)
 *   - Pre-Primary (ages 4-5)
 *   - Lower Primary (ages 6-8)
 * Category B: Primary Schools
 */
export const CATEGORY_REGULATIONS: Record<string, ItemRegulation[]> = {
  'Pre-Primary': [
    { itemType: 'Dramatized Singing Games', itemCode: 'A1', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Solo)', itemCode: 'A2', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Choral)', itemCode: 'A3', maxTime: null, maxCast: null },
  ],
  'Lower Primary': [
    { itemType: 'Dramatized Verse (Choral)', itemCode: 'A3', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Solo Verse', itemCode: 'A4', maxTime: null, maxCast: null },
    { itemType: 'Film for Early Years', itemCode: 'A5', maxTime: null, maxCast: null },
  ],
  'Primary': [
    { itemType: 'Play', itemCode: 'B1', maxTime: null, maxCast: null },
    { itemType: 'Cultural Creative Dance', itemCode: 'B2', maxTime: null, maxCast: null },
    { itemType: 'Modern Creative Dance', itemCode: 'B3', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Solo)', itemCode: 'B4', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Verse (Choral)', itemCode: 'B5', maxTime: null, maxCast: null },
    { itemType: 'Narrative', itemCode: 'B6', maxTime: null, maxCast: null },
    { itemType: 'Film', itemCode: 'B7', maxTime: null, maxCast: null },
    { itemType: 'Play in Kenyan Sign Language', itemCode: 'B8', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Dance for Special Needs (Mentally Handicapped)', itemCode: 'B9', maxTime: null, maxCast: null },
    { itemType: 'Dramatized Dance for Special Needs (Physically Handicapped)', itemCode: 'B10', maxTime: null, maxCast: null },
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
