
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

  const dbPath = '/tmp/temp.db';
  let db: DB | null = null;

  try {
    const { sql, fileContent } = await req.json();
    
    if (!sql) {
      throw new Error('SQL query is required');
    }

    if (!fileContent || !Array.isArray(fileContent)) {
      throw new Error('Invalid file content');
    }

    // Write the database file
    try {
      await Deno.writeFile(dbPath, new Uint8Array(fileContent));
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to write database file');
    }

    // Open the database
    try {
      db = new DB(dbPath);
      console.log('Database opened successfully');
    } catch (error) {
      console.error('Error opening database:', error);
      throw new Error('Failed to open database file');
    }

    // Execute the query
    try {
      const stmt = db.prepare(sql);
      const results = [];
      const columns = stmt.columns().map(col => col.toString());

      for (const row of stmt.iter()) {
        const obj = {};
        columns.forEach((col, index) => {
          obj[col] = row[index];
        });
        results.push(obj);
      }

      console.log(`Query executed successfully. Rows returned: ${results.length}`);

      return new Response(
        JSON.stringify({ 
          results,
          metadata: {
            rowCount: results.length,
            columns
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Query execution error:', error);
      throw new Error(`Failed to execute query: ${error.message}`);
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } finally {
    if (db) {
      try {
        db.close();
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
    try {
      await Deno.remove(dbPath);
    } catch (error) {
      console.error('Error removing temp file:', error);
    }
  }
});
