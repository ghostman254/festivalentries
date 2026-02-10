import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limiting: Store submission attempts by IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 submissions per hour per IP

// Validation constants
const SCHOOL_CATEGORIES = ['Pre School', 'Lower Grade', 'Primary', 'Junior Academy'];
const ITEM_TYPES = [
  'Choral Verse', 'Play', 'Spoken Word', 'Solo Verse', 'Modern Dance',
  'Comedy', 'Live Broadcast', 'Podcast', 'Singing Games', 'Narratives',
  'Cultural Creative Dance', 'Video Song', 'Documentary', 'Advert'
];
const LANGUAGES = ['English', 'French', 'German'];
const CATEGORY_ABBREVIATIONS: Record<string, string> = {
  'Pre School': 'PRE',
  'Lower Grade': 'LGR',
  'Primary': 'PRI',
  'Junior Academy': 'JAC',
};

function generateSchoolAbbreviation(schoolName: string): string {
  const words = schoolName.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 'UNK';
  
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  
  const firstWord = words[0].slice(0, 2).toUpperCase();
  const restInitials = words.slice(1).map(w => w[0].toUpperCase()).join('');
  
  return (firstWord + restInitials).slice(0, 4);
}

function generateItemCode(schoolName: string, category: string, itemNumber: number): string {
  const schoolAbbr = generateSchoolAbbreviation(schoolName);
  const catAbbr = CATEGORY_ABBREVIATIONS[category] || 'UNK';
  const num = String(itemNumber).padStart(2, '0');
  return `${schoolAbbr}-${catAbbr}-${num}`;
}

interface SubmissionItem {
  itemType: string;
  language: string | null;
}

interface SubmissionRequest {
  schoolName: string;
  category: string;
  teacherName: string;
  phoneNumber: string;
  items: SubmissionItem[];
  formLoadTime?: number;
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitMap.delete(ip);
  }

  const currentRecord = rateLimitMap.get(ip);

  if (!currentRecord) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (currentRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((currentRecord.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  currentRecord.count++;
  return { allowed: true };
}

function validateSubmission(data: SubmissionRequest): { valid: boolean; error?: string } {
  // School name
  if (!data.schoolName || typeof data.schoolName !== 'string') {
    return { valid: false, error: 'School name is required' };
  }
  const schoolName = data.schoolName.trim();
  if (schoolName.length < 1 || schoolName.length > 200) {
    return { valid: false, error: 'School name must be between 1 and 200 characters' };
  }

  // Category
  if (!data.category || !SCHOOL_CATEGORIES.includes(data.category)) {
    return { valid: false, error: 'Invalid school category' };
  }

  // Teacher name
  if (!data.teacherName || typeof data.teacherName !== 'string') {
    return { valid: false, error: 'Teacher name is required' };
  }
  const teacherName = data.teacherName.trim();
  if (teacherName.length < 1 || teacherName.length > 100) {
    return { valid: false, error: 'Teacher name must be between 1 and 100 characters' };
  }

  // Phone number
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  const phoneNumber = data.phoneNumber.trim();
  if (phoneNumber.length < 1 || phoneNumber.length > 20) {
    return { valid: false, error: 'Phone number must be between 1 and 20 characters' };
  }
  if (!/^[\d\s\+\-\(\)]+$/.test(phoneNumber)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  // Items
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 20) {
    return { valid: false, error: 'You must submit between 1 and 20 items' };
  }

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.itemType || !ITEM_TYPES.includes(item.itemType)) {
      return { valid: false, error: `Invalid item type for item ${i + 1}` };
    }
    if (item.itemType === 'Play' && (!item.language || !LANGUAGES.includes(item.language))) {
      return { valid: false, error: `Language is required for Play item ${i + 1}` };
    }
    if (item.language && !LANGUAGES.includes(item.language)) {
      return { valid: false, error: `Invalid language for item ${i + 1}` };
    }
  }

  // Server-side timing check (minimum 2 seconds to fill form)
  if (data.formLoadTime) {
    const timeSpent = Date.now() - data.formLoadTime;
    if (timeSpent < 2000) {
      return { valid: false, error: 'Form submitted too quickly. Please try again.' };
    }
  }

  return { valid: true };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('cf-connecting-ip') || 
               'unknown';

    console.log(`Submission attempt from IP: ${ip}`);

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return new Response(JSON.stringify({ 
        error: 'Too many submissions. Please try again later.',
        retryAfter: rateLimit.retryAfter
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfter)
        },
      });
    }

    // Parse request body
    const body: SubmissionRequest = await req.json();

    // Validate input
    const validation = validateSubmission(body);
    if (!validation.valid) {
      console.log(`Validation failed: ${validation.error}`);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role for insert
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if submissions are open
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'submissions_open')
      .maybeSingle();

    if (settingsData && settingsData.value !== 'true') {
      return new Response(JSON.stringify({ error: 'Submissions are currently closed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize school name: lowercase, trim, collapse whitespace
    const normalizedSchoolName = body.schoolName.trim().replace(/\s+/g, ' ');

    // Check for duplicate school name
    const { data: existsData, error: existsError } = await supabase
      .rpc('check_school_exists', { school_name_param: normalizedSchoolName });

    if (existsError) {
      console.error('Error checking school existence:', existsError);
      throw new Error('Failed to verify school name');
    }

    if (existsData === true) {
      return new Response(JSON.stringify({ 
        error: 'This school is already registered. Each school can only submit once.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        school_name: body.schoolName.trim(),
        category: body.category,
        teacher_name: body.teacherName.trim(),
        phone_number: body.phoneNumber.trim(),
        total_items: body.items.length,
      })
      .select()
      .single();

    if (schoolError) {
      console.error('Error inserting school:', schoolError);
      throw new Error('Failed to create school record');
    }

    console.log(`School created: ${school.id}`);

    // Generate item codes and insert items
    const itemsToInsert = body.items.map((item, idx) => ({
      school_id: school.id,
      item_type: item.itemType,
      language: item.language || null,
      item_code: generateItemCode(body.schoolName, body.category, idx + 1),
    }));

    const { data: items, error: itemsError } = await supabase
      .from('items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('Error inserting items:', itemsError);
      // Try to clean up the school record
      await supabase.from('schools').delete().eq('id', school.id);
      throw new Error('Failed to create item records');
    }

    console.log(`${items.length} items created for school ${school.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      school, 
      items 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your submission. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
