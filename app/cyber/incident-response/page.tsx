"use client";

import { ShieldAlert, Activity, CheckCircle, Crosshair, Map, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function IncidentResponsePage() {
  const [status, setStatus] = useState("ISOLATING_ENDPOINT");

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus("REVOKING_TOKENS"), 2000);
    const timer2 = setTimeout(() => setStatus("QUARANTINE_SECURED"), 4500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col items-center">
      <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-12 max-w-2xl w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
         {status !== "QUARANTINE_SECURED" ? (
             <ShieldAlert size={80} className="text-red-500 mx-auto animate-pulse mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
         ) : (
             <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
         )}
         
         <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
           {status === "QUARANTINE_SECURED" ? "Incident Contained" : "Active Escalation Protocol"}
         </h1>
         
         <div className="font-mono text-sm space-y-4 text-left bg-black/60 p-6 rounded-xl border border-neutral-800 shadow-inner">
            <p className={`${status === "ISOLATING_ENDPOINT" ? 'text-red-400 animate-pulse' : 'text-emerald-400'} flex items-center gap-3 font-bold`}>
               <Activity size={16} /> [1] ISOLATING INFECTED ENDPOINT... {status !== "ISOLATING_ENDPOINT" && "OK"}
            </p>
            <p className={`${status === "REVOKING_TOKENS" ? 'text-red-400 animate-pulse' : status === "QUARANTINE_SECURED" ? 'text-emerald-400' : 'text-neutral-600'} flex items-center gap-3 font-bold`}>
               <Crosshair size={16} /> [2] REVOKING OAUTH TOKENS... {status === "QUARANTINE_SECURED" && "OK"}
            </p>
            <p className={`${status === "QUARANTINE_SECURED" ? 'text-emerald-400 font-bold' : 'text-neutral-600'} flex items-center gap-3 font-bold`}>
               <Map size={16} /> [3] ESTABLISHING ZERO-TRUST PERIMETER... {status === "QUARANTINE_SECURED" && "SECURED"}
            </p>
         </div>

         {status === "QUARANTINE_SECURED" && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <p className="text-neutral-300 mb-6 font-medium">Threat vector successfully neutralized. The compromised asset has been disconnected from the corporate network.</p>
               <Link href="/cyber" className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all border border-neutral-600 tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto max-w-xs">
                 <ShieldCheck size={18} /> ACKNOWLEDGE
               </Link>
            </div>
         )}
      </div>
    </div>
  );
}
