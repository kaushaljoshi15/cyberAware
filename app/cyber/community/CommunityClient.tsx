"use client";

import { useState, useEffect, useRef } from "react";
import { Radio, Terminal, Trophy, Users, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { sendCommunityMessage, fetchLatestMessages, fetchLatestIntelFeed } from "./actions";

export default function CommunityClient({ 
  leaderboard, 
  intelFeed, 
  briefing,
  userRole,
  initialMessages
}: { 
  leaderboard: any[], 
  intelFeed: any[], 
  briefing: string,
  userRole?: string,
  initialMessages?: any[]
}) {
  const [feedLogs, setFeedLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'chat'>('terminal');
  const [chatMessages, setChatMessages] = useState<any[]>(initialMessages || []);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const knownFeedIds = useRef(new Set(intelFeed.map(f => f.id)));
  const [feedQueue, setFeedQueue] = useState<any[]>(intelFeed);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const latest = await fetchLatestMessages();
      if (latest && latest.length > 0) {
        setChatMessages(latest);
      }
    }, 3000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (initialMessages) {
      setChatMessages(initialMessages);
    }
  }, [initialMessages]);

  // Simulation: slowly scrolling intel feed adding items one by one for matrix effect
  useEffect(() => {
    let index = 0;
    if (feedQueue.length === 0) return;

    const interval = setInterval(() => {
      if (index < feedQueue.length) {
        const item = feedQueue[index];
        setFeedLogs(prev => {
          if (prev.some(p => p.id === item.id)) return prev;
          return [item, ...prev].slice(0, 50); // Keep max 50 items
        });
        index++;
      } else {
        clearInterval(interval);
        setFeedQueue([]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [feedQueue]);

  // Poll for new terminal intercepts
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const latest = await fetchLatestIntelFeed();
      if (latest && latest.length > 0) {
        const newItems = latest.filter(item => !knownFeedIds.current.has(item.id));
        if (newItems.length > 0) {
          newItems.forEach(item => knownFeedIds.current.add(item.id));
          setFeedQueue(prev => [...prev, ...newItems.reverse()]);
        }
      }
    }, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto perspective-[2000px] mb-20 px-4 pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tight flex items-center gap-3">
             <Users size={32} className="text-emerald-400" /> Community Network
          </h2>
          <p className="text-neutral-400 font-mono text-sm mt-1 uppercase tracking-widest">Global Crowdsourced Threat Intelligence</p>
        </div>
        <Link 
          href="/cyber"
          className="bg-neutral-900 border border-neutral-700 text-neutral-300 px-4 py-2 rounded font-bold hover:bg-neutral-800 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          Return to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Briefing & Leaderboard */}
        <div className="lg:col-span-1 space-y-6">
           {/* AI Director SitRep */}
           <div className="bg-neutral-900/80 backdrop-blur border border-emerald-500/30 p-6 rounded-2xl relative shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                 <Radio className="text-emerald-400 animate-pulse" size={24} />
                 <h3 className="font-bold text-emerald-400 tracking-widest uppercase text-sm">AI Director SITREP</h3>
              </div>
              <p className="text-sm text-emerald-100/80 font-mono leading-relaxed border-l-2 border-emerald-500/50 pl-4">{briefing}</p>
           </div>

           {/* Hall of Fame Leaderboard */}
           <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 p-6 rounded-2xl shadow-xl hover:border-yellow-500/30 transition-colors duration-500">
             <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
                <Trophy className="text-yellow-500" size={24} />
                <h3 className="font-bold text-neutral-200 tracking-wide uppercase text-sm">Top Operatives</h3>
             </div>
             <div className="space-y-3">
               {leaderboard.map((user, index) => (
                 <div key={index} className="flex justify-between items-center p-3 bg-neutral-950/50 rounded border border-neutral-800/50 hover:bg-neutral-800 transition-colors">
                   <div className="flex items-center gap-3">
                     <span className={`font-mono font-black text-lg ${index === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-neutral-500'}`}>#{index + 1}</span>
                     <span className="font-bold text-neutral-300 truncate max-w-[120px]" title={user.name}>{user.name}</span>
                   </div>
                   <span className="font-mono text-emerald-400 font-bold">{user.score}</span>
                 </div>
               ))}
               {leaderboard.length === 0 && (
                 <p className="text-neutral-500 font-mono text-sm text-center py-4">No scores verified yet.</p>
               )}
             </div>
           </div>
        </div>

        {/* Right Column: Global Terminal Feed */}
        <div className="lg:col-span-2">
           <div className="bg-[#0A0F14] border border-neutral-800 rounded-2xl h-[600px] flex flex-col shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              
              <div className="px-4 py-3 border-b border-neutral-800 bg-[#070b0f] flex items-center justify-between z-10 relative">
                 <div className="flex space-x-2">
                   <button 
                     onClick={() => setActiveTab('terminal')}
                     className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors ${activeTab === 'terminal' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-neutral-500 hover:text-neutral-300'}`}
                   >
                     <Terminal size={16} /> Terminal Feed
                   </button>
                   <button 
                     onClick={() => setActiveTab('chat')}
                     className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors ${activeTab === 'chat' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-neutral-500 hover:text-neutral-300'}`}
                   >
                     <MessageSquare size={16} /> Operative Comms
                   </button>
                 </div>
                 <div className="flex gap-2 mr-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/50" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/50 animate-pulse" />
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 font-mono text-xs md:text-sm space-y-3 z-10">
                {activeTab === 'terminal' ? (
                  <>
                    {feedLogs.length === 0 && (
                      <div className="text-center text-neutral-600 mt-10 animate-pulse">Establishing secure connection to global telemetry...</div>
                    )}
                    {feedLogs.map((log, idx) => {
                       if (!log) return null;
                       
                       let timeString = "00:00:00";
                       try {
                         if (log.created_at) {
                           const d = new Date(log.created_at);
                           if (!isNaN(d.getTime())) {
                             timeString = d.toISOString().split('T')[1].split('.')[0];
                           }
                         }
                       } catch (e) {}
                       
                       return (
                       <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 p-3 bg-neutral-950/60 border border-neutral-800/80 rounded animate-[fadeIn_0.5s_ease-out]">
                          <span className="text-neutral-500 whitespace-nowrap">
                            [{timeString}]
                          </span>
                          <span className="text-neutral-400">Anonymous Operative intercepted a</span>
                          <span className={`font-black uppercase tracking-wider ${
                            log.severity === 'High' ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
                            log.severity === 'Medium' ? 'text-yellow-500' : 'text-emerald-500'
                          }`}>{log.severity} RISK</span>
                          <span className="text-neutral-300">{log.type} //</span>
                          <span className={`uppercase font-bold ${
                            log.classification === 'Safe' ? 'text-emerald-400' : 'text-orange-400'
                          }`}>{log.classification}</span>
                       </div>
                       );
                    })}
                  </>
                ) : (
                  <div className="flex flex-col h-full min-h-[450px]">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                       {chatMessages.length === 0 && (
                         <div className="text-center text-neutral-600 mt-10">No comms intercepted yet. Start the broadcast.</div>
                       )}
                       {chatMessages.map((msg, idx) => (
                         <div key={idx} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                           <div className="text-xs text-neutral-500 mb-1 flex gap-2 items-center">
                             <span className={msg.isAdminView && !msg.isMine ? 'text-emerald-500 font-bold' : ''}>{msg.author}</span>
                             <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                           <div className={`p-3 rounded max-w-[80%] ${msg.isMine ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-100' : 'bg-neutral-800/50 border border-neutral-700 text-neutral-300'}`}>
                             {msg.content}
                           </div>
                         </div>
                       ))}
                       <div ref={chatEndRef} />
                    </div>
                    
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!messageInput.trim() || isSending) return;
                        setIsSending(true);
                        
                        // Optimistic update
                        const newMsg = {
                          id: Date.now(),
                          content: messageInput,
                          created_at: new Date().toISOString(),
                          author: 'You',
                          isMine: true,
                          isAdminView: userRole === 'admin'
                        };
                        setChatMessages(prev => [...prev, newMsg]);
                        setMessageInput('');
                        
                        await sendCommunityMessage(newMsg.content);
                        setIsSending(false);
                      }}
                      className="flex gap-2 mt-auto pt-4 border-t border-neutral-800"
                    >
                      <input 
                        type="text" 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Broadcast message to operatives..." 
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-4 py-2 text-neutral-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        disabled={isSending}
                      />
                      <button 
                        type="submit"
                        disabled={isSending || !messageInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                      >
                        <Send size={16} /> Send
                      </button>
                    </form>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
