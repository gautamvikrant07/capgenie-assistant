
import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Play, Download, Save, Terminal } from "lucide-react";

const RunQuery = () => {
  const [query, setQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleGenerateSQL = () => {
    setGeneratedSQL("SELECT * FROM regulatory_data WHERE reporting_date > '2024-01-01'");
  };

  const handleRunQuery = () => {
    setResults([
      { id: 1, metric: "Capital Ratio", value: "12.5%", date: "2024-01-15" },
      { id: 2, metric: "Liquidity Coverage", value: "110%", date: "2024-01-15" },
      { id: 3, metric: "Net Stable Funding", value: "105%", date: "2024-01-15" },
    ]);
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

      <div className="glass-card rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium mb-2">Query Input</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query in natural language..."
          className="w-full h-32 p-3 rounded-lg border border-input bg-background resize-none focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={handleGenerateSQL} className="btn-primary flex items-center gap-2">
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
          className="glass-card rounded-xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Generated SQL</h2>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Results</h2>
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
                <tr className="border-b">
                  <th className="text-left p-3">Metric</th>
                  <th className="text-left p-3">Value</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">{row.metric}</td>
                    <td className="p-3">{row.value}</td>
                    <td className="p-3">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RunQuery;
