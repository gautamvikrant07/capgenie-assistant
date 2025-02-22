
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
    const { dbPath, fileContent } = await req.json();
    console.log('Received request with dbPath:', dbPath);
    
    let db;
    try {
      // Create in-memory database
      db = new DB(':memory:');
      
      if (fileContent) {
        // Convert to Uint8Array
        const buffer = new Uint8Array(fileContent);
        console.log('Received file content of size:', buffer.length);
        
        // Create a simple table to test the connection
        db.query(`CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)`);
        
        console.log('Successfully created test table');
      } else if (dbPath) {
        console.log('Using database path:', dbPath);
        throw new Error('Direct file path access is not supported. Please upload a file.');
      }

      // Query SQLite master table to get all user tables
      const tables = db
        .query("SELECT name FROM sqlite_master WHERE type='table'")
        .map(([name]) => name as string);

      console.log('Found tables:', tables);
      
      return new Response(
        JSON.stringify({ tables }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to process database: ${dbError.message}`);
    } finally {
      if (db) {
        try {
          db.close();
        } catch (closeError) {
          console.error('Error closing database:', closeError);
        }
      }
    }
  } catch (error) {
    console.error('Error in connect-database function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
