
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";
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
    const { query, dbPath, tables } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    // Get table schemas
    const db = new DB(dbPath);
    const schemas = tables.map(table => {
      const columns = db
        .query(`PRAGMA table_info(${table})`)
        .map(row => ({
          name: row[1],
          type: row[2],
        }));
      return { table, columns };
    });
    db.close();

    const schemaDescription = schemas
      .map(schema => 
        `Table ${schema.table} columns: ${schema.columns.map(col => 
          `${col.name} (${col.type})`
        ).join(', ')}`
      )
      .join('\n');

    console.log('Generating SQL with schema:', schemaDescription);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert SQL developer specialized in SQLite. Your task is to generate precise SQL queries based on natural language inputs.
            
            Database Schema:
            ${schemaDescription}
            
            Guidelines:
            - Generate ONLY the SQL query, no explanations
            - Ensure SQLite compatibility
            - Use proper table and column names as provided
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
        temperature: 0.3, // Lower temperature for more precise output
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const generatedSQL = data.choices[0].message.content.trim();

    // Validate the generated SQL by attempting to prepare it
    try {
      const db = new DB(dbPath);
      db.prepare(generatedSQL);
      db.close();
    } catch (error) {
      console.error('SQL validation failed:', error);
      throw new Error(`Generated SQL is invalid: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ sql: generatedSQL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-sql function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
