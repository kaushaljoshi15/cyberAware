"use client";

import { useRef } from "react";
import { Download, ShieldCheck, MailWarning, Bug, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function CyberDashboardClient({ initialScore, initialHistory }: { initialScore: number, initialHistory: any[] }) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      // Swapped out DOM photography for structural native PDF generation.
      // This permanently fixes the 'cssRules' CORS SecurityError.
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Professional Header
      pdf.setFontSize(22);
      pdf.setTextColor(16, 185, 129); // Emerald
      pdf.text("CyberAware Intelligence Report", 14, 20);
      
      // Metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      
      // Awareness Score
      pdf.setFontSize(14);
      pdf.setTextColor(40);
      pdf.text(`Overall User Awareness Score: ${initialScore} / 100`, 14, 40);
      
      // Breakdown Logic
      const safe = initialHistory.filter(h => h.classification === 'Safe').length;
      const phishing = initialHistory.filter(h => h.classification === 'Phishing').length;
      const malware = initialHistory.filter(h => h.classification === 'Malware').length;
      
      pdf.text("Historical Threat Statistics:", 14, 50);
      pdf.setFontSize(11);
      pdf.setTextColor(80);
      pdf.text(`• Safe Artifacts: ${safe}`, 14, 58);
      pdf.text(`• Phishing Attempts: ${phishing}`, 14, 64);
      pdf.text(`• Malware Vectors: ${malware}`, 14, 70);

      // Generate Tabular System report
      const tableColumn = ["Date", "Classification", "Type", "Severity", "Artifact Preview"];
      const tableRows: any[] = [];

      initialHistory.forEach(item => {
        const preview = (item.content || "").substring(0, 35) + ((item.content || "").length > 35 ? "..." : "");
        tableRows.push([
          new Date(item.created_at).toLocaleDateString(),
          item.classification,
          item.type.toUpperCase(),
          item.severity.toUpperCase(),
          preview
        ]);
      });

      autoTable(pdf, {
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      pdf.save("CyberAware-Systematic-Report.pdf");
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
    { name: 'Safe', value: breakdown['Safe'] || 0, color: '#22c55e' },         // green
  ].filter(d => d.value > 0);

  // If no data, provide a default empty chart state
  if (data.length === 0) {
    data.push({ name: 'No Data Yet', value: 1, color: '#3f3f46' });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            Awareness Overview
          </h2>
          <p className="text-neutral-400">Track your progress and recent threat encounters.</p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-md transition-all shadow-lg"
        >
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

      <div ref={dashboardRef} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
            <Activity className="text-emerald-500 mb-4" size={40} />
            <span className="text-5xl font-black text-neutral-100">{initialScore}</span>
            <span className="text-neutral-400 mt-2 font-medium tracking-wide uppercase text-sm">Awareness Score</span>
          </div>

          {/* Breakdown Chart */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl md:col-span-2 flex flex-col sm:flex-row items-center">
            <div className="flex-1 w-full" style={{ minWidth: 0, minHeight: 192 }}>
              <ResponsiveContainer width="100%" height={192}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#f5f5f5' }}
                    itemStyle={{ color: '#f5f5f5' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 text-center sm:text-left px-4">
               <h3 className="text-xl font-bold text-neutral-200 mb-2">Threat Encounter Breakdown</h3>
               <p className="text-neutral-400 text-sm">
                 The chart visualizes the distribution of threats you have successfully analyzed. Keep analyzing suspicious links and emails to keep this updated.
               </p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
            <h3 className="font-semibold text-neutral-200">Recent Analysis History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/30 text-sm h-12">
                  <th className="px-6 font-medium">Date</th>
                  <th className="px-6 font-medium">Type</th>
                  <th className="px-6 font-medium">Classification</th>
                  <th className="px-6 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {initialHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                      You haven't analyzed any threats yet. Try the Threat Analyzer!
                    </td>
                  </tr>
                ) : (
                  initialHistory.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-4 text-neutral-300">
                        {new Date(item.created_at).toISOString().split('T')[0]}
                      </td>
                      <td className="px-6 py-4 text-neutral-300 capitalize">
                        {item.type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.classification === 'Safe' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          item.classification === 'Phishing' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {item.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-300 capitalize">{item.severity}</td>
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
