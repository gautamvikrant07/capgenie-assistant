import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Database, Play, Download, Save, Terminal, AlertCircle, CheckCircle, Loader2, FolderOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RunQuery = () => {
  const [query, setQuery] = useState("");
  const [dbName, setDbName] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbTables, setDbTables] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDbName(file.name);
    await loadDatabase(file);
  };

  const loadDatabase = async (file?: File) => {
    if (!dbName && !file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a database path or select a database file",
      });
      return;
    }

    setDbLoading(true);
    try {
      let formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('dbPath', dbName);
      }

      // Call the Supabase Edge Function to connect to the database
      const { data, error } = await supabase.functions.invoke('connect-database', {
        body: { 
          dbPath: dbName,
          fileContent: file ? await file.arrayBuffer() : undefined
        }
      });

      if (error) throw error;

      setDbTables(data.tables);
      toast({
        title: "Success",
        description: "Database loaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load database",
      });
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

    setLoading(true);
    try {
      // Call the Supabase Edge Function to generate SQL
      const { data, error } = await supabase.functions.invoke('generate-sql', {
        body: { 
          query,
          dbPath: dbName,
          tables: dbTables
        }
      });

      if (error) throw error;

      setGeneratedSQL(data.sql);
    } catch (error: any) {
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

    setLoading(true);
    try {
      // Call the Supabase Edge Function to execute the query
      const { data, error } = await supabase.functions.invoke('execute-query', {
        body: { 
          sql: generatedSQL,
          dbPath: dbName
        }
      });

      if (error) throw error;

      setResults(data.results);
    } catch (error: any) {
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
              <div className="flex gap-4">
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="Enter database path..."
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background 
                           focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => loadDatabase()}
                  disabled={dbLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {dbLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  Load Database
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Or browse local file:</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".db,.sqlite,.sqlite3"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  Browse
                </button>
              </div>
            </div>

            {dbTables.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Available Tables</h3>
                <div className="flex flex-wrap gap-2">
                  {dbTables.map((table) => (
                    <span key={table} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Database className="w-4 h-4" />
                Generate SQL
              </button>
              <button
                onClick={handleRunQuery}
                disabled={!generatedSQL}
                className="btn-secondary flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run Query
              </button>
            </div>
          </div>

          {generatedSQL && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 mb-6 border border-primary/10"
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
              className="glass-card rounded-xl p-6 border border-accent/10"
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
                  <thead className="bg-muted/50">
                    <tr>
                      {Object.keys(results[0]).map((key) => (
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0088CC" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunQuery;
