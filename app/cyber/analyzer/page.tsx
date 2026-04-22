"use client";

import { useState, useRef } from "react";
import { ShieldAlert, FileText, Link as LinkIcon, AlertTriangle, ShieldCheck, Copy, Activity, CopyCheck, FileArchive, UploadCloud, AlertCircle } from "lucide-react";
import DOMPurify from 'dompurify';
import { useRouter } from "next/navigation";

export default function AnalyzerPage() {
  const [inputType, setInputType] = useState<"url" | "text" | "file_hash">("url");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const calculateHash = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // File bounds check
      if (file.size > 50 * 1024 * 1024) {
        setResult({ error: "File exceeds 50MB OSINT limits." });
        return;
      }
      setContent(`Hashing: ${file.name}...`);
      const hash = await calculateHash(file);
      setContent(hash);
      console.log(`[OSINT DEBUG] THE REAL FILE HASH IS: ${hash} (Filename: ${file.name})`);
      performAnalysis(hash, "file_hash", file.name);
    }
  };

  const performAnalysis = async (text: string, type: "url" | "text" | "file_hash", filename?: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 800);

    try {
      const res = await fetch("/api/cyber/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content: text, filename }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Failed to analyze the content." });
      } else {
        // Sanitize AI outputs from XSS using DOMPurify
        data.explanation = DOMPurify.sanitize(data.explanation);
        data.recommendations = DOMPurify.sanitize(data.recommendations);
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to analyze the content." });
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isAnalyzing) return;
    performAnalysis(content, inputType);
  };

  const copyReport = () => {
    if (!result || result.error) return;
    // Score normalization logic included
    const score = result.confidenceScore <= 1 && result.confidenceScore > 0 ? Math.round(result.confidenceScore * 100) : result.confidenceScore || 0;
    const reportText = `Threat Analysis Report\nClassification: ${result.classification}\nSeverity: ${result.severity}\nConfidence: ${score}%\n\nWhy:\n${result.explanation}\n\nRecommendation:\n${result.recommendations}\n\nIoCs:\n${result.iocs?.join(", ") || "None"}\n`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderGauge = (rawScore: number) => {
    const score = rawScore <= 1 && rawScore > 0 ? Math.round(rawScore * 100) : rawScore;
    const color = score > 80 ? "text-emerald-400" : score > 50 ? "text-yellow-400" : "text-red-400";
    return (
      <div className="flex items-center gap-3 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
        <Activity className={color} size={24} />
        <div className="flex-1">
          <div className="flex justify-between mb-1">
             <span className="text-xs font-semibold text-neutral-400 uppercase">Confidence Score</span>
             <span className={`text-xs font-bold ${color}`}>{score}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${score > 80 ? 'bg-emerald-400' : score > 50 ? 'bg-yellow-400' : 'bg-red-400'} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-4">
         <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 tracking-tight">
           Live Threat Analyzer
         </h2>
         <p className="text-neutral-400 mt-3 text-lg max-w-2xl">
           Paste suspicious elements or securely drop files below. Our engine cross-references OSINT databases and AI heuristics to uncover zero-day threats.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input section */}
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-6 shadow-2xl flex flex-col h-full">
          <div className="flex bg-neutral-950/50 rounded-xl p-1.5 mb-6 border border-neutral-800 flex-shrink-0 gap-1 overflow-x-auto">
            <button
              onClick={() => { setInputType("url"); setContent(""); setResult(null); }}
              className={`flex-1 py-2.5 px-3 whitespace-nowrap text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputType === "url" ? "bg-neutral-800 text-white shadow-md" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              }`}
            >
              <LinkIcon size={16} /> URL Scan
            </button>
            <button
              onClick={() => { setInputType("text"); setContent(""); setResult(null); }}
              className={`flex-1 py-2.5 px-3 whitespace-nowrap text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputType === "text" ? "bg-neutral-800 text-white shadow-md" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              }`}
            >
              <FileText size={16} /> Phishing Text
            </button>
            <button
              onClick={() => { setInputType("file_hash"); setContent(""); setResult(null); }}
              className={`flex-1 py-2.5 px-3 whitespace-nowrap text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputType === "file_hash" ? "bg-neutral-800 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              }`}
            >
              <FileArchive size={16} /> OSINT File Drop
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-grow flex flex-col space-y-4 relative">
            <div className="flex-grow flex flex-col">
              
              {inputType === "file_hash" ? (
                <div 
                  className={`w-full flex-grow min-h-[250px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors p-8 text-center
                    ${dragActive ? 'border-emerald-500 bg-emerald-950/20' : 'border-neutral-700 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-500'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadCloud size={48} className={`mb-4 ${dragActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <h3 className="text-lg font-bold text-neutral-200 mb-2">Secure File Sandbox</h3>
                  <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                    Drag and drop any PDF, Executable, or Document. <br/><br/>
                    <strong className="text-emerald-400">Zero-Trust:</strong> We calculate the SHA-256 fingerprint locally. Your file never leaves this browser.
                  </p>
                  <p className="font-mono text-xs text-neutral-600 mt-6 break-all max-w-[200px]">{content}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      {inputType === "url" ? "Suspicious URL" : "Suspicious Content"}
                    </label>
                  </div>
                  {inputType === "url" ? (
                    <input
                      type="url"
                      placeholder="e.g. https://secure-login-update.com/auth"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm shadow-inner"
                      required
                    />
                  ) : (
                    <textarea
                      placeholder="Paste the suspicious email or text message payload here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full flex-grow min-h-[250px] bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-100 placeholder:text-neutral-600 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm leading-relaxed shadow-inner"
                      required
                    />
                  )}
                </>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isAnalyzing || !content.trim()}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98] flex-shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Scanning Engine Active...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Initialize Deep Scan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="h-full flex flex-col">
           {isAnalyzing && !result ? (
              <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-8 flex flex-col items-center justify-center h-full space-y-6 text-center backdrop-blur-sm shadow-xl">
                 <div className="relative">
                   <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                   <ShieldAlert size={48} className="text-emerald-400 animate-bounce relative z-10" />
                 </div>
                 
                 <div className="space-y-3 w-full max-w-xs text-left">
                   <div className={`flex items-center gap-3 text-sm font-medium ${scanStep >= 0 ? 'text-neutral-300' : 'text-neutral-600'}`}>
                     <div className={`w-2 h-2 rounded-full ${scanStep === 0 ? 'bg-emerald-400 animate-ping' : scanStep > 0 ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                     {inputType === 'file_hash' ? 'Calculating cryptographical hash...' : 'Extracting signature from payload...'}
                   </div>
                   <div className={`flex items-center gap-3 text-sm font-medium ${scanStep >= 1 ? 'text-neutral-300' : 'text-neutral-600'}`}>
                     <div className={`w-2 h-2 rounded-full ${scanStep === 1 ? 'bg-emerald-400 animate-ping' : scanStep > 1 ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                     {inputType === 'file_hash' ? 'Querying global OSINT endpoints...' : 'Analyzing heuristic patterns...'}
                   </div>
                   <div className={`flex items-center gap-3 text-sm font-medium ${scanStep >= 2 ? 'text-neutral-300' : 'text-neutral-600'}`}>
                     <div className={`w-2 h-2 rounded-full ${scanStep === 2 ? 'bg-emerald-400 animate-ping' : scanStep > 2 ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                     Confirming threat classification...
                   </div>
                 </div>
              </div>
           ) : result ? (
             <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 h-full">
                {result.error ? (
                  <div className="p-6 text-red-400 flex flex-col items-center gap-3 h-full justify-center bg-red-950/20">
                    <AlertTriangle size={36} /> 
                    <span className="font-bold text-center text-lg">{result.error}</span>
                  </div>
                ) : (
                  <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                      <div className={`p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        result.classification === 'Safe' ? 'bg-gradient-to-r from-emerald-950/40 to-neutral-900 border-emerald-900/30' : 
                        result.classification === 'Phishing' ? 'bg-gradient-to-r from-red-950/40 to-neutral-900 border-red-900/30' :
                        result.classification === 'Malware' ? 'bg-gradient-to-r from-red-950/60 to-neutral-900 border-red-900/50' :
                        'bg-gradient-to-r from-yellow-950/40 to-neutral-900 border-yellow-900/30'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl shadow-inner ${
                            result.classification === 'Safe' ? 'bg-emerald-500/10 text-emerald-400' : 
                            result.classification === 'Phishing' || result.classification === 'Malware' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                             {result.classification === 'Safe' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                                 {result.classification}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                                result.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                                result.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {result.severity} Risk
                              </span>
                            </div>
                            <p className="text-sm mt-1 text-neutral-400 font-medium tracking-wide">Threat Assessment Complete</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                          {/* MITRE ATT&CK BADGE */}
                          {result.mitreTechniqueId && result.mitreTactic && result.classification !== 'Safe' && (
                            <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 flex-grow md:flex-grow-0 flex items-center justify-between gap-3 group shadow-sm min-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className="bg-neutral-800 text-neutral-300 font-mono text-xs font-bold px-2 py-1 rounded shrink-0">ATT&CK</div>
                                 <div className="text-sm font-semibold text-neutral-300 flex flex-col items-start leading-tight min-w-0">
                                   <span className="truncate w-full">{result.mitreTechniqueId}</span>
                                   <span className="text-neutral-500 font-normal text-xs truncate w-full max-w-[120px] sm:max-w-[180px]" title={result.mitreTactic}>({result.mitreTactic})</span>
                                 </div>
                              </div>
                              <a 
                                href={`https://attack.mitre.org/techniques/${result.mitreTechniqueId.split('.')[0]}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-500 hover:text-cyan-400 transition-colors"
                                title="View in MITRE Database"
                              >
                                <LinkIcon size={16} />
                              </a>
                            </div>
                          )}
                          
                          <button 
                            onClick={copyReport}
                            className="text-neutral-400 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-2.5 rounded-lg transition-colors flex items-center justify-center min-w-[44px] h-[52px]"
                            title="Copy Report"
                          >
                            {copied ? <CopyCheck size={18} className="text-emerald-400" /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 flex-grow">
                      
                      {/* Active Escalation Protocol */}
                      {result.severity === 'High' && (
                        <div className="bg-red-950/40 border border-red-600/50 rounded-xl p-5 mb-4 animate-pulse">
                          <div className="flex items-start gap-3">
                            <AlertCircle size={28} className="text-red-500 shrink-0" />
                            <div>
                               <h4 className="text-red-500 font-black tracking-widest uppercase mb-1">Critical Threat Detected</h4>
                               <p className="text-red-200/80 text-sm font-medium mb-4">This payload matches known destructive vectors. Immediate SOC intervention is required to quarantine affected endpoints.</p>
                               <button 
                                 onClick={() => router.push('/cyber/incident-response')}
                                 className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
                               >
                                 <ShieldAlert size={16} /> INITIATE INCIDENT ESCALATION
                               </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gauges */}
                      {result.confidenceScore !== undefined && renderGauge(result.confidenceScore)}

                      {/* IoCs */}
                      {result.iocs && result.iocs.length > 0 && (
                        <div className="space-y-2">
                           <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                             <AlertTriangle size={14} className="text-red-400" /> Indicators of Compromise (IoC)
                           </h4>
                           <div className="flex flex-wrap gap-2">
                             {result.iocs.map((ioc: string, i: number) => (
                               <span key={i} className="bg-red-950/30 border border-red-900/50 text-red-300 text-xs px-3 py-1.5 rounded-md font-mono font-medium break-all shadow-sm">
                                 {ioc}
                               </span>
                             ))}
                           </div>
                        </div>
                      )}

                      <div className="space-y-2">
                         <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Analysis Engine Log</h4>
                         <div 
                           className="bg-neutral-950/50 border border-neutral-800/80 rounded-xl p-4 text-neutral-300 text-sm leading-relaxed font-medium shadow-inner font-mono"
                           dangerouslySetInnerHTML={{ __html: result.explanation }}
                         />
                      </div>

                      <div className="space-y-2">
                         <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Recommended Action</h4>
                         <div 
                           className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-emerald-400 font-semibold text-sm shadow-inner relative overflow-hidden"
                           dangerouslySetInnerHTML={{ __html: result.recommendations }}
                         />
                      </div>
                    </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="h-full bg-neutral-900/30 border border-neutral-800/50 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center text-neutral-500 relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20"></div>
                <div className="p-6 bg-neutral-900/50 rounded-full mb-6 border border-neutral-800/50 group-hover:scale-110 transition-transform duration-500 relative z-10 shadow-lg">
                  <ShieldAlert size={48} className="opacity-40" />
                </div>
                <h3 className="text-xl font-bold text-neutral-400 mb-2 relative z-10">Awaiting Target Vector</h3>
                <p className="max-w-xs relative z-10 font-medium">Sensors are online. Paste text, URLs, or drop a file to initiate threat analysis.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
