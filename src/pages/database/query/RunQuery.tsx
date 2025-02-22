
import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Play, Download, Save, Terminal, CheckCircle, Loader2, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type QueryResult = Record<string, any>;

// Define the database function parameters and return type
type ExecuteQueryFunctionParams = {
  query_string: string;
};

type ExecuteQueryFunctionReturn = QueryResult[];

const RunQuery = () => {
  const [query, setQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const tables = [
    'corep_institutions',
    'corep_counterparties',
    'corep_exposures',
    'corep_exposure_details',
    'corep_large_exposures'
  ];

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
      const { data, error } = await supabase.functions.invoke('generate-sql', {
        body: { 
          query,
          tables
        }
      });

      if (error) throw error;

      setGeneratedSQL(data?.sql || '');
      setAnalysis('');
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

    setLoading(true);
    try {
      const { data: queryData, error: queryError } = await supabase
        .rpc<ExecuteQueryFunctionReturn, ExecuteQueryFunctionParams>(
          'execute_query',
          { query_string: generatedSQL }
        );

      if (queryError) throw queryError;

      const queryResults = queryData || [];
      setResults(queryResults);

      // Get AI analysis of the results
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-results', {
        body: { 
          query,
          results: queryResults
        }
      });

      if (analysisError) throw analysisError;

      setAnalysis(analysisData?.analysis || '');
      
      toast({
        title: "Success",
        description: `Query executed successfully. ${queryResults.length} rows returned.`,
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
          <p className="text-muted-foreground">Execute natural language queries on COREP Large Exposure data</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="space-y-4">              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Available Tables</h3>
                <div className="flex flex-wrap gap-2">
                  {tables.map((table) => (
                    <span key={table} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Query Input</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query in natural language... (e.g., 'Show me all large exposures that exceed limits')"
                className="w-full h-32 p-3 rounded-lg border border-input bg-background resize-none focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleGenerateSQL}
                  disabled={loading}
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

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">AI Analysis</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                {analysis.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
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
                      {results.length > 0 && Object.keys(results[0]).map((key) => (
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
