
import { useState } from "react";
import { motion } from "framer-motion";
import { FileCode, Upload, Download, ChevronDown, Check, AlertCircle } from "lucide-react";

const BeyondCompare = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Mock comparison results
      setComparisonResults([
        {
          id: 1,
          field: "Total Assets",
          dbValue: "1,234,567",
          xbrlValue: "1,234,567",
          status: "match"
        },
        {
          id: 2,
          field: "Net Income",
          dbValue: "456,789",
          xbrlValue: "456,780",
          status: "mismatch"
        },
        {
          id: 3,
          field: "Capital Ratio",
          dbValue: "12.5%",
          xbrlValue: "12.5%",
          status: "match"
        }
      ]);
    }
  };

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileCode className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="heading-lg mb-1">Beyond Compare</h1>
          <p className="text-muted-foreground">Compare XBRL files with database records</p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xbrl,.xml"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium mb-1">
                {uploadedFile ? uploadedFile.name : "Upload XBRL File"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload your XBRL file
              </p>
            </div>
            <button className="btn-primary mt-4">
              Select File
            </button>
          </label>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Card */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Comparison Summary</h2>
              <button className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Fields</p>
                <p className="text-2xl font-semibold">{comparisonResults.length}</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Matching</p>
                <p className="text-2xl font-semibold text-green-600">
                  {comparisonResults.filter(r => r.status === "match").length}
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Mismatching</p>
                <p className="text-2xl font-semibold text-red-600">
                  {comparisonResults.filter(r => r.status === "mismatch").length}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Comparison */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Detailed Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Field</th>
                    <th className="text-left p-3">Database Value</th>
                    <th className="text-left p-3">XBRL Value</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResults.map((result) => (
                    <tr key={result.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">{result.field}</td>
                      <td className="p-3">{result.dbValue}</td>
                      <td className="p-3">{result.xbrlValue}</td>
                      <td className="p-3">
                        {result.status === "match" ? (
                          <span className="flex items-center gap-2 text-green-600">
                            <Check className="w-4 h-4" />
                            Match
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            Mismatch
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BeyondCompare;
