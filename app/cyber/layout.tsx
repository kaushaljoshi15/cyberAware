"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, BarChart3, MailWarning, Download, LogOut, User, Database, KeyRound, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CyberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("Trainee");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: "Threat Analyzer", href: "/cyber/analyzer", icon: ShieldAlert },
    { name: "Phishing Simulation", href: "/cyber/simulation", icon: MailWarning },
    { name: "Threat Database", href: "/cyber/database", icon: Database },
    { name: "Password Cracker", href: "/cyber/password-sandbox", icon: KeyRound },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-50 overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 shrink-0">
          <div className="flex items-center">
            <ShieldAlert className="text-emerald-500 mr-3" />
            <h1 className="text-lg font-bold tracking-wider text-emerald-400">CyberAware</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white"
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
                onClick={() => setIsMobileMenuOpen(false)}
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
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden mr-4 text-neutral-400 hover:text-white"
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
