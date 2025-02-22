
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
    const { sql, dbPath } = await req.json();
    
    console.log('Executing SQL:', sql);
    
    const db = new DB(dbPath);
    
    // First, prepare the statement to validate the SQL
    const stmt = db.prepare(sql);
    
    // Execute the query and get column names
    const results = [];
    const columns = [];
    let columnsFetched = false;
    
    for (const row of stmt.iter()) {
      if (!columnsFetched) {
        // Get column names from the first row
        columns.push(...db.columns());
        columnsFetched = true;
      }
      
      // Convert row array to object with column names
      const rowObj = Object.fromEntries(
        columns.map((col, i) => [col, row[i]])
      );
      
      results.push(rowObj);
    }
    
    // Calculate some basic statistics if the results contain numeric columns
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
    
    db.close();

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
  } catch (error) {
    console.error('Error in execute-query function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
