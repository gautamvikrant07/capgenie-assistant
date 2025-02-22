
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Database, Play, Download, Save, Terminal, AlertCircle, CheckCircle, Loader2, FolderOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseState {
  content: number[];
  name: string;
  tables: string[];
}

const RunQuery = () => {
  const [query, setQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [database, setDatabase] = useState<DatabaseState>({
    content: [],
    name: "",
    tables: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large. Maximum size is 10MB.');
      }
      
      await loadDatabase(file);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load database file"
      });
    }
  };

  const loadDatabase = async (file: File) => {
    setDbLoading(true);
    try {
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const array = Array.from(uint8Array); // Convert to regular array for JSON

      console.log('Sending file of size:', array.length);

      const { data, error } = await supabase.functions.invoke('connect-database', {
        body: { fileContent: array }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.tables) {
        throw new Error('No tables received from database');
      }

      setDatabase({
        content: array,
        name: file.name,
        tables: data.tables
      });

      toast({
        title: "Success",
        description: "Database loaded successfully",
      });
    } catch (error: any) {
      console.error('Database loading error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load database",
      });
      setDatabase({ content: [], name: "", tables: [] });
    } finally {
      setDbLoading(false);
    }
  };

  const handleGenerateSQL = async () => {
    if (!query) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a query",
      });
      return;
    }

    if (!database.tables.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please load a database file first",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sql', {
        body: { 
          query,
          tables: database.tables
        }
      });

      if (error) throw error;

      setGeneratedSQL(data.sql);
      toast({
        title: "Success",
        description: "SQL query generated successfully",
      });
    } catch (error: any) {
      console.error('SQL generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate SQL",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!generatedSQL) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please generate SQL first",
      });
      return;
    }

    if (!database.content.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please load a database file first",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-query', {
        body: { 
          sql: generatedSQL,
          fileContent: database.content
        }
      });

      if (error) throw error;

      setResults(data.results);
      toast({
        title: "Success",
        description: `Query executed successfully. ${data.results.length} rows returned.`,
      });
    } catch (error: any) {
      console.error('Query execution error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to execute query",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Terminal className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="heading-lg mb-1">Run Query</h1>
          <p className="text-muted-foreground">Execute natural language queries on your data</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="space-y-4">              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".db,.sqlite,.sqlite3"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary flex items-center gap-2"
                >
                  {dbLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FolderOpen className="w-4 h-4" />
                  )}
                  Select Database File
                </button>
                {database.name && (
                  <span className="text-sm text-muted-foreground">
                    Selected: {database.name}
                  </span>
                )}
              </div>
            </div>

            {database.tables.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Available Tables</h3>
                <div className="flex flex-wrap gap-2">
                  {database.tables.map((table) => (
                    <span key={table} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Query Input</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query in natural language..."
                className="w-full h-32 p-3 rounded-lg border border-input bg-background resize-none focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleGenerateSQL}
                  disabled={loading || !database.name}
                  className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  Generate SQL
                </button>
                <button
                  onClick={handleRunQuery}
                  disabled={loading || !generatedSQL}
                  className="btn-secondary flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Query
                </button>
              </div>
            </div>
          </div>

          {generatedSQL && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold">Generated SQL</h2>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-input">
                <code>{generatedSQL}</code>
              </pre>
            </motion.div>
          )}

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Results</h2>
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                    {results.length} rows
                  </span>
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Query
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Results
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {Object.keys(results[0] || {}).map((key) => (
                        <th key={key} className="text-left p-3 font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="p-3">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6 sticky top-[80px]">
            <h2 className="text-lg font-semibold mb-4">Trend Analysis</h2>
            {results.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={Object.keys(results[0])[0]} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(results[0])
                      .filter(key => typeof results[0][key] === 'number')
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={index === 0 ? "#0088CC" : "#22C55E"}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Run a query to see trends in your data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunQuery;
