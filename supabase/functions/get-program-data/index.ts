import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: items, error } = await supabase
      .from('items')
      .select('item_type, item_code, schools!inner(school_name, category)')
      .order('item_type');

    if (error) throw error;

    const categoryOrder = ['Pre-Primary', 'Lower Primary', 'Primary'];

    const programItems = (items || []).map((item: any) => ({
      itemType: item.item_type,
      itemCode: item.item_code,
      schoolName: item.schools?.school_name || 'Unknown',
      category: item.schools?.category || 'Unknown',
    })).sort((a: any, b: any) => {
      const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return a.itemType.localeCompare(b.itemType);
    });

    return new Response(JSON.stringify({ programItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching program data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch program data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
