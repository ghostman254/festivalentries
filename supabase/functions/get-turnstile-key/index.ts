const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const siteKey = Deno.env.get('TURNSTILE_SITE_KEY');
  
  if (!siteKey) {
    console.error('TURNSTILE_SITE_KEY not configured');
    return new Response(JSON.stringify({ error: 'CAPTCHA not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ siteKey }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
