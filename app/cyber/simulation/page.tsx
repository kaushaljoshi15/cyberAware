"use client";

import { useState } from "react";
import { MailWarning, CheckCircle, XCircle } from "lucide-react";

export default function SimulationPage() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [result, setResult] = useState<"success" | "fail" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scenarios = [
    {
      id: "SCENARIO_1",
      title: "Urgent Password Reset",
      sender: "security@accounts-google.com",
      content: "Dear User, your account has been compromised. Please click the link below to verify your identity immediately or your account will be suspended in 24 hours.\n\n[http://accounts.google-security-update.com/login]",
      isPhishing: true,
      explanation: "The sender domain is 'accounts-google.com' (hyphen, not dot), creating urgency ('suspended in 24 hours'), and the link goes to 'google-security-update.com'."
    },
    {
      id: "SCENARIO_2",
      title: "Invoice #INV-4921",
      sender: "billing@yourcompany.com",
      content: "Hi Team,\n\nPlease find attached the invoice for the Q3 software licenses. Let me know if you have any questions.\n\nBest,\nFinance Dept",
      isPhishing: false,
      explanation: "No suspicious links, expected domain behavior, and no artificial urgency or threatening language."
    },
    {
      id: "SCENARIO_3",
      title: "IT Support - Action Required",
      sender: "it-support@yourc0mpany-portal.com",
      content: "Hello, we are updating the corporate VPN servers tonight. Please log in to the new portal to ensure your credentials are functioning post-migration.\n\n[http://yourc0mpany-portal.com/vpn-auth]",
      isPhishing: true,
      explanation: "The domain uses a zero instead of an 'o' in the domain name (yourc0mpany), a classic typosquatting technique."
    },
    {
      id: "SCENARIO_4",
      title: "New Annual Leave Policy FY27",
      sender: "hr@yourcompany.com",
      content: "Hi Everyone,\n\nPlease review the attached document outlining the changes to our PTO rollover policy effective next month. No immediate action is required.\n\nRegards,\nHuman Resources",
      isPhishing: false,
      explanation: "Standard internal communication. No urgent call to action, domain is correct, and it is purely informational."
    },
    {
      id: "SCENARIO_5",
      title: "Failed Delivery Attempt: Package #948210",
      sender: "no-reply@post-tracking-alerts.net",
      content: "Your package could not be delivered due to an unpaid customs fee of $2.99. Click here to pay the fee and reschedule delivery immediately.\n\n[http://post-tracking-alerts.net/fee-payment]",
      isPhishing: true,
      explanation: "Creates false urgency over a tiny fee, prompting immediate action, and uses a generic tracking domain instead of a known carrier."
    },
    {
      id: "SCENARIO_6",
      title: "Developer invited you to a repository",
      sender: "noreply@github.com",
      content: "Developer has invited you to collaborate on the 'core-infrastructure' repository.\n\nYou can accept or decline this invitation by logging into your GitHub account.",
      isPhishing: false,
      explanation: "This is a standard GitHub notification format sent from the correct 'github.com' domain without suspicious masked links."
    },
    {
      id: "SCENARIO_7",
      title: "FINAL NOTICE: Office 365 License Expired",
      sender: "admin@microsoft-office-billing.cc",
      content: "Your enterprise Office 365 licenses have expired. Your email and files will be deleted in 2 hours unless you renew your payment details here: [http://microsoft-office-billing.cc/renew]",
      isPhishing: true,
      explanation: "Extremely high artificial urgency ('deleted in 2 hours') and uses an unofficial '.cc' domain rather than official Microsoft billing endpoints."
    },
    {
      id: "SCENARIO_8",
      title: "Urgent Wire Transfer Request",
      sender: "ceo.name@gmail.com",
      content: "Are you at your desk? I'm tied up in a meeting and need you to urgently process a wire transfer to a new vendor. Please reply immediately and I will send the banking details.",
      isPhishing: true,
      explanation: "A classic Business Email Compromise (BEC) attempt. The 'CEO' is using a free Gmail address instead of a corporate email and is asking for bypassed financial procedures."
    },
    {
      id: "SCENARIO_9",
      title: "Scheduled Maintenance: Payroll System",
      sender: "sysadmin@yourcompany.com",
      content: "Notice: The payroll portal will be offline this Saturday from 2 AM to 4 AM for routine database maintenance. Please complete any timesheet approvals before then.",
      isPhishing: false,
      explanation: "Expected IT notification behavior. Uses the correct internal domain, gives advance notice, and does not demand credential entry."
    },
    {
      id: "SCENARIO_10",
      title: "New login to LinkedIn from unknown device",
      sender: "security@linkedin-alerts-mail.com",
      content: "We noticed a new login from Russia on your account. If this wasn't you, secure your account right now by resetting your password here: [http://linkedin-alerts-mail.com/secure]",
      isPhishing: true,
      explanation: "Plays on fear to solicit credentials. The sender domain 'linkedin-alerts-mail.com' is fake; real notifications come from an official 'linkedin.com' subdomain."
    }
  ];

  const handleDecision = async (userSaysPhishing: boolean) => {
    setIsSubmitting(true);
    const scenario = scenarios[currentScenario];
    const success = userSaysPhishing === scenario.isPhishing;
    
    try {
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
    setResult(null);
    setCurrentScenario((prev) => (prev + 1) % scenarios.length);
  };

  const scenario = scenarios[currentScenario];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
         <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
           Phishing Simulator
         </h2>
         <p className="text-neutral-400 mt-2">
           Enhance your awareness score by identifying which of the following scenarios are phishing attempts.
         </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-3 text-neutral-400">
            <span className="font-medium">Threat Scenario {currentScenario + 1}</span>
          </div>
          <p className="text-lg font-semibold text-neutral-200">{scenario.title}</p>
        </div>

        <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-800 font-mono text-sm mb-8">
           <p className="mb-4 text-neutral-500">From: <span className="text-neutral-300">{scenario.sender}</span></p>
           <div className="whitespace-pre-wrap text-neutral-300">
             {scenario.content}
           </div>
        </div>

        {result === null ? (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => handleDecision(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <MailWarning size={18} /> It's Phishing
            </button>
            <button
              onClick={() => handleDecision(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} /> Looks Safe
            </button>
          </div>
        ) : (
          <div className={`p-6 rounded-lg border ${
            result === "success" ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
          }`}>
             <div className="flex items-start gap-4">
               {result === "success" ? (
                 <CheckCircle className="text-green-500 mt-1" size={24} />
               ) : (
                 <XCircle className="text-red-500 mt-1" size={24} />
               )}
               <div>
                  <h3 className={`text-xl font-bold mb-1 ${result === "success" ? "text-green-400" : "text-red-400"}`}>
                    {result === "success" ? "Correct Analysis!" : "Oops, you missed it!"}
                  </h3>
                  <p className="text-neutral-300 text-sm mb-4">
                    {result === "success" 
                      ? "You correctly identified the nature of this threat." 
                      : "You were tricked by this scenario. Always stay vigilant."}
                  </p>
                  <div className="bg-neutral-900/50 p-4 rounded border border-neutral-800/50">
                    <h4 className="text-xs uppercase text-neutral-500 tracking-wider mb-2 font-bold">Explanation</h4>
                    <p className="text-neutral-300 text-sm">{scenario.explanation}</p>
                  </div>
                  <button
                    onClick={nextScenario}
                    className="mt-6 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-6 py-2 rounded-lg transition-colors"
                  >
                    Next Scenario
                  </button>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
