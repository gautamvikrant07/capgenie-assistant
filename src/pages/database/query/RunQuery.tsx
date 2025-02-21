
import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Play, Download, Save, Terminal, AlertCircle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RunQuery = () => {
  const [query, setQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [chartData] = useState([
    { name: 'Jan', value: 12.5 },
    { name: 'Feb', value: 13.2 },
    { name: 'Mar', value: 12.8 },
    { name: 'Apr', value: 13.5 },
    { name: 'May', value: 13.8 },
    { name: 'Jun', value: 14.2 },
  ]);

  const handleGenerateSQL = () => {
    setGeneratedSQL("SELECT * FROM regulatory_data WHERE reporting_date > '2024-01-01'");
  };

  const handleRunQuery = () => {
    setResults([
      { id: 1, metric: "Capital Ratio", value: "12.5%", date: "2024-01-15", trend: "up" },
      { id: 2, metric: "Liquidity Coverage", value: "110%", date: "2024-01-15", trend: "down" },
      { id: 3, metric: "Net Stable Funding", value: "105%", date: "2024-01-15", trend: "up" },
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5">
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
                      <th className="text-left p-3 font-medium">Metric</th>
                      <th className="text-left p-3 font-medium">Value</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => (
                      <tr key={row.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{row.metric}</td>
                        <td className="p-3 font-medium">{row.value}</td>
                        <td className="p-3 text-muted-foreground">{row.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            row.trend === 'up' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {row.trend === 'up' ? '↑ Up' : '↓ Down'}
                          </span>
                        </td>
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
                <LineChart data={chartData}>
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
