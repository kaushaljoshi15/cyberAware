import Link from 'next/link';
import { ShieldAlert, Activity, Server, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 overflow-hidden relative font-sans flex flex-col items-center">
      
      {/* Ambient background glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-6 z-50 w-full max-w-6xl px-6">
        <div className="mx-auto flex h-16 items-center justify-between rounded-2xl border border-neutral-800/80 bg-neutral-900/60 px-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-all">
              <ShieldAlert size={18} />
            </div>
            <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 uppercase text-sm">
              CyberAware
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link 
              href="/cyber" 
              className="text-xs md:text-sm font-bold bg-white text-neutral-950 px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-emerald-400 hover:text-neutral-950 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200 whitespace-nowrap"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-6xl px-4 md:px-6 pt-32 md:pt-48 pb-20 flex flex-col items-center text-center z-10">
        
        {/* Status Badge */}
        <div className="group inline-flex items-center text-left md:text-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-8 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-default shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Next-Gen Threat Intelligence Active
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 md:mb-8 leading-[1.1] max-w-4xl px-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
            Detect threats.
          </span>
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 ml-0 sm:ml-2">
            Educate users. Strengthen defences.
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-neutral-400 max-w-2xl mb-10 md:mb-12 leading-relaxed font-medium px-2">
          An intelligent, AI-driven platform that classifies malicious URLs, emails, and messages in real time. Gain actionable insights, track your awareness score, and simulate sophisticated phishing attacks.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Link 
            href="/cyber/analyzer" 
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-neutral-950 rounded-xl font-bold text-sm hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <Zap size={18} />
            Try Threat Analyzer
          </Link>
          <Link 
            href="/cyber" 
            className="w-full sm:w-auto px-8 py-4 bg-neutral-900 border border-neutral-700 text-white rounded-xl font-bold text-sm hover:bg-neutral-800 hover:border-neutral-500 shadow-sm transition-all flex items-center justify-center gap-3"
          >
            <Activity size={18} />
            View Dashboard
          </Link>
        </div>
      </main>

      {/* Features Showcase */}
      <section id="features" className="w-full max-w-6xl px-6 py-24 relative z-10 border-t border-neutral-800/50 mt-12 bg-neutral-950/50">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">Powered by Artificial Intelligence.</h2>
          <p className="text-neutral-400 text-lg leading-relaxed font-medium">Interactive, adaptive, and visually intuitive platform designed to dramatically reduce enterprise risk.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <ShieldAlert className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Real-Time Classifier</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">
              Submit suspicious inputs—URLs, emails, or messages. Our LLM-powered engine categorizes them into Phishing, Malware, Social Engineering, or Safe within milliseconds.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-900 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Awareness Tracking</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">
              Maintain a persistent user awareness score. Track historical encounters via interactive charts, category breakdowns, and exportable PDF summaries.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 hover:border-violet-500/50 hover:bg-neutral-900 transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Server className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Simulated Scenarios</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">
              Validate your team's knowledge through interactive end-to-end phishing modules guiding them through psychological red flags and behavioral indicators.
            </p>
          </div>
        </div>
      </section>
      
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-12 mt-auto z-10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-neutral-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <ShieldAlert size={16} />
              </div>
              <span className="font-bold tracking-widest text-emerald-400 uppercase text-sm">CyberAware</span>
          </div>
          <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            © {new Date().getFullYear()} Modern Cybersecurity Education.
          </p>
        </div>
      </footer>
    </div>
  );
}