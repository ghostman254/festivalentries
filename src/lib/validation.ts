import { z } from 'zod';
import { SCHOOL_CATEGORIES, ITEM_TYPES, LANGUAGES } from './constants';

export const itemSchema = z.object({
  itemType: z.enum(ITEM_TYPES, { required_error: 'Item type is required' }),
  language: z.enum(LANGUAGES).nullable().optional(),
});

export const submissionSchema = z.object({
  schoolName: z.string().trim().min(1, 'School name is required').max(200, 'School name too long'),
  category: z.enum(SCHOOL_CATEGORIES, { required_error: 'School category is required' }),
  teacherName: z.string().trim().min(1, 'Teacher name is required').max(100, 'Teacher name too long'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required').max(20, 'Phone number too long')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone number format'),
  items: z.array(itemSchema).min(1, 'At least one item is required').max(4, 'Maximum 4 items allowed'),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
export type ItemFormData = z.infer<typeof itemSchema>;
