"use client";

import { useState } from "react";
import zxcvbn from "zxcvbn";
import { KeyRound, ShieldAlert, ShieldCheck, Clock, Zap } from "lucide-react";

export default function PasswordSandbox() {
  const [password, setPassword] = useState("");
  const result = zxcvbn(password);
  
  const getScoreColor = (score: number) => {
    switch(score) {
      case 0: return "bg-red-600";
      case 1: return "bg-orange-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-emerald-500";
      default: return "bg-neutral-800";
    }
  };

  const getScoreText = (score: number) => {
    switch(score) {
      case 0: return "CRITICAL RISK";
      case 1: return "WEAK";
      case 2: return "FAIR";
      case 3: return "STRONG";
      case 4: return "BULLETPROOF";
      default: return "WAITING FOR INPUT";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="mb-4">
         <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tight flex items-center gap-3">
           <KeyRound size={36} className="text-purple-400" /> Password Entropy Sandbox
         </h2>
         <p className="text-neutral-400 mt-3 text-lg">
           Test credential strength against offline fast-hashing attacks (10B/sec). Processing happens entirely offline in your browser.
         </p>
      </div>

      <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-8 shadow-2xl">
         <input 
           type="text" 
           placeholder="Type a password to test..." 
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-6 py-5 text-2xl text-center text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 font-mono tracking-widest transition-all"
         />

         <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
               <span className="font-bold text-neutral-400 uppercase tracking-widest text-sm">Entropy Score</span>
               <span className={`font-black uppercase tracking-widest px-4 py-1 rounded-full text-sm ${
                 result.score >= 3 ? 'bg-emerald-500/20 text-emerald-400' : password.length > 0 ? 'bg-red-500/20 text-red-500' : 'bg-neutral-800 text-neutral-500'
               }`}>
                  {getScoreText(result.score)}
               </span>
            </div>
            
            <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden flex divide-x divide-neutral-900 border border-neutral-800">
               {[0,1,2,3,4].map((level) => (
                  <div key={level} className={`flex-1 transition-colors duration-300 ${password.length > 0 && result.score >= level ? getScoreColor(result.score) : 'bg-transparent'}`} />
               ))}
            </div>

            {password.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                 <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-4 text-neutral-300">
                      <Clock className="text-blue-400" />
                      <h4 className="font-bold uppercase tracking-widest text-sm">Offline Crack Time</h4>
                    </div>
                    <p className="text-3xl font-black text-white">{result.crack_times_display.offline_fast_hashing_1e10_per_second}</p>
                    <p className="text-xs text-neutral-500 mt-2">Assuming hardware capable of 10 billion hashes/second.</p>
                 </div>

                 <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-4 text-neutral-300">
                      <Zap className="text-yellow-400" />
                      <h4 className="font-bold uppercase tracking-widest text-sm">Vulnerability Analysis</h4>
                    </div>
                    {result.feedback.warning ? (
                       <p className="text-red-400 font-bold mb-2 flex flex-wrap gap-2 items-center">
                          <ShieldAlert size={16} /> {result.feedback.warning}
                       </p>
                    ) : (
                       <p className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                          <ShieldCheck size={16} /> No critical vulnerabilities detected.
                       </p>
                    )}
                    {result.feedback.suggestions?.length > 0 && (
                       <ul className="text-sm text-neutral-400 list-disc pl-5 mt-2 space-y-1">
                          {result.feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                    )}
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
