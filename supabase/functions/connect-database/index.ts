
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
    if (fileContent) {
      // Convert fileContent to Uint8Array
      const uint8Array = new Uint8Array(Object.values(fileContent));
      
      // Create a temporary file
      const tempFile = await Deno.makeTempFile({ suffix: '.db' });
      await Deno.writeFile(tempFile, uint8Array);
      console.log('Created temp file:', tempFile);
      
      // Open the database
      db = new DB(tempFile);
    } else if (dbPath) {
      db = new DB(dbPath);
    } else {
      throw new Error('Either dbPath or fileContent must be provided');
    }

    // Query SQLite master table to get all user tables
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .map(([name]) => name as string);

    console.log('Found tables:', tables);
    
    db.close();

    return new Response(
      JSON.stringify({ tables }),
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
  }
});
