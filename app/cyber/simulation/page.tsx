"use client";

import { useState, useEffect } from "react";
import { MailWarning, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Mail, User, Clock, ArrowRight, Activity, Smartphone, MessageSquare, Loader2 } from "lucide-react";

interface Scenario {
  type: "email" | "sms" | "messaging";
  title: "title";
  sender: "sender";
  content: "content";
  isPhishing: boolean;
  explanation: "explanation";
}

export default function SimulationPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(true);
  const [scenarioCount, setScenarioCount] = useState(1);
  const [result, setResult] = useState<"success" | "fail" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScenario = async () => {
    setIsLoadingScenario(true);
    setResult(null);
    try {
      const res = await fetch("/api/cyber/generate-scenario", { method: "POST" });
      const data = await res.json();
      setScenario(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingScenario(false);
    }
  };

  useEffect(() => {
    fetchScenario();
  }, []);

  const handleDecision = async (userSaysPhishing: boolean) => {
    if (!scenario) return;
    setIsSubmitting(true);
    const success = userSaysPhishing === scenario.isPhishing;
    
    try {
      // Still logging to simulate route so DB gets updated with scores
      await fetch("/api/cyber/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioName: scenario.title, success }),
      });
      setResult(success ? "success" : "fail");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextScenario = () => {
    setScenarioCount((prev) => prev + 1);
    fetchScenario();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "sms": return <Smartphone size={14} />;
      case "messaging": return <MessageSquare size={14} />;
      default: return <Mail size={14} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "sms": return "Incoming SMS Text";
      case "messaging": return "Incoming Direct Message";
      default: return "Incoming Email Transmission";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-100 flex items-center gap-2">
            <Activity size={24} className="text-blue-500" /> Threat Identification Module
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Sandbox Environment: Analyze the incoming communication and designate threat level.</p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-500 block mb-1">Scenario</span>
          <div className="text-lg font-mono text-neutral-300 font-medium">
            <span className="text-white">{scenarioCount}</span> / ∞
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Email/Payload Sandbox (Left 2 cols) */}
         <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col h-full shadow-sm relative relative">
           <div className="bg-neutral-950 px-4 py-3 flex items-center justify-between border-b border-neutral-800">
             <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider font-semibold">
                {scenario ? getIcon(scenario.type) : <Activity size={14} />} 
                {scenario ? getTypeText(scenario.type) : "Awaiting Data"}
             </div>
           </div>
           
           {isLoadingScenario ? (
             <div className="flex-grow flex flex-col items-center justify-center p-12 text-neutral-500 space-y-4 bg-white/5 backdrop-blur-sm">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm uppercase tracking-widest font-bold font-mono">Synthesizing Neural Payload...</p>
             </div>
           ) : scenario ? (
             <>
               {/* Metadata */}
               <div className="px-6 py-5 bg-white text-neutral-900 border-b border-neutral-200">
                  <h3 className="text-xl font-medium mb-5">{scenario.title}</h3>
                  <div className="flex items-start justify-between text-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 flex-shrink-0">
                         <User size={20} />
                       </div>
                       <div className="min-w-0">
                         <p className="font-semibold truncate">
                           {(scenario.sender || "").includes('@') ? (scenario.sender || "").split('@')[0] : (scenario.sender || "Unknown")} <span className="font-normal text-neutral-500">&lt;{scenario.sender || "Unknown Sender"}&gt;</span>
                         </p>
                         <p className="text-neutral-500 text-xs mt-0.5 truncate">To: You &lt;user@corporate.local&gt;</p>
                       </div>
                    </div>
                    <div className="text-neutral-500 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ml-4">
                      <Clock size={12} /> Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
               </div>

               {/* Payload Body */}
               <div className={`px-6 py-8 flex-grow font-sans text-sm leading-relaxed whitespace-pre-wrap ${scenario.type === 'sms' ? 'bg-neutral-100 text-neutral-800 font-medium' : 'bg-white text-neutral-800'}`}>
                  {scenario.content}
               </div>
             </>
           ) : (
             <div className="flex-grow flex flex-col items-center justify-center p-12 text-red-500">
                <ShieldAlert size={32} className="mb-2" />
                Error loading scenario.
             </div>
           )}
         </div>

         {/* Control Panel (Right 1 col) */}
         <div className="flex flex-col space-y-6">
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 shadow-sm h-full">
               <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-5 flex items-center gap-2 border-b border-neutral-800 pb-3">
                 <ShieldAlert size={14} /> Analyst Controls
               </h3>
               
               {isLoadingScenario ? (
                 <div className="flex justify-center p-8 opacity-50">
                   <div className="animate-pulse flex items-center gap-2 text-xs text-neutral-500 font-mono">
                     Initializing controls...
                   </div>
                 </div>
               ) : result === null ? (
                 <div className="space-y-3">
                   <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                     Review the headers, origin domain, and payload. Flag suspicious communications to protect the network.
                   </p>
                   <button
                     onClick={() => handleDecision(true)}
                     disabled={isSubmitting}
                     className="w-full py-3 px-4 bg-transparent hover:bg-red-950/30 text-red-400 border border-red-900/50 hover:border-red-500/50 rounded transition-all flex items-center justify-between text-sm font-medium group disabled:opacity-50"
                   >
                     <span className="flex items-center gap-2"><MailWarning size={16} /> Flag as Threat</span>
                     <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                   <button
                     onClick={() => handleDecision(false)}
                     disabled={isSubmitting}
                     className="w-full py-3 px-4 bg-transparent hover:bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 hover:border-emerald-500/50 rounded transition-all flex items-center justify-between text-sm font-medium group disabled:opacity-50"
                   >
                     <span className="flex items-center gap-2"><ShieldCheck size={16} /> Mark as Safe</span>
                     <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 </div>
               ) : (
                 <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                    <div className={`p-4 rounded border ${result === "success" ? "bg-emerald-950/20 border-emerald-900/50" : "bg-red-950/20 border-red-900/50"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {result === "success" ? (
                          <CheckCircle size={18} className="text-emerald-400" />
                        ) : (
                          <XCircle size={18} className="text-red-400" />
                        )}
                        <span className={`text-sm font-bold ${result === "success" ? "text-emerald-400" : "text-red-400"}`}>
                          {result === "success" ? "Assessment Accurate" : "Assessment Failed"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        {result === "success" 
                          ? "Threat classification matches standard definitions." 
                          : "Your classification did not align with actual threat markers. A breach may have occurred."}
                      </p>
                    </div>
                    
                    <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2 block">Post-Incident Report</span>
                      <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                        {scenario?.explanation}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        onClick={nextScenario}
                        className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-sm font-medium transition-colors border border-neutral-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Activity size={16} /> Request Next Target
                      </button>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
