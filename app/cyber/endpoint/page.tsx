"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Activity, Trash2, Cpu, Globe, AlertTriangle, EyeOff } from "lucide-react";

type Alert = {
  id: string;
  hostname: string;
  filepath: string;
  filehash: string;
  classification: string;
  severity: string;
  status: string;
  created_at: string;
};

export default function EndpointCommandCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/endpoint/list");
      const data = await res.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000); // Real-time 2s polling
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (alertId: string, action: string) => {
    try {
      await fetch("/api/endpoint/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, action }),
      });
      fetchAlerts(); // Immediately refresh UI
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse";
      case "DELETE_ORDERED": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "DELETED": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "IGNORED": return "bg-neutral-500/20 text-neutral-400 border-neutral-500/50";
      default: return "bg-neutral-800 text-white";
    }
  };

  const activeThreatsCount = alerts.filter(a => a.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="flex justify-between items-end border-b border-neutral-800 pb-6">
         <div>
           <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 tracking-tight flex items-center gap-3">
             <ShieldAlert size={40} className="text-red-500" /> Active Endpoint Defense
           </h2>
           <p className="text-neutral-400 mt-3 text-lg font-mono">
             [COMMAND_CENTER] LIVE EDR TELEMETRY & INCIDENT RESPONSE
           </p>
         </div>
         <div className="text-right">
             <div className="flex items-center gap-2 justify-end mb-2">
                 <Activity size={20} className={activeThreatsCount > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"} />
                 <span className="font-bold text-neutral-500 uppercase tracking-widest text-sm">Threat Status</span>
             </div>
             <span className={`text-3xl font-black ${activeThreatsCount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {activeThreatsCount > 0 ? `${activeThreatsCount} ACTIVE THREATS` : "ALL SYSTEMS SECURE"}
             </span>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
             <div className="p-4 bg-neutral-950 rounded-lg text-emerald-500 border border-neutral-800"><Globe size={32}/></div>
             <div>
                 <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Global Endpoints</div>
                 <div className="text-2xl font-black text-white">1,024 Online</div>
             </div>
          </div>
          <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
             <div className="p-4 bg-neutral-950 rounded-lg text-blue-500 border border-neutral-800"><Cpu size={32}/></div>
             <div>
                 <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Signatures Scanned</div>
                 <div className="text-2xl font-black text-white flex items-center gap-2">84.2M <span className="text-emerald-500 text-sm animate-pulse">+</span></div>
             </div>
          </div>
          <div className="bg-neutral-900/60 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-red-500/20 text-red-500 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-bl">CRITICAL</div>
             <div className="p-4 bg-red-950/50 rounded-lg text-red-500 border border-red-500/20"><AlertTriangle size={32}/></div>
             <div>
                 <div className="text-red-400 text-xs font-bold uppercase tracking-widest">Pending Isolations</div>
                 <div className="text-2xl font-black text-white">{activeThreatsCount} Actions Req.</div>
             </div>
          </div>
       </div>

       <div className="bg-neutral-950/60 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-neutral-900/60 backdrop-blur-md px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
             <h3 className="font-bold text-white uppercase tracking-widest">Live Incident Feed</h3>
             <span className="flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
             </span>
          </div>
          <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-400">
                 <thead className="text-xs uppercase bg-neutral-900/50 text-neutral-500 font-bold tracking-widest">
                    <tr>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Endpoint</th>
                       <th className="px-6 py-4">Threat Signature (Path/Hash)</th>
                       <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-800 font-mono">
                    {loading ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">INITIALIZING SECURE FEED...</td></tr>
                    ) : alerts.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">NO INCIDENTS RECORDED IN TELEMETRY</td></tr>
                    ) : (
                        alerts.map(alert => (
                           <tr key={alert.id} className="hover:bg-neutral-900/50 transition-colors group">
                               <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border ${getStatusColor(alert.status)}`}>
                                     {alert.status}
                                  </span>
                               </td>
                               <td className="px-6 py-4 font-bold text-neutral-300">{alert.hostname}</td>
                               <td className="px-6 py-4 max-w-sm truncate group-hover:text-white transition-colors">
                                   <div className="text-red-400 font-bold mb-1 truncate">{alert.filepath}</div>
                                   <div className="text-[10px] text-neutral-600 truncate">SHA256: {alert.filehash}</div>
                               </td>
                               <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                   {alert.status === "PENDING" ? (
                                     <>
                                      <button onClick={() => handleAction(alert.id, "DELETE_ORDERED")} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase text-xs rounded transition-colors shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                                         Isolate & Destroy
                                      </button>
                                      <button onClick={() => handleAction(alert.id, "IGNORED")} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold tracking-widest uppercase text-xs rounded border border-neutral-700 transition-colors">
                                         Ignore
                                      </button>
                                     </>
                                   ) : alert.status === "DELETED" ? (
                                      <span className="text-emerald-500 font-bold flex items-center justify-end gap-2 text-xs uppercase tracking-widest">
                                         <ShieldCheck size={14} /> Threat Neutralized
                                      </span>
                                   ) : (
                                      <span className="text-neutral-500 font-bold text-xs uppercase tracking-widest">
                                         Action Logged
                                      </span>
                                   )}
                               </td>
                           </tr>
                        ))
                    )}
                 </tbody>
              </table>
          </div>
       </div>
    </div>
  );
}
