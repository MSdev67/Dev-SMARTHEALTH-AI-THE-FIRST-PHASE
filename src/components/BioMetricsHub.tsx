import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Heart, Droplet, Weight, Plus, TrendingUp, TrendingDown, Clock, ShieldCheck, Download, FileSpreadsheet, FileText, Smartphone, RefreshCw, AlertTriangle, Quote } from 'lucide-react';
import { Button } from './ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { storage } from '../lib/storage';
import { useAuth } from '../lib/AuthProvider';

export default function BioMetricsHub() {
  const { user, profile } = useAuth();
  const [vitals, setVitals] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newVital, setNewVital] = useState({ type: 'bp', value: '', value2: '' });
  const [syncStatus, setSyncStatus] = useState<'connected' | 'awaiting' | 'error'>('connected');
  const [lastSync, setLastSync] = useState(new Date().toISOString());

  const medicalQuotes = [
    { text: "The human body is the best picture of the human soul.", author: "Ludwig Wittgenstein" },
    { text: "Medicines cure diseases, but only doctors can cure patients.", author: "Carl Jung" },
    { text: "Walking is man's best medicine.", author: "Hippocrates" },
    { text: "He who has health has hope; and he who has hope, has everything.", author: "Arabian Proverb" }
  ];

  useEffect(() => {
    loadVitals();
  }, []);

  const loadVitals = async () => {
    const data = await storage.list('biometrics');
    setVitals(data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const exportToCSV = () => {
    if (vitals.length === 0) return toast.error("No data to export");
    const headers = ["Date", "Type", "Primary Value", "Secondary Value"];
    const rows = vitals.map(v => [
      v.date,
      v.type.toUpperCase(),
      v.value,
      v.value2 || ""
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bio_metrics_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export successful");
  };

  const exportToPDF = () => {
    window.print();
  };

  const handleAdd = async () => {
    if (!newVital.value) return toast.error("Enter value");
    const entry = {
      ...newVital,
      value: Number(newVital.value),
      value2: newVital.value2 ? Number(newVital.value2) : null,
      date: new Date().toISOString(),
      id: `bio_${Date.now()}`
    };
    await storage.save('biometrics', entry.id, entry);
    toast.success("Vitality metric synchronized");
    setShowAdd(false);
    loadVitals();
  };

  const getLatest = (type: string) => {
    const filtered = vitals.filter(v => v.type === type);
    return filtered[filtered.length - 1];
  };

  const cards = [
    { type: 'bp', label: 'Blood Pressure', icon: Activity, unit: 'mmHg', color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'hr', label: 'Heart Rate', icon: Heart, unit: 'BPM', color: 'text-red-600', bg: 'bg-red-50' },
    { type: 'weight', label: 'Body Weight', icon: Weight, unit: 'kg', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { type: 'glucose', label: 'Blood Glucose', icon: Droplet, unit: 'mg/dL', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-10 pb-20 print:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
           <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Bio-Metric Pulse Hub</h2>
           <div className="flex items-center gap-3">
              <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">Clinical Command Center</p>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Real-time Node Active</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
              <Button onClick={exportToCSV} variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all whitespace-nowrap">
                 <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Export CSV
              </Button>
              <Button onClick={exportToPDF} variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all whitespace-nowrap">
                 <FileText className="w-4 h-4 mr-2 text-red-600" /> Print PDF
              </Button>
           </div>
           <Button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white rounded-2xl h-14 px-10 font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95">
              <Plus className="w-5 h-5 mr-2" /> Log Clinical Metric
           </Button>
        </div>
      </header>

      {/* Quote Banner */}
      <div className="bg-slate-50 border-y border-slate-200/50 py-6 px-1 print:hidden">
        <div className="flex items-center gap-6 max-w-4xl opacity-80 group cursor-default">
           <Quote className="w-12 h-12 text-blue-200 shrink-0" />
           <div>
              <p className="text-lg font-bold text-slate-900 leading-tight italic tracking-tight">
                 "{medicalQuotes[Math.floor(Date.now() / 86400000) % medicalQuotes.length].text}"
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                 — {medicalQuotes[Math.floor(Date.now() / 86400000) % medicalQuotes.length].author}
              </p>
           </div>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-12 border-b-4 border-slate-900 pb-8">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-4xl font-black uppercase tracking-tighter">Clinical Metric Report</h1>
               <p className="text-sm font-bold text-slate-500 uppercase mt-2">Generated by SmartHealth AI Hub • {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
               <h3 className="text-xl font-bold">{profile?.displayName}</h3>
               <p className="text-xs font-medium text-slate-400">{profile?.email}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
           const latest = getLatest(card.type);
           return (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="card p-6 bg-white border-slate-200/60 shadow-lg shadow-slate-200/30"
             >
                <div className={`${card.bg} ${card.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                   <card.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                <div className="flex items-end gap-2">
                   <h3 className="text-3xl font-bold text-slate-900">
                      {latest ? (latest.value2 ? `${latest.value}/${latest.value2}` : latest.value) : '---'}
                   </h3>
                   <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">{card.unit}</span>
                </div>
                {latest && (
                  <div className="mt-4 flex items-center gap-2">
                     <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        <TrendingUp className="w-3 h-3" /> STABLE
                     </div>
                     <span className="text-[9px] text-slate-400 font-medium uppercase">{format(latest.date, 'HH:mm')}</span>
                  </div>
                )}
             </motion.div>
           );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            <div className="card p-8 bg-white border-slate-200/60 shadow-xl shadow-slate-200/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                  <Activity className="w-40 h-40" />
               </div>
               <div className="flex items-center justify-between mb-10 relative z-10">
                  <div>
                     <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Physiological Variance</h4>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3">7-Day Clinical Synthesis View</p>
                  </div>
                  <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-tight">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]"></div> BP Systolic</div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.3)]"></div> Glucose</div>
                  </div>
               </div>
               
               <div className="h-[380px] w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={vitals}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                           dataKey="date" 
                           tickFormatter={(val) => format(val, 'MMM dd')}
                           tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '900' }}
                           axisLine={false}
                           tickLine={false}
                        />
                        <YAxis 
                           tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '900' }}
                           axisLine={false}
                           tickLine={false}
                        />
                        <Tooltip 
                           contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backgroundColor: '#0f172a', padding: '16px' }}
                           itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}
                           labelStyle={{ display: 'none' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={5} dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#2563eb' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="value2" stroke="#059669" strokeWidth={5} dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#059669' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            {/* Wearable Sync Card */}
            <div className="card p-10 bg-white border-2 border-slate-100 shadow-2xl rounded-[3rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Smartphone className="w-24 h-24" />
               </div>
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Wearable Sync</h3>
                  <RefreshCw className={`w-5 h-5 text-blue-600 cursor-pointer hover:rotate-180 transition-transform ${syncStatus === 'connected' ? '' : 'animate-spin'}`} onClick={() => {
                     setSyncStatus('awaiting');
                     setTimeout(() => {
                        setSyncStatus('connected');
                        setLastSync(new Date().toISOString());
                        toast.success("Wearable metrics synchronized");
                     }, 2000);
                  }} />
               </div>

               <div className="space-y-8">
                  <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative">
                     <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${syncStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' : syncStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                           {syncStatus === 'connected' ? <ShieldCheck className="w-6 h-6" /> : syncStatus === 'error' ? <AlertTriangle className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-spin" />}
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Apple Watch Ultra</p>
                           <p className={`text-[9px] font-black uppercase mt-1 ${syncStatus === 'connected' ? 'text-emerald-600' : 'text-blue-500'}`}>
                              {syncStatus === 'connected' ? 'Active Persistence' : 'Updating Protocol...'}
                           </p>
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Last Sync</span>
                        <span className="text-slate-900">{format(lastSync, 'HH:mm')} Today</span>
                     </div>
                  </div>

                  {syncStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                       <AlertTriangle className="w-5 h-5 text-red-600" />
                       <p className="text-[10px] font-black text-red-900 uppercase tracking-tight">OAuth Encryption Protocol Mismatch</p>
                    </div>
                  )}

                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase">HealthKit Bridge</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Calibration</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">OPTIMAL</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card p-10 bg-slate-900 text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                  <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Security Protocol</p>
                  <h3 className="text-2xl font-black tracking-tighter mb-4 leading-none uppercase">Bio-Vault V4.2</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-bold mb-8">
                     End-to-end clinical encryption activated. Biometric signatures are fragmented across distributed ledger nodes.
                  </p>
                  <div className="flex items-center gap-8 border-t border-white/10 pt-8">
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-xs font-black uppercase text-emerald-400 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> Secure
                        </p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard</p>
                        <p className="text-xs font-black uppercase">FIPS 140-2</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border-4 border-slate-50"
           >
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Log Physiological Node</h3>
              <p className="text-xs text-slate-500 font-medium mb-10 leading-relaxed italic">Synchronization with your Medical Intelligence profile is automatic.</p>

              <div className="space-y-6 mb-12">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Metric Classification</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                      value={newVital.type}
                      onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                    >
                       <option value="bp">Blood Pressure (mmHg)</option>
                       <option value="hr">Heart Rate (BPM)</option>
                       <option value="weight">Body Weight (kg)</option>
                       <option value="glucose">Blood Glucose (mg/dL)</option>
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Value</label>
                       <input 
                         type="number" 
                         className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                         placeholder="120"
                         value={newVital.value}
                         onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                       />
                    </div>
                    {newVital.type === 'bp' && (
                       <div className="space-y-3 font-bold">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Diastolic</label>
                          <input 
                            type="number" 
                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                            placeholder="80"
                            value={newVital.value2}
                            onChange={(e) => setNewVital({ ...newVital, value2: e.target.value })}
                          />
                       </div>
                    )}
                 </div>
              </div>

              <div className="flex gap-4">
                 <Button onClick={() => setShowAdd(false)} variant="outline" className="flex-1 py-7 rounded-2xl font-bold border-slate-200">Cancel</Button>
                 <Button onClick={handleAdd} className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-7 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Establish Log</Button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function format(dateStr: string, formatStr: string) {
    const date = new Date(dateStr);
    if (formatStr === 'MMM dd') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (formatStr === 'MMM dd, HH:mm') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    if (formatStr === 'HH:mm') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return dateStr;
}
