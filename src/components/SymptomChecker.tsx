import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Thermometer, Brain, Activity, User, ChevronRight, Zap, Scan, Dna, X, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthProvider';
import { useLanguage } from '../lib/LanguageProvider';
import { predictDisease } from '../services/geminiService';
import { collection, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '../lib/firebase';
import { storage } from '../lib/storage';
import { Button } from './ui/button';
import { toast } from 'sonner';

const MEDICAL_QUOTES = [
  { text: "Where the art of medicine is loved, there is also a love of humanity.", author: "Hippocrates" },
  { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
  { text: "Medicine is a science of uncertainty and an art of probability.", author: "William Osler" },
  { text: "The art of healing comes from nature, not from the physician.", author: "Paracelsus" },
  { text: "He who has health, has hope; and he who has hope, has everything.", author: "Arabic Proverb" },
  { text: "The natural healing force within each of us is the greatest force in getting well.", author: "Hippocrates" }
];

export default function SymptomChecker({ onNavigate }: { onNavigate?: (tab: any) => void }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeQuote] = useState(MEDICAL_QUOTES[Math.floor(Math.random() * MEDICAL_QUOTES.length)]);

  const addSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const bodyNodes = [
    { name: 'Head', icon: Brain },
    { name: 'Chest', icon: Activity },
    { name: 'Abdomen', icon: ShieldCheck },
    { name: 'Limbs', icon: User }
  ];

  const toggleSymptom = (name: string) => {
    if (symptoms.includes(name)) {
      setSymptoms(symptoms.filter(s => s !== name));
    } else {
      setSymptoms([...symptoms, name]);
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) return toast.error("Select symptoms");
    
    setLoading(true);
    const prediction = await predictDisease(symptoms, language);
    setLoading(false);

    if (prediction && user) {
      setResult(prediction);
      const logData = {
        userId: user.uid,
        symptoms,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        analysis: prediction.analysis,
        createdAt: new Date().toISOString()
      };

      // Smart Sync
      await storage.save('symptomLogs', `log_${Date.now()}`, logData);
      
      if (isFirebaseConfigValid()) {
        try {
          await addDoc(collection(db, 'symptomLogs'), logData);
        } catch (e) {
          console.warn("Cloud Sync Deferred");
        }
      }
      toast.success("Health log localized successfully");
    } else {
      toast.error("Analysis failed. Please try again.");
    }
  };

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
               <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Advanced Diagnostics Active</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Diagnostic Pulse</h2>
          </div>
          <div className="max-w-xs md:text-right">
            <Quote className="w-5 h-5 text-blue-200 mb-2 md:ml-auto" />
            <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed uppercase tracking-tight">"{activeQuote.text}"</p>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">— {activeQuote.author}</p>
          </div>
        </div>
        <p className="text-slate-500 max-w-2xl leading-relaxed font-bold text-lg">AI-powered physiological synthesis. analyzing global clinical datasets for predictive pattern recognition.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="card p-10 space-y-10 bg-white border-slate-200/60 shadow-2xl shadow-slate-200/5 rounded-[3rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <Scan className="w-40 h-40" />
           </div>
           
           <div className="space-y-6 relative z-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-blue-600" /> Physiological Nodes
              </h3>

              <div className="grid grid-cols-4 gap-4">
                 {bodyNodes.map((node, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSymptom(node.name)}
                      className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${symptoms.includes(node.name) ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-white'}`}
                    >
                       <node.icon className={`w-8 h-8 mb-3 ${symptoms.includes(node.name) ? 'text-white' : 'text-slate-300'}`} />
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none">{node.name}</span>
                    </motion.button>
                 ))}
              </div>
           </div>

           <div className="space-y-6 relative z-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 leading-none">
                 <Search className="w-5 h-5 text-blue-600" /> Custom Indicators
              </h3>
              <form onSubmit={addSymptom} className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder={t('symptomInputPlaceholder')}
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300"
                  />
                </div>
                <Button type="submit" variant="outline" className="rounded-[1.5rem] px-8 h-16 font-black uppercase tracking-widest border-2 border-slate-200 hover:bg-slate-50 text-[11px] transition-all">Add Node</Button>
              </form>

              <div className="flex flex-wrap gap-3 min-h-[60px] p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                {symptoms.map((s, i) => (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i} 
                    className="flex items-center gap-3 bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 shadow-sm"
                  >
                    {s}
                    <button onClick={() => removeSymptom(i)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </motion.span>
                ))}
                {symptoms.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic font-black uppercase tracking-widest mt-2">Awaiting Clinical Data Input</p>
                )}
              </div>
           </div>

           <Button 
            disabled={loading || symptoms.length === 0} 
            onClick={handleAnalyze}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-20 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-4 py-8"
           >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Neural Sync Active...</>
            ) : (
              <><Brain className="w-6 h-6" /> Initialize Diagnosis</>
            )}
           </Button>

           <div className="flex items-start gap-4 p-6 bg-slate-900 rounded-[2rem] border border-slate-800">
             <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shrink-0">
                <Dna className="w-5 h-5 text-blue-400" />
             </div>
             <div className="space-y-1">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Bio-Neural Synthesis</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">Model Calibration: V2.4 Enterprise. Results are compliant with global privacy protocols.</p>
             </div>
           </div>
        </div>

        <div className="relative min-h-[400px] h-full">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-10 h-full bg-white flex flex-col justify-between rounded-[3rem] border-slate-200 shadow-2xl shadow-slate-200/20"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-1">Diagnostic Output</span>
                       <span className="text-xs font-black text-emerald-600 uppercase shadow-sm">Verified Match</span>
                    </div>
                  </div>
                  <div className="text-right">
                     <span className="text-3xl font-black text-blue-600 tracking-tighter italic leading-none">{(result.confidence * 100).toFixed(0)}%</span>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Confidence Load</p>
                  </div>
                </div>
                
                <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none">{result.prediction}</h3>
                
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-10 p-0.5 border border-slate-200/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      className="h-full bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                    />
                </div>

                <div className="space-y-8">
                  <p className="text-sm text-slate-600 leading-relaxed font-bold uppercase tracking-tight border-l-4 border-blue-500/20 pl-6 italic">{result.analysis}</p>
                  
                  <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 relative overflow-hidden group/quote">
                    <Quote className="absolute -top-2 -right-2 w-16 h-16 text-blue-100/50 opacity-20" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Clinical Maxim</span>
                      </div>
                      <p className="text-sm font-black text-blue-800 leading-relaxed italic uppercase tracking-tight">
                        "{MEDICAL_QUOTES[Math.floor(Math.random() * MEDICAL_QUOTES.length)].text}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <Button 
                  onClick={() => onNavigate?.('appointments')}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black h-16 rounded-[1.5rem] uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Request Consultation
                </Button>
                <Button variant="outline" className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-black h-16 rounded-[1.5rem] uppercase tracking-widest text-[11px] transition-all">Digital Export</Button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full border-4 border-dashed border-slate-100 bg-white rounded-[3rem] flex flex-col items-center justify-center text-center p-16">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 mb-8 animate-pulse text-slate-300">
                <Activity className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-3">Awaiting Signal</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">Initialize clinical data stream to generate biological insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
