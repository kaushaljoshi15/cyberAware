"use client";

import { useState } from "react";
import { ShieldAlert, Send, FileText, Link as LinkIcon, AlertTriangle } from "lucide-react";

export default function AnalyzerPage() {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/cyber/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: inputType, content }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to analyze the content." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
         <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
           Threat Analyzer
         </h2>
         <p className="text-neutral-400 mt-2">
           Submit suspicious URLs, emails, or messages. Our AI engine will analyze it in real-time, classify the threat, and provide actionable advice.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <div className="flex bg-neutral-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setInputType("url")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                inputType === "url" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              <LinkIcon size={16} /> URL
            </button>
            <button
              onClick={() => setInputType("text")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                inputType === "text" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              <FileText size={16} /> Email / Text
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                {inputType === "url" ? "Enter suspicious URL" : "Paste suspicious content"}
              </label>
              {inputType === "url" ? (
                <input
                  type="url"
                  placeholder="https://example.com/login..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
              ) : (
                <textarea
                  placeholder="Dear user, your account has been compromised..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 h-40 resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
              )}
            </div>
            
            <button
              type="submit"
              disabled={isAnalyzing || !content.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ShieldAlert size={18} /> Analyze Threat
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div>
           {result ? (
             <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {result.error ? (
                  <div className="p-6 text-red-400 flex items-center gap-3">
                    <AlertTriangle /> {result.error}
                  </div>
                ) : (
                  <>
                    <div className={`p-6 border-b flex items-start justify-between ${
                      result.classification === 'Safe' ? 'bg-green-500/10 border-green-500/20' : 
                      result.classification === 'Phishing' ? 'bg-red-500/10 border-red-500/20' :
                      'bg-yellow-500/10 border-yellow-500/20'
                    }`}>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                           Result: {result.classification}
                        </h3>
                        <p className="text-sm mt-1 opacity-80 capitalize">Severity: {result.severity}</p>
                      </div>
                      <div className={`p-3 rounded-full ${
                        result.classification === 'Safe' ? 'bg-green-500/20 text-green-400' : 
                        result.classification === 'Phishing' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                         <ShieldAlert size={28} />
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                         <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Explanation</h4>
                         <p className="text-neutral-200 leading-relaxed text-sm">
                           {result.explanation}
                         </p>
                      </div>
                      <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                         <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Recommendation</h4>
                         <p className="text-emerald-400 font-medium text-sm">
                           {result.recommendations}
                         </p>
                      </div>
                    </div>
                  </>
                )}
             </div>
           ) : (
             <div className="h-full bg-neutral-900/50 border border-neutral-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center text-neutral-500">
                <ShieldAlert size={48} className="mb-4 opacity-50" />
                <p>Submit content on the left to see the AI analysis results here.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
