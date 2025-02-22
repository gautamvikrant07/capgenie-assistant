
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sql, dbName } = await req.json();
    
    // This is where you would implement the actual query execution logic
    // For now, we'll return mock data
    const mockResults = [
      { id: 1, name: 'Product A', price: 99.99, category: 'Electronics' },
      { id: 2, name: 'Product B', price: 149.99, category: 'Electronics' },
      { id: 3, name: 'Product C', price: 199.99, category: 'Electronics' },
    ];

    return new Response(
      JSON.stringify({ results: mockResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
