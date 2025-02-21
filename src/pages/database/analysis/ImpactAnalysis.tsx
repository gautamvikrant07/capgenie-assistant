
import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, ArrowRight, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ImpactAnalysis = () => {
  const [scenario, setScenario] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [impactData] = useState([
    { month: 'Jan', baseline: 4000, projected: 4400 },
    { month: 'Feb', baseline: 3000, projected: 3300 },
    { month: 'Mar', baseline: 2000, projected: 2800 },
    { month: 'Apr', baseline: 2780, projected: 3908 },
    { month: 'May', baseline: 1890, projected: 2800 },
    { month: 'Jun', baseline: 2390, projected: 3800 },
  ]);

  const handleAnalyze = () => {
    setResults([
      { metric: "Capital Ratio", baseline: "12.5%", projected: "11.8%", impact: "High", trend: "negative" },
      { metric: "Liquidity Coverage", baseline: "110%", projected: "115%", impact: "Medium", trend: "positive" },
      { metric: "Net Stable Funding", baseline: "105%", projected: "106%", impact: "Low", trend: "positive" },
    ]);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="heading-lg mb-1">Impact Analysis</h1>
          <p className="text-muted-foreground">Analyze potential impacts of regulatory changes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium mb-2">Scenario Description</label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the regulatory change scenario..."
              className="w-full h-32 p-3 rounded-lg border border-input bg-background resize-none focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              onClick={handleAnalyze}
              className="btn-primary mt-4 flex items-center gap-2"
            >
              Analyze Impact
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Impact Analysis Results</h2>
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>

              <div className="grid gap-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-background border border-input"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.metric}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.impact === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : result.impact === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.impact} Impact
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Baseline</p>
                        <p className="text-lg font-semibold">{result.baseline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projected</p>
                        <p className="text-lg font-semibold">{result.projected}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6 sticky top-[80px]">
            <h2 className="text-lg font-semibold mb-4">Trend Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="baseline" stroke="#0088CC" name="Baseline" />
                  <Line type="monotone" dataKey="projected" stroke="#32CD32" name="Projected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Analysis Note</h4>
                  <p className="text-sm text-yellow-600">
                    Projected values show potential volatility in Q2. Consider additional risk mitigation measures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
