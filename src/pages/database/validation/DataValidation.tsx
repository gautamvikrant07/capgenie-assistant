
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, AlertTriangle, XCircle, CheckCircle, Download, Filter } from "lucide-react";

const DataValidation = () => {
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  const rules = [
    "Capital Ratio Threshold",
    "Liquidity Coverage Requirements",
    "Risk Exposure Limits",
    "Data Completeness Check"
  ];

  const handleValidate = () => {
    setValidationResults([
      {
        id: 1,
        rule: "Capital Ratio Threshold",
        status: "error",
        message: "Capital ratio below required 10%",
        value: "8.5%",
        threshold: "10%"
      },
      {
        id: 2,
        rule: "Liquidity Coverage",
        status: "warning",
        message: "Approaching minimum threshold",
        value: "105%",
        threshold: "100%"
      },
      {
        id: 3,
        rule: "Risk Exposure",
        status: "success",
        message: "Within acceptable limits",
        value: "Medium",
        threshold: "High"
      }
    ]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckSquare className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="heading-lg mb-1">Data Validation</h1>
          <p className="text-muted-foreground">Validate your regulatory data against defined rules</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6 sticky top-[80px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Validation Rules</h2>
              <button className="p-2 hover:bg-muted rounded-lg">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {rules.map((rule) => (
                <label
                  key={rule}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRules.includes(rule)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRules([...selectedRules, rule]);
                      } else {
                        setSelectedRules(selectedRules.filter(r => r !== rule));
                      }
                    }}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{rule}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleValidate}
              className="btn-primary w-full mt-4"
            >
              Run Validation
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {validationResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">1 Error</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">1 Warning</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">1 Success</span>
                  </div>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Results
                </button>
              </div>

              <div className="space-y-4">
                {validationResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-card rounded-xl p-6 border ${getStatusStyle(result.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h3 className="font-medium mb-1">{result.rule}</h3>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="font-medium">{result.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Threshold: {result.threshold}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Validation Results</h3>
              <p>Select validation rules and run the validation to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataValidation;
