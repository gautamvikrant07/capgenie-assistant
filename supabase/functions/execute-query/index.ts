
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
    const { sql, fileContent } = await req.json();
    console.log('Executing SQL:', sql);

    if (!sql) {
      throw new Error('SQL query is required');
    }

    if (!fileContent) {
      throw new Error('Database content is required');
    }

    // Create in-memory database
    const db = new DB(':memory:');
    
    try {
      // Import the database content
      const buffer = new Uint8Array(fileContent);
      console.log('Database content size:', buffer.length);

      // Execute the query
      const stmt = db.prepare(sql);
      const results = [];
      const columns = [];
      let columnsFetched = false;

      for (const row of stmt.iter()) {
        if (!columnsFetched) {
          columns.push(...stmt.columns());
          columnsFetched = true;
        }

        // Convert row array to object with column names
        const rowObj = Object.fromEntries(
          columns.map((col, i) => [col, row[i]])
        );

        results.push(rowObj);
      }

      console.log(`Query executed successfully. Rows returned: ${results.length}`);

      // Calculate statistics for numeric columns
      const stats = {};
      if (results.length > 0) {
        columns.forEach(col => {
          const values = results.map(row => row[col]).filter(val => typeof val === 'number');
          if (values.length > 0) {
            stats[col] = {
              min: Math.min(...values),
              max: Math.max(...values),
              avg: values.reduce((a, b) => a + b, 0) / values.length,
              count: values.length
            };
          }
        });
      }

      return new Response(
        JSON.stringify({
          results,
          metadata: {
            rowCount: results.length,
            columns,
            stats
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error in execute-query function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
