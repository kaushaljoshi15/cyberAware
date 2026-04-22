"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, BarChart3, MailWarning, Download, LogOut, User, Database, KeyRound, Menu, X, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function CyberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("Trainee");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Load cached user data from local storage if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserEmail(parsed.email || parsed.name || "Trainee");
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    } catch(err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/cyber", icon: BarChart3 },
    { name: "EDR Command Center", href: "/cyber/endpoint", icon: ShieldCheck },
    { name: "Threat Analyzer", href: "/cyber/analyzer", icon: ShieldAlert },
    { name: "Phishing Simulation", href: "/cyber/simulation", icon: MailWarning },
    { name: "Threat Database", href: "/cyber/database", icon: Database },
    { name: "Password Cracker", href: "/cyber/password-sandbox", icon: KeyRound },
  ];

  return (
    <div className="flex h-screen bg-transparent text-neutral-50 overflow-hidden relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 shadow-[0_0_10px_rgba(16,185,129,0.2)] overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20" />
               <ShieldAlert size={16} className="text-emerald-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black tracking-[0.15em] text-white uppercase text-sm mt-0.5">
              CYBER<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">AWARE</span>
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout - Real-Time Dashboard Feel */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-neutral-800 p-2 rounded-full border border-neutral-700">
                <User size={16} className="text-emerald-400" />
              </div>
              <div className="truncate">
                <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Active User</p>
                <p className="text-sm font-medium text-neutral-200 truncate max-w[120px]">{userEmail}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-neutral-800/50 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 px-4 py-2.5 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut size={18} />
            <span className="font-semibold text-sm">Secure Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <header className="h-16 border-b border-neutral-800 flex items-center px-4 md:px-8 bg-neutral-900/50 backdrop-blur shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4 text-neutral-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg md:text-xl font-semibold capitalize truncate">
            {navItems.find((i) => i.href === pathname)?.name || "CyberAwareness"}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
