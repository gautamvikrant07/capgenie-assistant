
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
    const { fileContent } = await req.json();
    
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

    // Get all user tables
    const tables = db.query(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).map(([name]) => name as string);

    console.log('Found tables:', tables);

    if (tables.length === 0) {
      throw new Error('No tables found in database');
    }

    // Get schema for each table
    const schema = {};
    for (const table of tables) {
      try {
        const tableInfo = db.query(`PRAGMA table_info("${table}")`);
        schema[table] = tableInfo.map(row => ({
          name: row[1],
          type: row[2],
          notnull: row[3],
          pk: row[5]
        }));
      } catch (error) {
        console.error(`Error getting schema for table ${table}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ tables, schema }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
