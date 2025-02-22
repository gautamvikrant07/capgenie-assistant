import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";

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
    
    let db;
    if (fileContent) {
      // If file content is provided, write it to a temporary file
      const buf = Buffer.from(fileContent);
      const tempFile = await Deno.makeTempFile({ suffix: '.db' });
      await Deno.writeFile(tempFile, buf);
      db = new DB(tempFile);
    } else {
      // Otherwise try to open the file from the provided path
      db = new DB(dbPath);
    }

    // Query SQLite master table to get all user tables
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .map(([name]) => name as string);

    db.close();

    return new Response(
      JSON.stringify({ tables }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
