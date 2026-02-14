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

    // Get all items with their school category
    const { data: items, error } = await supabase
      .from('items')
      .select('item_type, school_id, schools!inner(category)')
      .order('item_type');

    if (error) throw error;

    // Count items per (category, itemType)
    const countMap: Record<string, { itemType: string; category: string; count: number }> = {};

    for (const item of items || []) {
      const category = (item as any).schools?.category;
      if (!category) continue;
      const key = `${category}::${item.item_type}`;
      if (!countMap[key]) {
        countMap[key] = { itemType: item.item_type, category, count: 0 };
      }
      countMap[key].count++;
    }

    // Sort by category order then item type
    const categoryOrder = ['Pre-Primary', 'Lower Primary', 'Primary'];
    const itemCounts = Object.values(countMap).sort((a, b) => {
      const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return a.itemType.localeCompare(b.itemType);
    });

    return new Response(JSON.stringify({ itemCounts }), {
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
