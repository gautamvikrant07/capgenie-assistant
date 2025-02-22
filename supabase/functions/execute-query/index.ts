
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

  let db: DB | undefined;
  const tempFilePath = "/tmp/temp.db";

  try {
    const { sql, fileContent } = await req.json();
    console.log('Executing SQL:', sql);

    if (!sql) {
      throw new Error('SQL query is required');
    }

    if (!fileContent || !Array.isArray(fileContent)) {
      throw new Error('Invalid file content');
    }

    // Write the file content to a temporary file
    const uint8Array = new Uint8Array(fileContent);
    await Deno.writeFile(tempFilePath, uint8Array);

    // Open the database file
    db = new DB(tempFilePath);
    console.log('Successfully opened database');

    // Execute the query
    try {
      const results = [];
      const query = db.prepare(sql);
      
      // Get column names
      const columns = query.columns();
      
      // Fetch all rows
      for (const row of query.iter()) {
        const rowObj = {};
        columns.forEach((col, index) => {
          rowObj[col] = row[index];
        });
        results.push(rowObj);
      }

      console.log(`Query executed successfully. Rows returned: ${results.length}`);

      return new Response(
        JSON.stringify({ 
          results,
          metadata: {
            columns,
            rowCount: results.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (queryError) {
      throw new Error(`SQL execution error: ${queryError.message}`);
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
  } finally {
    if (db) {
      try {
        db.close();
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
    // Clean up temporary file
    try {
      await Deno.remove(tempFilePath);
    } catch (error) {
      console.error('Error removing temporary file:', error);
    }
  }
});
