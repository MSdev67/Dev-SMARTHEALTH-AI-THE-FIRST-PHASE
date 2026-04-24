import React, { useState } from 'react';
import { Microscope, FlaskConical, TestTube, FileText, ChevronRight, AlertCircle, CheckCircle2, Search, Filter, Hash, ShieldCheck, Zap, Download, Eye, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

export default function LabVault() {
  const [activeView, setActiveView] = useState<'blood' | 'radiology'>('blood');

  const bloodMarkers = [
    { category: "Aging & Metabolic", markers: [
      { name: "HbA1c", value: "5.1", range: "4.8 - 5.4", status: "Optimal", unit: "%", trend: "stable" },
      { name: "hs-CRP", value: "0.4", range: "0.0 - 1.0", status: "Optimal", unit: "mg/L", trend: "down" },
      { name: "Insulin (Fasting)", value: "4.2", range: "2.0 - 6.0", status: "Optimal", unit: "uIU/mL", trend: "stable" }
    ]},
    { category: "Lipidity & Omega", markers: [
      { name: "ApoB", value: "62", range: "40 - 80", status: "Optimal", unit: "mg/dL", trend: "up" },
      { name: "Lp(a)", value: "12", range: "< 30", status: "Optimal", unit: "mg/dL", trend: "stable" },
      { name: "Omega-3 Index", value: "9.2", range: "> 8.0", status: "Superior", unit: "%", trend: "up" }
    ]},
    { category: "Nutritional Synthesis", markers: [
      { name: "Vitamin D", value: "68", range: "50 - 80", status: "Optimal", unit: "ng/mL", trend: "stable" },
      { name: "Magnesium (RBC)", value: "6.4", range: "6.0 - 6.5", status: "Optimal", unit: "mg/dL", trend: "down" },
      { name: "B12", value: "840", range: "600 - 900", status: "Superior", unit: "pg/mL", trend: "stable" }
    ]}
  ];

  const radiologyReports = [
    { title: "Chest Morphology Scan", date: "24 Apr 2024", type: "MRI", findings: "Normal biological symmetry. No active inflammatory nodes detected.", interpretation: "Standard health baseline maintained.", status: "Verified" },
    { title: "Abdominal Synthesis", date: "12 Feb 2024", type: "CT", findings: "Minimal visceral adiposity. Optimal cardiac clearance.", interpretation: "Superior physiological integrity.", status: "Verified" }
  ];

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <FlaskConical className="w-6 h-6 text-blue-600" />
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Integrated Biosynthesis Vault</p>
           </div>
           <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Laboratory Vault</h2>
           <p className="text-slate-500 max-w-2xl leading-relaxed font-bold text-lg">Central hub for clinical laboratory synthesis. Synchronizing blood biomarkers and radiology morphology for unified diagnostic intelligence.</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[1.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20">
           {['blood', 'radiology'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === view ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                 {view} synthesis
              </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Quick Stats Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="card p-8 bg-blue-600 text-white rounded-[2.5rem] border-none shadow-2xl shadow-blue-600/30">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5" /> Synthesis Status
              </h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center py-4 border-b border-white/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Markers in Optima</span>
                    <span className="text-2xl font-black italic">24/24</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b border-white/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Last Lab Depth</span>
                    <span className="text-lg font-black italic">14 Days Ago</span>
                 </div>
                 <div className="flex justify-between items-center py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Vault Encryption</span>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Active (FIPS)</span>
                 </div>
              </div>
              <Button variant="ghost" className="w-full mt-8 border border-white/20 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest h-12 rounded-xl">
                 Update Bio-Record
              </Button>
           </div>

           <div className="card p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center gap-3 leading-none">
                 <Zap className="w-4 h-4 text-orange-400" /> Bio-Insights
              </h3>
              <div className="space-y-4">
                 <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase tracking-tight">Your ApoB/Lp(a) ratio is in the top 5% of biological excellence. Cardiovascular risk node: <span className="text-emerald-600">Minimum</span>.</p>
              </div>
           </div>
        </div>

        {/* Lab Content */}
        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
              {activeView === 'blood' ? (
                 <motion.div 
                   key="blood-view"
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.02 }}
                   className="space-y-12"
                 >
                    {bloodMarkers.map((group, i) => (
                       <div key={i} className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">{group.category}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {group.markers.map((marker, j) => (
                                <div key={j} className="card p-8 bg-white border-2 border-slate-50 hover:border-blue-200 transition-all group rounded-[2.5rem] cursor-pointer">
                                   <div className="flex justify-between items-start mb-6">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{marker.name}</span>
                                      <div className={`w-2 h-2 rounded-full ${marker.status === 'Optimal' || marker.status === 'Superior' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-orange-400'}`}></div>
                                   </div>
                                   <div className="flex items-baseline gap-2 mb-4">
                                      <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">{marker.value}</span>
                                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{marker.unit}</span>
                                   </div>
                                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                      <div className="space-y-1">
                                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Longevity Range</p>
                                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{marker.range}</p>
                                      </div>
                                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{marker.status}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    ))}
                 </motion.div>
              ) : (
                 <motion.div 
                   key="radiology-view"
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.02 }}
                   className="space-y-8"
                 >
                    {radiologyReports.map((report, i) => (
                       <div key={i} className="card p-12 bg-white border-2 border-slate-50 hover:border-blue-100 transition-all rounded-[3rem] shadow-xl shadow-slate-200/5 group">
                          <div className="flex flex-col md:flex-row justify-between gap-10">
                             <div className="space-y-8 flex-1">
                                <div className="flex items-center gap-4">
                                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                                      <FileText className="w-8 h-8 text-blue-600" />
                                   </div>
                                   <div>
                                      <h4 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none mb-2">{report.title}</h4>
                                      <div className="flex gap-4">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.type} Protocol</span>
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{report.date}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                   <div className="flex items-center gap-3 mb-4">
                                      <Microscope className="w-4 h-4 text-slate-400" />
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Synthesis Report</span>
                                   </div>
                                   <p className="text-sm font-bold text-slate-700 leading-relaxed italic uppercase tracking-tight">{report.findings}</p>
                                </div>
                             </div>
                             <div className="w-px bg-slate-100 hidden md:block"></div>
                             <div className="md:w-72 flex flex-col justify-between py-2">
                                <div className="space-y-4">
                                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 inline-block shadow-inner">{report.interpretation}</span>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Security Stamped & Verified</p>
                                </div>
                                <div className="flex gap-3 mt-8">
                                   <Button className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-black/10 active:scale-95">Open Image</Button>
                                   <Button variant="outline" className="w-14 h-14 border-2 border-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-50"><Download className="w-5 h-5 text-slate-400" /></Button>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                    
                    <div className="p-16 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 flex flex-col items-center justify-center text-center">
                       <TestTube className="w-16 h-16 text-slate-200 mb-6" />
                       <h5 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-2">Awaiting External Results</h5>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] max-w-[300px] leading-relaxed">Integrated clinical nodes will automatically populate synchronization when laboratory data is released.</p>
                       <Button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/20 active:scale-95">Manual Optical Sync</Button>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
