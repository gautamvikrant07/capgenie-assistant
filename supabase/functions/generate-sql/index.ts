
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, tables } = await req.json();
    console.log('Received request:', { query, tables });

    if (!query) {
      throw new Error('Query is required');
    }

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      throw new Error('Database tables information is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert SQL developer specialized in SQLite. Generate precise SQL queries based on natural language inputs.
            Available tables: ${tables.join(', ')}
            Guidelines:
            - Generate ONLY the SQL query, no explanations
            - Ensure SQLite compatibility
            - Use proper table names as provided
            - Add appropriate JOINs when needed
            - Include WHERE clauses for filtering
            - Add ORDER BY for sorting when relevant
            - Use proper aggregation functions when needed
            - Implement subqueries if necessary
            - Consider performance optimization`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    const generatedSQL = data.choices[0].message.content.trim();
    console.log('Generated SQL:', generatedSQL);

    return new Response(
      JSON.stringify({ sql: generatedSQL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-sql function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
