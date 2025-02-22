
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

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
            content: `You are a SQL expert. Generate SQLite-compatible SQL queries based on natural language inputs. 
                     Available tables and their schemas:\n${schemaDescription}`
          },
          { 
            role: 'user', 
            content: `Generate a SQL query for: ${query}\nOnly return the SQL query, nothing else.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const sql = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ sql }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
