import React from 'react';
import { Award, Moon, Dna, Trophy, Zap, ShieldCheck, Star, Activity, Clock, Sun, ChevronRight, ZapOff, Sparkles, Brain, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LongevityHub() {
  const sleepData = [
    { time: '22:00', stage: 1, name: 'Awake' },
    { time: '23:00', stage: 2, name: 'Light' },
    { time: '00:00', stage: 4, name: 'REM' },
    { time: '01:00', stage: 3, name: 'Deep' },
    { time: '02:00', stage: 3, name: 'Deep' },
    { time: '03:00', stage: 4, name: 'REM' },
    { time: '04:00', stage: 2, name: 'Light' },
    { time: '05:00', stage: 4, name: 'REM' },
    { time: '06:00', stage: 1, name: 'Awake' }
  ];

  const genomicMarkers = [
    { gene: "FOXO3", name: "Longevity Transcription", status: "Superior", variant: "CC (Protective)", impact: "Hyper-resilience to oxidative stress nodes." },
    { gene: "APOE", name: "Lipid Synthesizer", status: "Optimal", variant: "E3/E3 (Neutral)", impact: "Standard metabolic baseline; no neuro-decay risk." },
    { gene: "MTHFR", name: "Methylation Engine", status: "Warning", variant: "C677T (Reduced)", impact: "Methylation efficiency at 60%. Folate protocol required." }
  ];

  const circadianCycle = [
    { time: '08:00', action: 'Optical Excitation (Sunlight)', pulse: 'High Intensity' },
    { time: '13:00', action: 'Metabolic Peak (Main Fuel)', pulse: 'Medium Intensity' },
    { time: '17:00', action: 'Biological Output (High-Intensity Load)', pulse: 'Extreme Intensity' },
    { time: '21:00', action: 'Melatonin Synthesis (Lux Restriction)', pulse: 'Low Intensity' }
  ];

  return (
    <div className="space-y-16 pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Award className="w-6 h-6 text-blue-600" />
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Integrated Longevity Engine</p>
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Longevity Suite</h2>
        <p className="text-slate-500 max-w-2xl leading-relaxed font-bold text-lg">Advanced physiological temporal alignment. Merging genomic blueprints with circadian rhythm synchronization for peak biological lifespan optimization.</p>
      </header>

      {/* Top Banner: Longevity Index & Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 card p-10 bg-slate-900 text-white rounded-[3rem] border-none shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#2563eb10,transparent)]"></div>
            <div className="relative z-10 space-y-6 flex-1 text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Biological Dominance Ranking</span>
               </div>
               <h3 className="text-6xl font-black italic tracking-tighter leading-none">Vitality Level 42</h3>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Ranked in the top 3% of bio-optimized nodes globally.</p>
               <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                  {['14 Day Sleep Streak', '8 Day Protocol Perfect', 'HRV Peak'].map((s, i) => (
                     <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 shadow-xl">{s}</span>
                  ))}
               </div>
            </div>
            <div className="relative z-10 w-48 h-48 rounded-full border-4 border-blue-500/20 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xl shrink-0 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 leading-none">Longevity</p>
                  <p className="text-5xl font-black italic tracking-tighter leading-none">94%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Optimization</p>
               </div>
               {/* Visual Orbitals */}
               <div className="absolute inset-x-0 inset-y-0 border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-1 card p-10 bg-white border-2 border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center text-center space-y-6 shadow-xl shadow-slate-200/5 hover:-translate-y-2 transition-all group">
            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
               <Star className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-2">
               <h4 className="text-xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">Next Milestone</h4>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tier 5 Biological Node</p>
            </div>
            <Button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest leading-none active:scale-95 transition-all">View Bio-Quests</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Sleep Architecture */}
         <div className="card p-12 bg-white rounded-[4rem] border-slate-100 shadow-2xl shadow-slate-200/20 space-y-10">
            <div className="flex items-center justify-between">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none flex items-center gap-3">
                     <Moon className="w-6 h-6 text-blue-600" /> Sleep Architecture
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Polysomnographic Synthesis</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Recovery Score</p>
                  <p className="text-3xl font-black italic tracking-tighter text-slate-900 leading-none">88%</p>
               </div>
            </div>

            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData}>
                     <defs>
                        <linearGradient id="colorStage" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', padding: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                     />
                     <Area type="step" dataKey="stage" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorStage)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-4">
               {[
                  { label: 'Deep', val: '1h 42m', color: 'bg-blue-600' },
                  { label: 'REM', val: '2h 15m', color: 'bg-emerald-500' },
                  { label: 'Light', val: '4h 10m', color: 'bg-slate-300' },
                  { label: 'Latency', val: '8m', color: 'bg-orange-400' }
               ].map((s, i) => (
                  <div key={i} className="text-center p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{s.label}</p>
                     <p className="text-xs font-black text-slate-900 leading-none whitespace-nowrap">{s.val}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Circadian Rhythm */}
         <div className="card p-12 bg-white rounded-[4rem] border-slate-100 shadow-2xl shadow-slate-200/20 space-y-10 border-2 border-slate-50">
            <div className="space-y-2">
               <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-500" /> Circadian Protocol
               </h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Optical & Metabolic Temporal Windows</p>
            </div>

            <div className="space-y-4">
               {circadianCycle.map((c, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all cursor-pointer">
                     <span className="text-xl font-black text-slate-900 tracking-tighter italic leading-none w-16">{c.time}</span>
                     <div className="flex-1">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{c.action}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Intensity Directive: <span className="text-blue-600">{c.pulse}</span></p>
                     </div>
                     <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Genomic Blueprint Section */}
      <div className="card p-16 bg-slate-50 border-2 border-slate-100 rounded-[5rem] space-y-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-20 opacity-5">
            <Dna className="w-80 h-80" />
         </div>
         <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
               <Sparkles className="w-6 h-6 text-blue-600" />
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Integrated Genomic Mapping</p>
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Genomic Blueprint</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {genomicMarkers.map((g, i) => (
               <div key={i} className="card p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-xl shadow-slate-200/5 group hover:border-blue-300 transition-all">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-blue-600 transition-colors">
                        <Hash className="w-6 h-6" />
                     </div>
                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${g.status === 'Superior' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : g.status === 'Warning' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{g.status} Node</span>
                  </div>
                  <h4 className="text-xl font-black tracking-tighter text-slate-900 uppercase mb-1 leading-none">{g.gene}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{g.name}</p>
                  <div className="space-y-4">
                     <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2 italic">Identified Variant</p>
                        <p className="text-xs font-black text-slate-700 tracking-tight leading-none uppercase">{g.variant}</p>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight italic">{g.impact}</p>
                  </div>
               </div>
            ))}
         </div>

         <div className="flex items-center gap-6 p-8 bg-slate-900 rounded-[3rem] text-white relative z-10 shadow-2xl shadow-slate-900/40">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-blue-600/30">
               <Brain className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1">Advanced Interpretation</p>
               <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight italic">Our AI Synthesis engine identifies a high biological resilience to cellular oxidation. Recommendation: Maintain current autophagy protocol with emphasis on caloric restriction windows.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
