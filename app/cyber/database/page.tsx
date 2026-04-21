"use client";

import { useState } from "react";
import { Shield, MailWarning, Bug, Database, AlertCircle, Eye, Link as LinkIcon, FileKey, MessageSquareWarning, ChevronRight, Activity } from "lucide-react";

export default function ThreatDatabasePage() {
  const [activeTab, setActiveTab] = useState("phishing");

  const database = {
    phishing: {
      id: "phishing",
      title: "Phishing",
      icon: MailWarning,
      color: "from-red-600 to-rose-500",
      textColor: "text-red-400",
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      hoverBorder: "hover:border-red-500/40",
      description: "A deceptive technique attempting to acquire sensitive data—like credentials or financial details—by impersonating a trustworthy entity in electronic communications.",
      tactics: [
        { name: "Deceptive URLs", desc: "Using domains visually similar to legitimate ones (e.g. g00gle.com) to bypass visual inspection.", icon: LinkIcon, metric: "73% of attacks" },
        { name: "Urgency & Intimidation", desc: "Creating a false crisis (e.g. 'Account suspended') to force immediate action without verification.", icon: AlertCircle, metric: "Used in 85%" },
        { name: "Sender Spoofing", desc: "Forging the 'From' address to make the email appear internal or from a known trusted source.", icon: Eye, metric: "High Success" },
      ],
      examples: [
        { 
          type: "Mass Credential Harvesting", 
          content: "From: security@paypal-update-secure.net\nSubject: URGENT: Your account has been limited\n\nDear Customer, your PayPal account has been limited due to suspicious activity. Please click here to verify your identity immediately or your funds will be locked: [http://secure-paypal-update.net/login]", 
          indicators: ["Fake sender domain", "Urgency/Threat", "Generic greeting ('Dear Customer')"] 
        },
        { 
          type: "Spear Phishing", 
          content: "From: CEO_Name@company-external.com\nSubject: Urgent Wire Transfer\n\nHi [Target Name],\nI am currently in a meeting and cannot be reached. I need you to urgently process a wire transfer of $45,000 to a new vendor. Please reply ASAP for the account details.", 
          indicators: ["Targeted personalization", "Bypassing standard procedures", "High-stress executive request"] 
        }
      ]
    },
    socialEngineering: {
      id: "socialEngineering",
      title: "Social Engineering",
      icon: MessageSquareWarning,
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-400",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      hoverBorder: "hover:border-orange-500/40",
      description: "The psychological manipulation of people into performing actions or divulging confidential information. Exploits human psychology rather than software vulnerabilities.",
      tactics: [
        { name: "Pretexting", desc: "Creating a highly detailed fabricated scenario to engage the victim and build a false sense of trust.", icon: MessageSquareWarning, metric: "Primary Tactic" },
        { name: "Baiting", desc: "Enticing the victim with a false promise (e.g. free software) to trick them into compromising their security.", icon: AlertCircle, metric: "Evolves rapidly" },
        { name: "Authority Exploitation", desc: "Impersonating IT support, law enforcement, or executives to demand immediate compliance.", icon: Shield, metric: "Very High Risk" },
      ],
      examples: [
        { 
          type: "Vishing (Voice Phishing)", 
          content: "Caller ID: IT Helpdesk\n\n'Hello, this is Michael from corporate IT. We are updating the VPN client and several users are locked out. I need to briefly remote into your machine to update your registry. Please go to [URL] and read me the access code.'", 
          indicators: ["Unsolicited IT contact", "Request for remote access", "Exploiting authority"] 
        },
        { 
          type: "Physical Tailgating", 
          content: "An individual dressed as a delivery driver with a large box approaches the secure office door just as an employee is entering, saying: 'Hey, could you hold the door for me? My hands are full.'", 
          indicators: ["Bypassing badge access", "Exploiting human politeness", "Unverified identity"] 
        }
      ]
    },
    malware: {
      id: "malware",
      title: "Malware",
      icon: Bug,
      color: "from-yellow-400 to-lime-500",
      textColor: "text-yellow-400",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      hoverBorder: "hover:border-yellow-500/40",
      description: "Malicious software intentionally designed to cause damage to a computer, server, client, or computer network, or to leak private information.",
      tactics: [
        { name: "Malicious Macros", desc: "Hiding executable payloads inside MS Office documents (Word, Excel) that run when 'Enable Content' is clicked.", icon: FileKey, metric: "Widespread" },
        { name: "Drive-by Downloads", desc: "Exploiting browser vulnerabilities to automatically install malware when visiting an infected, legitimate site.", icon: Activity, metric: "Silent Attack" },
        { name: "Trojan Horses", desc: "Disguising destructive software as legitimate, useful applications the victim willingly installs.", icon: Shield, metric: "Deceptive" },
      ],
      examples: [
        { 
          type: "Ransomware Payload", 
          content: "Email Attachment: Overdue_Invoice_FY24.pdf.exe\n\n(Upon execution, the malware silently encrypts all files on the user's hard drive and network shares, leaving a 'READ_ME.txt' demanding Bitcoin payment for the decryption key.)", 
          indicators: ["Double extensions (.pdf.exe)", "Unexpected financial document", "Encrypts local files"] 
        },
        { 
          type: "Info-Stealer Trojan", 
          content: "A user downloads a 'free' version of a premium productivity software from an unofficial forum. While the software appears to work, it contains a background service that silently records all keystrokes and extracts saved browser passwords.", 
          indicators: ["Pirated software source", "Unexplained system sluggishness", "Unauthorized logins detected later"] 
        }
      ]
    }
  };

  const currentData = database[activeTab as keyof typeof database];
  const CurrentIcon = currentData.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center gap-3">
            <Database className="text-emerald-400" size={32} />
            Threat Intelligence Database
          </h2>
          <p className="text-neutral-400 mt-2 text-lg max-w-2xl">
            A curated repository of modern threat vectors. Study the characteristics to enhance your detection capabilities.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4">
        {Object.values(database).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 border backdrop-blur-md ${
                isActive 
                  ? `${tab.bgColor} ${tab.borderColor} shadow-lg scale-105 transform` 
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:scale-105"
              }`}
            >
              <Icon size={20} className={isActive ? tab.iconColor : ""} />
              <span className={isActive ? "text-white" : ""}>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className={`mt-8 bg-neutral-900/50 border ${currentData.borderColor} rounded-2xl p-8 backdrop-blur transition-all duration-500 overflow-hidden relative`}>
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${currentData.color} opacity-[0.03] blur-3xl pointer-events-none rounded-full transform translate-x-32 -translate-y-32`} />
        
        <div className="flex items-start gap-6 relative z-10">
          <div className={`p-4 rounded-2xl ${currentData.bgColor} ${currentData.textColor} shadow-lg shrink-0`}>
            <CurrentIcon size={48} />
          </div>
          <div>
            <h3 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentData.color}`}>
              {currentData.title} Deep Dive
            </h3>
            <p className="text-neutral-300 mt-4 text-lg leading-relaxed max-w-4xl">
              {currentData.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 relative z-10">
          
          {/* Tactics Column */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-xl font-semibold text-neutral-100 flex items-center gap-2 mb-6">
              <Activity className={currentData.textColor} size={20} />
              Primary Tactics
            </h4>
            {currentData.tactics.map((tactic, i) => (
              <div key={i} className={`p-5 rounded-xl border border-neutral-800/80 bg-neutral-950/50 ${currentData.hoverBorder} transition-colors group`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${currentData.bgColor} ${currentData.textColor}`}>
                    <tactic.icon size={18} />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                    {tactic.metric}
                  </span>
                </div>
                <h5 className="font-bold text-neutral-200 mt-3 group-hover:text-white transition-colors">{tactic.name}</h5>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{tactic.desc}</p>
              </div>
            ))}
          </div>

          {/* Real World Examples Column */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xl font-semibold text-neutral-100 flex items-center gap-2 mb-6">
              <Eye className={currentData.textColor} size={20} />
              Real-World Showcases
            </h4>
            
            {currentData.examples.map((ex, idx) => (
              <div key={idx} className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/40 flex justify-between items-center">
                  <span className="font-bold text-neutral-300">{ex.type}</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                </div>
                <div className="p-6">
                  <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {ex.content}
                  </pre>
                </div>
                <div className={`px-6 py-4 border-t border-neutral-800 ${currentData.bgColor} bg-opacity-30`}>
                  <h6 className={`text-xs font-bold uppercase tracking-wider ${currentData.textColor} mb-3 flex items-center gap-2`}>
                    <AlertCircle size={14} /> Identified Indicators of Compromise (IOCs)
                  </h6>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ex.indicators.map((ind, i) => (
                      <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                        <ChevronRight className={`mt-0.5 shrink-0 ${currentData.textColor}`} size={16} />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
