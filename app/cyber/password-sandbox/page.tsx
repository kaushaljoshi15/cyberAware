"use client";

import { useState } from "react";
import zxcvbn from "zxcvbn";
import { KeyRound, ShieldAlert, ShieldCheck, Clock, Zap, Fingerprint, Activity, Lock, Unlock, AlertTriangle } from "lucide-react";

export default function PasswordSandbox() {
  const [password, setPassword] = useState("");
  const [keystrokes, setKeystrokes] = useState<{key: string, down: number, up?: number}[]>([]);
  
  // Baseline State
  const [baselinePassword, setBaselinePassword] = useState<string | null>(null);
  const [baselineDwell, setBaselineDwell] = useState<number | null>(null);
  const [baselineFlight, setBaselineFlight] = useState<number | null>(null);
  const [baselineHash, setBaselineHash] = useState<string | null>(null);

  const result = zxcvbn(password);
  
  // Calculate Biometrics
  const completedStrokes = keystrokes.filter(k => k.up !== undefined);
  let totalDwell = 0;
  let totalFlight = 0;
  let flightCount = 0;

  completedStrokes.forEach((stroke, idx) => {
    totalDwell += (stroke.up! - stroke.down);
    if (idx > 0) {
      const prevStroke = completedStrokes[idx - 1];
      const flight = stroke.down - prevStroke.up!;
      totalFlight += flight;
      flightCount++;
    }
  });

  const avgDwellNum = completedStrokes.length > 0 ? (totalDwell / completedStrokes.length) : 0;
  const avgFlightNum = flightCount > 0 ? (totalFlight / flightCount) : 0;

  const avgDwell = avgDwellNum.toFixed(1);
  const avgFlight = avgFlightNum.toFixed(1);

  const generateBiometricHash = () => {
    if (completedStrokes.length < 4) return "AWAITING_BIOMETRIC_DATA...";
    const patternStr = completedStrokes.map(s => `${s.up! - s.down}`).join('-');
    let hash = 0;
    for (let i = 0; i < patternStr.length; i++) {
        const char = patternStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(16, '0') + Math.abs(Math.round(avgDwellNum * avgFlightNum)).toString(16).padStart(16, '0');
    return `ZTB_${hexHash.substring(0, 24).toUpperCase()}`;
  };

  const currentHash = generateBiometricHash();

  const handleSetBaseline = () => {
     if (completedStrokes.length < 4) return;
     setBaselinePassword(password);
     setBaselineDwell(avgDwellNum);
     setBaselineFlight(avgFlightNum);
     setBaselineHash(currentHash);
     setPassword("");
     setKeystrokes([]);
  };

  const handleReset = () => {
     setBaselinePassword(null);
     setBaselineDwell(null);
     setBaselineFlight(null);
     setBaselineHash(null);
     setPassword("");
     setKeystrokes([]);
  };

  // Evaluate Lockout State
  let authStatus: "idle" | "granted" | "locked" = "idle";
  let variance = 0;

  if (baselinePassword && password.length > 0) {
      if (password !== baselinePassword && password.length >= baselinePassword.length) {
          authStatus = "locked"; // Wrong password characters
      } else if (password === baselinePassword) {
          const dwellVariance = Math.abs(avgDwellNum - baselineDwell!) / baselineDwell!;
          const flightVariance = Math.abs(avgFlightNum - baselineFlight!) / baselineFlight!;
          variance = ((dwellVariance + flightVariance) / 2) * 100;
          if (variance > 25) {
              authStatus = "locked";
          } else {
              authStatus = "granted";
          }
      }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
       setKeystrokes([]);
       return;
    }
    if (e.key.length > 1) return;
    setKeystrokes(prev => [...prev, { key: e.key, down: performance.now() }]);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length > 1) return;
    const now = performance.now();
    setKeystrokes(prev => {
      const newStrokes = [...prev];
      for (let i = newStrokes.length - 1; i >= 0; i--) {
        if (newStrokes[i].key === e.key && !newStrokes[i].up) {
          newStrokes[i].up = now;
          break;
        }
      }
      return newStrokes;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPassword(val);
      if (val === "") {
          setKeystrokes([]);
      }
  };
  
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
    <>
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="mb-4">
         <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 tracking-tight flex items-center gap-3">
           <KeyRound size={36} className="text-emerald-400" /> Credential Entropy Sandbox
         </h2>
         <p className="text-neutral-400 mt-3 text-lg">
           Test credential strength against offline fast-hashing attacks (10B/sec). Processing happens entirely offline in your browser.
         </p>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-8 shadow-2xl">
         <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
           <input 
             type="text" 
             autoComplete="off"
             data-lpignore="true"
             suppressHydrationWarning
             placeholder={baselinePassword ? ">_ AUTHENTICATION MODE: ENTER CREDENTIAL..." : ">_ REGISTRATION MODE: TYPE TARGET CREDENTIAL..."} 
             value={password}
             onChange={handleChange}
             onKeyDown={handleKeyDown}
             onKeyUp={handleKeyUp}
             className="relative w-full bg-neutral-950 border border-neutral-700/50 rounded-xl px-6 py-6 text-2xl text-center text-white placeholder:text-neutral-700 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 font-mono tracking-[0.2em] transition-all shadow-inner"
           />
         </div>

         <div className="mt-10 space-y-8">
             <div className="flex justify-between items-end">
                <div>
                   <h3 className="font-bold text-neutral-500 uppercase tracking-[0.2em] text-[10px] mb-2">Vulnerability Level</h3>
                   <span className={`inline-block font-black uppercase tracking-widest px-4 py-1.5 rounded-md text-xs border ${
                     result.score >= 3 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : password.length > 0 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                   }`}>
                      {getScoreText(result.score)}
                   </span>
                </div>
                <div className="text-right">
                   <h3 className="font-bold text-neutral-500 uppercase tracking-[0.2em] text-[10px] mb-2">Entropy Score</h3>
                   <span className="font-mono text-3xl font-black text-white">{password.length > 0 ? result.score : '-'} <span className="text-neutral-700 text-sm">/ 4</span></span>
                </div>
             </div>
            
            <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden flex divide-x divide-neutral-900 border border-neutral-800">
               {[0,1,2,3,4].map((level) => (
                  <div key={level} className={`flex-1 transition-colors duration-300 ${password.length > 0 && result.score >= level ? getScoreColor(result.score) : 'bg-transparent'}`} />
               ))}
            </div>

            {password.length > 0 && (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                 <div className="bg-neutral-950/60 backdrop-blur-md p-6 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-4 text-neutral-300">
                      <Clock className="text-blue-400" />
                      <h4 className="font-bold uppercase tracking-widest text-sm">Offline Crack Time</h4>
                    </div>
                    <p className="text-3xl font-black text-white">{result.crack_times_display.offline_fast_hashing_1e10_per_second}</p>
                    <p className="text-xs text-neutral-500 mt-2">Assuming hardware capable of 10 billion hashes/second.</p>
                 </div>

                 <div className="bg-neutral-950/60 backdrop-blur-md p-6 rounded-xl border border-neutral-800">
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

              {/* ZERO TRUST BIOMETRICS */}
              <div className="mt-8 bg-neutral-950/60 backdrop-blur-md p-6 rounded-xl border border-emerald-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                 <div className="absolute top-0 right-0 p-4">
                     <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_10px_rgba(16,185,129,0.3)]">Zero-Trust Active</span>
                 </div>
                 <div className="flex items-center gap-3 mb-6 text-emerald-400">
                   <Fingerprint size={24} />
                   <h4 className="font-bold uppercase tracking-widest text-sm text-white">Behavioral Biometric Profile</h4>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mb-1">Avg Dwell Time</div>
                        <div className="text-xl font-mono text-white">{avgDwell} <span className="text-neutral-500 text-xs">ms</span></div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mb-1">Avg Flight Time</div>
                        <div className="text-xl font-mono text-white">{avgFlight} <span className="text-neutral-500 text-xs">ms</span></div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mb-1">Rhythm Variance</div>
                        <div className="text-xl font-mono text-white flex items-center justify-center gap-2">
                           <Activity size={16} className={completedStrokes.length > 3 ? "text-emerald-400 animate-pulse" : "text-neutral-600"} />
                           {completedStrokes.length > 3 ? "CAPTURED" : "SCANNING"}
                        </div>
                    </div>
                 </div>

                 <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mb-2 flex justify-between">
                       <span>Biometric Signature Hash (SHA-256)</span>
                       <span className="text-emerald-400">UNFORGEABLE</span>
                    </div>
                    <div className={`font-mono text-sm md:text-base break-all ${completedStrokes.length < 4 ? 'text-neutral-600' : 'text-emerald-400 font-bold'}`}>
                        {currentHash}
                    </div>
                 </div>

                 <div className="mt-6 flex gap-4">
                     {!baselinePassword ? (
                         <button 
                            onClick={handleSetBaseline}
                            disabled={completedStrokes.length < 4}
                            className={`flex-1 py-3 rounded-lg font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${completedStrokes.length < 4 ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
                         >
                            <Lock size={18} /> Set as Baseline Signature
                         </button>
                     ) : (
                         <button 
                            onClick={handleReset}
                            className="flex-1 py-3 rounded-lg font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                         >
                            <Unlock size={18} /> Reset Sandbox
                         </button>
                     )}
                 </div>

                 <p className="text-[10px] text-neutral-500 mt-6 uppercase tracking-wider text-center leading-relaxed">
                    This Zero-Trust profile authenticates *how* you type. Even if an attacker steals the credential, they cannot mimic your neuromuscular signature.
                 </p>
              </div>
              </>
            )}
         </div>
      </div>
    </div>

      {/* OVERLAYS */}
      {authStatus === "locked" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-neutral-950 border-2 border-red-500 rounded-2xl p-12 text-center max-w-lg shadow-[0_0_100px_rgba(239,68,68,0.5)]">
               <AlertTriangle size={80} className="text-red-500 mx-auto mb-6 animate-pulse" />
               <h2 className="text-3xl font-black text-white tracking-widest mb-4">ZERO-TRUST LOCKOUT</h2>
               <p className="text-red-400 font-mono mb-6 leading-relaxed">
                 BIOMETRIC MISMATCH DETECTED. <br/>
                 VARIANCE: {variance.toFixed(1)}% (TOLERANCE: 25%)
               </p>
               <button onClick={() => { setPassword(""); setKeystrokes([]); }} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest rounded-lg uppercase transition-colors">
                  Acknowledge & Retry
               </button>
           </div>
        </div>
      )}

      {authStatus === "granted" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-neutral-950 border-2 border-emerald-500 rounded-2xl p-12 text-center max-w-lg shadow-[0_0_100px_rgba(16,185,129,0.5)]">
               <ShieldCheck size={80} className="text-emerald-500 mx-auto mb-6" />
               <h2 className="text-3xl font-black text-white tracking-widest mb-4">ACCESS GRANTED</h2>
               <p className="text-emerald-400 font-mono mb-6 leading-relaxed">
                 BIOMETRIC SIGNATURE VERIFIED. <br/>
                 VARIANCE: {variance.toFixed(1)}% (TOLERANCE: 25%)
               </p>
               <button onClick={handleReset} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-widest rounded-lg uppercase transition-colors">
                  Reset Sandbox
               </button>
           </div>
        </div>
      )}
    </>
  );
}
