
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
    const { fileContent } = await req.json();
    console.log('Received file content of size:', fileContent.length);

    if (!fileContent || !Array.isArray(fileContent)) {
      throw new Error('Invalid file content');
    }

    // Write the file content to a temporary file
    const uint8Array = new Uint8Array(fileContent);
    await Deno.writeFile(tempFilePath, uint8Array);

    // Open the database file
    db = new DB(tempFilePath);
    console.log('Successfully opened database');

    // Query SQLite master table to get all user tables
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .map(([name]) => name as string);

    console.log('Found tables:', tables);

    if (tables.length === 0) {
      throw new Error('No tables found in the database');
    }

    // Get schema for each table
    const schema = {};
    for (const table of tables) {
      const tableInfo = db.query(`PRAGMA table_info(${table})`).map(row => ({
        name: row[1],
        type: row[2]
      }));
      schema[table] = tableInfo;
    }
    
    return new Response(
      JSON.stringify({ 
        tables,
        schema
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in connect-database function:', error);
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
