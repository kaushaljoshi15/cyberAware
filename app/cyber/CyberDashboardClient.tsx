"use client";

import { useRef } from "react";
import { Download, ShieldCheck, MailWarning, Bug, Activity, ShieldAlert, Zap, Users } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// 3D Radar Animation Component
const Radar3D = () => (
  <div className="relative w-40 h-40 flex items-center justify-center perspective-[800px]">
    {/* Base Grid */}
    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center transform preserve-3d rotate-x-[60deg] animate-[pulse_4s_ease-in-out_infinite]">
       {/* Rings */}
       <div className="absolute w-[80%] h-[80%] rounded-full border border-emerald-500/40" />
       <div className="absolute w-[60%] h-[60%] rounded-full border border-emerald-500/50" />
       <div className="absolute w-[40%] h-[40%] rounded-full border border-emerald-500/60" />
       {/* Scanner line */}
       <div className="absolute left-1/2 top-1/2 w-1/2 h-0.5 bg-emerald-400 origin-[0%_50%] animate-[spin_3s_linear_infinite] shadow-[0_0_15px_#34d399,0_0_30px_#34d399]" />
       {/* Scanning overlay gradient */}
       <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite] opacity-40 mix-blend-screen" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.6) 60deg, transparent 60deg)' }} />
    </div>
    
    {/* Center Element floating above */}
    <div className="relative z-10 translate-y-[-10px] animate-[bounce_4s_ease-in-out_infinite]">
      <div className="bg-emerald-950/90 p-3 rounded-xl border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-md">
        <ShieldCheck size={28} className="text-emerald-400" />
      </div>
    </div>
  </div>
);

export default function CyberDashboardClient({ initialScore, initialHistory }: { initialScore: number, initialHistory: any[] }) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      
      const pdf = new jsPDF("p", "mm", "a4");
      const userIdent = initialHistory.length > 0 ? initialHistory[0].user_email : "Active System User";
      
      // Helper to draw the complex dark mode UI background
      const drawDarkBackground = () => {
        pdf.setFillColor(10, 15, 20); // Hex #0A0F14
        pdf.rect(0, 0, 210, 297, "F");
        pdf.setDrawColor(20, 30, 40); // Hex #141E28
        pdf.setLineWidth(0.2);
        for(let i = 0; i < 300; i += 10) { pdf.line(0, i, 210, i); }
        for(let j = 0; j < 210; j += 10) { pdf.line(j, 0, j, 297); }
      };

      // Draw background manually for the first page
      drawDarkBackground();

      // Override addPage to automatically fill the background on new pages created by autoTable
      const originalAddPage = pdf.addPage.bind(pdf);
      (pdf as any).addPage = function(...args: any[]) {
        originalAddPage(...args);
        drawDarkBackground();
        return pdf;
      };
      
      // Executive Header
      pdf.setFontSize(28);
      pdf.setTextColor(52, 211, 153); // Emerald 400
      pdf.setFont("helvetica", "bold");
      pdf.text("CYBERAWARE THREAT INTEL", 14, 25);
      
      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184); // Slate 400
      pdf.setFont("helvetica", "normal");
      pdf.text("CLASSIFIED INCIDENT DOSSIER / GLOBAL SCAN", 14, 32);

      // Meta Box
      pdf.setDrawColor(52, 211, 153);
      pdf.setLineWidth(0.5);
      pdf.setFillColor(15, 23, 42); // slate 900
      pdf.rect(14, 40, 182, 35, "FD"); // Fill and Draw

      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont("courier", "bold");
      pdf.text("> TARGET IDENTIFIER:", 18, 48);
      pdf.text("> AUDIT TIMESTAMP  :", 18, 56);
      pdf.text("> SECURITY GRADE   :", 18, 64);
      
      pdf.setFont("courier", "normal");
      pdf.setTextColor(248, 250, 252);
      pdf.text(String(userIdent), 65, 48);
      pdf.text(new Date().toLocaleString(), 65, 56);
      
      // Score marking
      if (initialScore >= 80) pdf.setTextColor(52, 211, 153);
      else if (initialScore >= 50) pdf.setTextColor(250, 204, 21);
      else pdf.setTextColor(248, 113, 113);
      
      pdf.setFont("courier", "bold");
      pdf.text(`[ ${initialScore} / 100 POINTS ]`, 65, 64);

      // Breakdown Logic
      const total = initialHistory.length;
      const safe = initialHistory.filter(h => h.classification === 'Safe').length;
      const phishing = initialHistory.filter(h => h.classification === 'Phishing').length;
      const malware = initialHistory.filter(h => h.classification === 'Malware').length;
      const socialEng = initialHistory.filter(h => h.classification === 'Social Engineering').length;
      const highSev = initialHistory.filter(h => h.severity === 'High').length;
      
      pdf.setTextColor(248, 250, 252);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("THREAT VECTOR ANALYSIS", 14, 86);
      
      pdf.setDrawColor(52, 211, 153);
      pdf.line(14, 88, 75, 88); // Decorative line
      
      pdf.setFontSize(10);
      pdf.setFont("courier", "normal");
      pdf.setTextColor(148, 163, 184);
      pdf.text(`System telemetry processed ${total} localized payloads.`, 14, 95);
      
      pdf.setTextColor(52, 211, 153);
      pdf.text(`[OK]  Validated Safe Artifacts:  ${String(safe).padStart(3, '0')}`, 14, 103);
      pdf.setTextColor(250, 204, 21);
      pdf.text(`[WRN] Phishing / Social Eng Blocked: ${String(phishing + socialEng).padStart(3, '0')}`, 14, 109);
      pdf.setTextColor(248, 113, 113);
      pdf.text(`[ERR] Intercepted Malware Vectors: ${String(malware).padStart(3, '0')}`, 14, 115);
      pdf.text(`[CRIT] Critical Severities Triaged: ${String(highSev).padStart(3, '0')}`, 14, 121);

      // Generate Tabular System report
      const tableColumn = ["TIME (UTC)", "VECTOR", "CLASS", "RISK", "FINGERPRINT"];
      const tableRows: any[] = [];

      initialHistory.slice(0, 50).forEach(item => {
        const cleanContent = String(item.content || "").replace(/[\r\n]+/g, ' ');
        const preview = cleanContent.substring(0, 45) + (cleanContent.length > 45 ? "..." : "");
        const d = new Date(item.created_at);
        const dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        tableRows.push([
          dateStr,
          String(item.type).toUpperCase(),
          item.classification,
          String(item.severity).toUpperCase(),
          preview
        ]);
      });

      autoTable(pdf, {
        startY: 130,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [52, 211, 153], halign: 'left', font: 'courier' },
        bodyStyles: { fillColor: [10, 15, 20], textColor: [203, 213, 225], font: 'courier' },
        alternateRowStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8, cellPadding: 4, lineColor: [30, 41, 59], lineWidth: 0.1 },
        columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 16 },
            2: { cellWidth: 28 },
            3: { cellWidth: 16 },
            4: { cellWidth: 'auto' }
        },
        didParseCell: function(data: any) {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'HIGH') {
                    data.cell.styles.textColor = [239, 68, 68]; // Hex #EF4444 (red-500)
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
      });

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont("courier", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(52, 211, 153);
        pdf.text(`CYBERAWARE INTELLIGENCE ENGINE • TERMINAL PAGE ${i} OF ${pageCount}`, 14, 285);
      }

      pdf.save("CyberAware_Threat_Dossier_Classified.pdf");
    } catch (error) {
      console.error("PDF Export failed", error);
    }
  };

  // Compute breakdown for Pie Chart
  const breakdown = initialHistory.reduce((acc: any, log: any) => {
    const cls = log.classification || 'Safe';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Phishing', value: breakdown['Phishing'] || 0, color: '#ef4444' }, // red
    { name: 'Malware', value: breakdown['Malware'] || 0, color: '#eab308' },   // yellow
    { name: 'Social Eng', value: breakdown['Social Engineering'] || 0, color: '#f97316' }, // orange
    { name: 'Safe', value: breakdown['Safe'] || 0, color: '#10b981' },         // emerald
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    data.push({ name: 'No Data Yet', value: 1, color: '#3f3f46' });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto perspective-[2000px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tight flex items-center gap-3">
             <Zap size={28} className="text-emerald-400" /> Awareness Overview
          </h2>
          <p className="text-neutral-400 font-mono text-sm mt-1 uppercase tracking-widest">Global Scan Analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/cyber/community"
            className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-blue-500/50 text-blue-400 px-5 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-0.5"
          >
            <Users size={18} />
            <span className="font-bold tracking-wide hidden sm:inline">Global Network</span>
          </Link>
          <button
            onClick={exportPDF}
            className="flex items-center space-x-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-400 px-5 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
          >
            <Download size={18} />
            <span className="font-bold tracking-wide hidden sm:inline">Export Dossier</span>
          </button>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Radar Animation Box */}
          <div className="group bg-neutral-900/80 backdrop-blur border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-700 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:scale-[1.02] hover:-rotate-y-2 hover:rotate-x-2 transform-style-3d">
             <Radar3D />
             <div className="mt-8 text-center relative z-10 translate-transform duration-500 group-hover:translate-z-10">
               <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">System Online</span>
               <p className="text-xs text-neutral-500 mt-1 font-mono">Monitoring Threat Vectors...</p>
             </div>
          </div>

          {/* Score Card */}
          <div className="group bg-neutral-900/80 backdrop-blur border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:scale-[1.02] hover:rotate-y-2 hover:-rotate-x-2 transform-style-3d">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
            <Activity className="text-blue-500 mb-4 transition-transform duration-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" size={40} />
            <span className="text-6xl font-black text-neutral-100 transition-transform duration-500 group-hover:translate-z-12">{initialScore}</span>
            <span className="text-neutral-400 mt-3 font-bold tracking-widest uppercase text-sm">Awareness Score</span>
          </div>

          {/* Breakdown Chart */}
          <div className="group bg-neutral-900/80 backdrop-blur border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-700 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] hover:scale-[1.02] hover:-rotate-y-2 hover:-rotate-x-2 transform-style-3d">
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#f5f5f5', borderRadius: '8px' }}
                    itemStyle={{ color: '#f5f5f5', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 transition-transform duration-500 group-hover:translate-z-10">
               <h3 className="text-sm font-bold text-neutral-200 tracking-wider uppercase">Encounter Spread</h3>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl overflow-hidden mt-8 shadow-xl">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center gap-3">
             <ShieldAlert size={18} className="text-neutral-400" />
            <h3 className="font-bold text-neutral-200 tracking-wide uppercase text-sm">Incident Telemetry Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 bg-neutral-900/30 text-xs font-mono h-12 uppercase tracking-widest">
                  <th className="px-6 font-medium">Timestamp</th>
                  <th className="px-6 font-medium">Vector</th>
                  <th className="px-6 font-medium">Classification</th>
                  <th className="px-6 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {initialHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 font-mono">
                       {"> NO TELEMETRY DATA ACQUIRED <"}
                    </td>
                  </tr>
                ) : (
                  initialHistory.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors">
                      <td className="px-6 py-4 text-neutral-400 font-mono text-xs">
                        {new Date(item.created_at).toISOString().split('T')[0]} <span className="text-neutral-600">{new Date(item.created_at).toISOString().split('T')[1].split('.')[0]}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-300 font-bold uppercase text-xs tracking-wider">
                        {item.type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider ${
                          item.classification === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                          item.classification === 'Phishing' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                          item.classification === 'Social Engineering' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {item.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black uppercase text-xs tracking-widest ${
                          item.severity === 'High' ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
                          item.severity === 'Medium' ? 'text-yellow-500' :
                          'text-emerald-500'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
