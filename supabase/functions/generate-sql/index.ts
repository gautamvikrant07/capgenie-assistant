
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a financial data analyst specializing in COREP reporting and SQL. Analyze the following tables and provide both SQL queries and detailed analysis:
            Available tables: ${tables.join(', ')}
            
            Table relationships:
            - corep_exposures links to corep_institutions via institution_id
            - corep_exposures links to corep_counterparties via counterparty_id
            - corep_exposure_details links to corep_exposures via exposure_id
            - corep_large_exposures links to corep_exposures via exposure_id`
          },
          {
            role: 'user',
            content: `For the question: "${query}", please provide:
            1. An SQL query to fetch the relevant data
            2. A detailed analysis explaining what the data means in the context of COREP reporting`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    let sqlQuery = '';
    let analysis = '';

    // Extract SQL and analysis from the response
    if (content.includes('SQL query')) {
      const parts = content.split(/SQL query:?|Analysis:/i);
      sqlQuery = parts[1]?.trim() || '';
      analysis = parts[2]?.trim() || '';
    } else {
      // Fallback if the format is different
      sqlQuery = content.match(/SELECT[\s\S]*?;/i)?.[0] || '';
      analysis = content.replace(sqlQuery, '').trim();
    }

    return new Response(
      JSON.stringify({ sql: sqlQuery, analysis }),
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
