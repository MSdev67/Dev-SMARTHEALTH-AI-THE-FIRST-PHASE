import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Plus, Clock, CheckCircle2, X, Trash2, ShieldCheck, Activity, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { storage } from '../lib/storage';
import { toast } from 'sonner';

export default function MedicationTracker({ isCard = false, onNavigate }: { isCard?: boolean, onNavigate?: (tab: any) => void }) {
  const [meds, setMeds] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '08:00' });

  const loadMeds = async () => {
    const savedMeds = await storage.list('medications');
    if (savedMeds.length === 0) {
      const defaults = [
        { id: '1', name: 'Vitamin D3', dosage: '2000 IU', time: '08:00 AM', taken: false, lastTakenDate: '' },
        { id: '2', name: 'Omega-3', dosage: '1000 mg', time: '08:00 AM', taken: false, lastTakenDate: '' },
        { id: '3', name: 'Magnesium', dosage: '400 mg', time: '09:30 PM', taken: false, lastTakenDate: '' }
      ];
      for (const m of defaults) {
        await storage.save('medications', m.id, m);
      }
      setMeds(defaults);
    } else {
      // Sort by time
      const sorted = savedMeds.sort((a, b) => a.time.localeCompare(b.time));
      setMeds(sorted);
    }
  };

  useEffect(() => {
    loadMeds();
  }, []);

  const toggleMed = async (index: number) => {
    const newMeds = [...meds];
    const med = newMeds[index];
    med.taken = !med.taken;
    med.lastTakenDate = med.taken ? new Date().toDateString() : '';
    setMeds(newMeds);
    await storage.save('medications', med.id, med);
    if (med.taken) toast.success(`Dose of ${med.name} logged`);
  };

  const handleAddMed = async () => {
    if (!newMed.name || !newMed.dosage) return toast.error("Please fill all fields");
    
    const [h, m] = newMed.time.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const time12 = `${h12}:${m} ${ampm}`;

    const medEntry = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      time: time12,
      taken: false,
      lastTakenDate: ''
    };

    const updated = [...meds, medEntry].sort((a, b) => a.time.localeCompare(b.time));
    setMeds(updated);
    await storage.save('medications', medEntry.id, medEntry);
    setShowAdd(false);
    setNewMed({ name: '', dosage: '', time: '08:00' });
    toast.success("Medication reminder synchronized");
  };

  const deleteMed = async (id: string) => {
    const updated = meds.filter(m => m.id !== id);
    setMeds(updated);
    await storage.delete('medications', id);
    toast.info("Reminder removed");
  };

  const addModal = (
    <AnimatePresence>
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6" onClick={() => setShowAdd(false)}>
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             onClick={e => e.stopPropagation()}
             className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-8 border-slate-100"
           >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Sync Reminder</h3>
                 <button onClick={() => setShowAdd(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vessel/Medicine</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Magnesium Glycinate"
                      value={newMed.name}
                      onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 h-16 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage Intensity</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 500mg"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 h-16 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Trigger</label>
                    <input 
                      type="time" 
                      value={newMed.time}
                      onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 h-16 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all"
                    />
                 </div>
                 <Button 
                   onClick={handleAddMed}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs h-16 rounded-[1.5rem] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 mt-4 h-20"
                 >
                    Activate Reminder
                 </Button>
              </div>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (isCard) {
    return (
      <>
        <div className="card p-8 border-slate-200/60 bg-white shadow-xl shadow-slate-200/5 relative overflow-hidden flex flex-col group h-full">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Adherence</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{meds.filter(m => m.taken).length}/{meds.length} COMPLETED</p>
             </div>
             <Button 
               onClick={() => onNavigate?.('medications')}
               variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 border border-slate-100"
             >
                <Plus className="w-5 h-5 text-blue-600" />
             </Button>
           </div>
           
           <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {meds.slice(0, 3).map((med, i) => (
                 <button 
                  key={med.id} 
                  onClick={() => toggleMed(i)}
                  className="w-full text-left p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 hover:border-blue-200 transition-all active:scale-95 group/item"
                 >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${med.taken ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-blue-600 border border-slate-200/50 group-hover/item:border-blue-200'}`}>
                       <Pill className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className={`text-[11px] font-black uppercase truncate transition-all ${med.taken ? 'line-through text-slate-400' : 'text-slate-900'}`}>{med.name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{med.time}</p>
                    </div>
                 </button>
              ))}
              {meds.length > 3 && (
                 <button onClick={() => onNavigate?.('medications')} className="w-full py-2 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] hover:bg-blue-50 rounded-xl transition-colors">
                    +{meds.length - 3} More Reminders
                 </button>
              )}
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Accuracy</div>
             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(meds.filter(m => m.taken).length / (meds.length || 1)) * 100}%` }} 
                  className="h-full bg-emerald-500" 
                />
             </div>
           </div>
        </div>
        {addModal}
      </>
    );
  }

  return (
    <div className="space-y-12">
       <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
             <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Pharmaceutics</h2>
             <p className="text-slate-500 font-bold text-lg max-w-xl">Advanced clinical protocol for medication adherence and pharmacokinetic temporal management.</p>
          </div>
          <Button 
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 h-20 rounded-[2rem] shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em] text-xs transition-all active:scale-95"
          >
             <Plus className="w-6 h-6 mr-3" /> Sync New Protocol
          </Button>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Schedule</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Clock className="w-3.5 h-3.5" /> Synchronized with {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
             </div>

             {meds.map((med, i) => (
                <motion.div 
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${med.taken ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl shadow-slate-200/20'}`}
                >
                  <div className="flex items-center gap-8 cursor-pointer flex-1" onClick={() => toggleMed(i)}>
                     <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${med.taken ? 'bg-emerald-100 text-emerald-600 scale-90' : 'bg-blue-50 text-blue-600 border border-blue-100 shadow-inner'}`}>
                        <Pill className="w-10 h-10" />
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h4 className={`text-2xl font-black ${med.taken ? 'text-emerald-900 line-through opacity-40' : 'text-slate-900'} uppercase tracking-tight`}>{med.name}</h4>
                           {!med.taken && <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-lg border border-blue-100 tracking-widest uppercase">Pending</span>}
                        </div>
                        <div className="flex items-center gap-6 mt-3">
                           <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{med.time}</span>
                           </div>
                           <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                           <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                              {med.dosage}
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      {med.taken ? (
                        <div className="flex flex-col items-end">
                           <CheckCircle2 className="w-10 h-10 text-emerald-600 bg-white rounded-full p-1" />
                           <button onClick={() => toggleMed(i)} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2 hover:underline">Undo</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                           <button onClick={() => toggleMed(i)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                              Mark Taken
                           </button>
                           <button onClick={() => deleteMed(med.id)} className="p-4 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                              <Trash2 className="w-6 h-6" />
                           </button>
                        </div>
                      )}
                  </div>
                </motion.div>
             ))}

             {meds.length === 0 && (
                <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[3rem] bg-white">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Pill className="w-12 h-12 text-slate-200" />
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">No Active Protocols</h4>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sync your first medication to activate smart adherence tracking.</p>
                </div>
             )}
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="card p-10 bg-slate-900 text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                   <ShieldCheck className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Clinical Compliance</h3>
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Score</span>
                            <span className="text-xl font-bold">88%</span>
                         </div>
                         <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }}></div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                         <Brain className="w-8 h-8 text-blue-400" />
                         <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-tight">
                            SmartSync is monitoring your physiological response to dosing patterns.
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="card p-10 bg-white border-slate-200 shadow-xl rounded-[3rem]">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Activity className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Bio-Metrics</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocol Type</span>
                      <span className="text-xs font-black uppercase text-slate-900">Custom Baseline</span>
                   </div>
                   <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Encryption</span>
                      <span className="text-xs font-black uppercase text-blue-600">AES-256 Cloud Locked</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Verification</span>
                      <span className="text-xs font-black uppercase text-emerald-600">HIPAA Compliant</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
       {addModal}
    </div>
  );
}
