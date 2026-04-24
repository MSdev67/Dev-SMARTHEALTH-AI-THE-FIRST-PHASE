import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageProvider';
import { useAuth } from '../lib/AuthProvider';
import { isFirebaseConfigValid } from '../lib/firebase';
import { Activity, ShieldCheck, HeartPulse, Brain, Calendar, Info, Quote, UserCircle, ChevronRight, TrendingUp, X, Wind, Sun, Award, Microscope, Utensils, Languages, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import MedicationTracker from './MedicationTracker';
import { Language } from '../translations';

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: any) => void }) {
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useAuth();
  const isCloud = isFirebaseConfigValid();
  
  const [showHealthID, setShowHealthID] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const healthTips = [
    { id: 'hydration', key: 'tipHydration', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'activity', key: 'tipActivity', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'rest', key: 'tipRest', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'nutrition', key: 'tipNutrition', icon: Utensils, color: 'text-indigo-500', bg: 'bg-indigo-50' }
  ];

  const languages: { code: Language; labelKey: any }[] = [
    { code: 'en', labelKey: 'langEn' },
    { code: 'hi', labelKey: 'langHi' },
    { code: 'ka', labelKey: 'langKa' },
    { code: 'te', labelKey: 'langTe' },
    { code: 'ta', labelKey: 'langTa' },
    { code: 'ml', labelKey: 'langMl' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTipIndex(prev => (prev + 1) % healthTips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const comparisonData = [
    { name: 'Mon', personal: 78, avg: 65 },
    { name: 'Tue', personal: 82, avg: 66 },
    { name: 'Wed', personal: 85, avg: 64 },
    { name: 'Thu', personal: 91, avg: 68 },
    { name: 'Fri', personal: 88, avg: 67 },
    { name: 'Sat', personal: 94, avg: 69 },
    { name: 'Sun', personal: 92, avg: 66 },
  ];

  const quotes = [t('quote1'), t('quote2'), t('quote3')];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const wellnessMetrics = [
    { label: 'Activity', score: 94, sub: 'Daily steps target met' },
    { label: 'Cardiac', score: 88, sub: 'Resting HR stable at 62' },
    { label: 'Neural', score: 91, sub: 'Cognitive load balanced' },
    { label: 'Sleep', score: 95, sub: 'REM quality optimized' }
  ];

  const stats = profile?.role === 'doctor' ? [
    { label: 'Patient Volume', value: '142', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: '+12% GROWTH' },
    { label: 'Clinical Efficacy', value: '98.4%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', sub: '99 PERCENTILE' },
    { label: 'Pending Reviews', value: '4 Cases', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'HIGH PRIORITY' },
  ] : [
    { label: 'Vitality Score', value: '94%', icon: HeartPulse, color: 'text-emerald-500', bg: 'bg-emerald-50/50', sub: 'PEAK RECOVERY', onClick: () => onNavigate?.('longevity') },
    { label: 'Bio-Log Efficiency', value: '98%', icon: Utensils, color: 'text-blue-500', bg: 'bg-blue-50/50', sub: 'OPTIMAL FUEL', onClick: () => onNavigate?.('nutritional') },
    { label: 'Lab Synthesis', value: 'Sync', icon: Microscope, color: 'text-indigo-500', bg: 'bg-indigo-50/50', sub: 'ALL NODES VERIFIED', onClick: () => onNavigate?.('labs') },
  ];

  const pathogens = [
    { name: "AQI", value: "42", color: "text-emerald-500", icon: Wind },
    { name: "UV", value: "8.4", color: "text-red-500", icon: Sun },
    { name: "Pollen", value: "High", color: "text-orange-500", icon: Activity }
  ];

  return (
    <div className="space-y-10 pb-24">
      {/* Environmental Pathogen Ticker */}
      <div className="flex flex-wrap gap-4 items-center bg-white border border-slate-100 p-4 rounded-[2rem] shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
         <div className="flex items-center gap-2 pr-6 border-r border-slate-100 shrink-0">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{t('envPulse')}</span>
         </div>
         {pathogens.map((p, i) => (
            <div key={i} className="flex items-center gap-2 group cursor-help shrink-0 pr-4">
               <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{p.name}:</span>
               <span className="text-[10px] font-black text-slate-900 uppercase">{p.value}</span>
            </div>
         ))}
         <div className="ml-auto hidden lg:flex items-center gap-3">
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] animate-pulse">Neural Pathogen Scan Active</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
               <motion.div animate={{ x: [-100, 100] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-1/2 h-full bg-blue-600 rounded-full blur-[1px]" />
            </div>
         </div>
      </div>

      {/* Language Selection & Clinical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Modern Language Switcher Grid */}
        <div className="card p-10 bg-white border-slate-200 shadow-2xl shadow-slate-200/5 rounded-[3rem] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
               <Languages className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <Languages className="w-5 h-5" />
               </div>
               <h4 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">{t('language')}</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
               {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLanguage(lang.code)}
                    className={`py-5 px-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border-2 transition-all shadow-sm ${language === lang.code ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50 border-slate-100/50 text-slate-400 hover:border-blue-200 hover:bg-white'}`}
                  >
                     {t(lang.labelKey)}
                  </motion.button>
               ))}
            </div>
        </div>

        {/* Clinical Insight Intelligent Ticker */}
        <div className="card p-10 bg-slate-900 border-slate-800 shadow-2xl rounded-[3rem] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5"></div>
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Sparkles className="w-40 h-40 group-hover:scale-110 transition-transform duration-[2s]" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <Brain className="w-5 h-5" />
                   </div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Clinical Intelligence</h4>
                </div>

                <AnimatePresence mode="wait">
                   <motion.div
                     key={activeTipIndex}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <div className={`w-14 h-14 ${healthTips[activeTipIndex].bg} ${healthTips[activeTipIndex].color} rounded-2xl flex items-center justify-center shadow-inner mb-2`}>
                        {(() => {
                           const IconComp = healthTips[activeTipIndex].icon;
                           return <IconComp className="w-7 h-7" />;
                        })()}
                     </div>
                     <h3 className="text-3xl font-black text-white tracking-tighter leading-tight uppercase">
                        {t(healthTips[activeTipIndex].key as any)}
                     </h3>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-tight max-w-sm">
                        Optimizing physiological parameters based on {profile?.bloodGroup || 'O+'} clinical baseline.
                     </p>
                   </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 flex gap-2 mt-8">
               {healthTips.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeTipIndex ? 'w-12 bg-blue-500' : 'w-2 bg-slate-800'}`} />
               ))}
            </div>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
            {profile?.role === 'doctor' ? 'Clinical Command' : t('dashboard')}
          </h2>
          <div className="flex items-center gap-2 mt-3 mb-1">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[11px] font-black uppercase tracking-widest">
                <ShieldCheck className={`w-3.5 h-3.5 ${isCloud ? 'text-emerald-600' : 'text-blue-600'}`} />
                {isCloud ? t('cloudActive') : t('localizedMode')}
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[11px] font-black uppercase tracking-widest">
                <TrendingUp className="w-3.5 h-3.5" /> {t('streak')}
             </div>
          </div>
          <p className="text-slate-500 max-w-xl leading-relaxed font-medium text-sm">
            Unified ecosystem for {profile?.role === 'doctor' ? 'practice management and diagnostic precision' : 'personalized longevity and physiological monitoring'}.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <Button 
                onClick={() => onNavigate?.('appointments')}
                variant="outline" 
                className="border-slate-200 text-slate-900 font-bold text-[10px] h-12 rounded-2xl px-6 uppercase tracking-widest hover:bg-slate-50 transition-all border-2"
            >
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                {profile?.role === 'doctor' ? 'Schedule' : t('bookings')}
            </Button>
            <Button 
                onClick={() => onNavigate?.('symptoms')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] h-12 rounded-2xl shadow-xl shadow-slate-900/20 px-8 uppercase tracking-[0.2em] transition-all active:scale-95"
            >
                {profile?.role === 'doctor' ? 'Patient Vault' : t('newDiagnosis')}
            </Button>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main Hero Card - Fixed with more distinct styling and contrast */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 bg-slate-900 rounded-[3rem] text-white border border-slate-800 shadow-2xl shadow-slate-900/40 relative overflow-hidden group min-h-[400px] flex flex-col justify-end"
          >
            {/* Neural Map Mesh Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 p-12 opacity-30 scale-150 rotate-12 transition-transform group-hover:scale-175 group-hover:rotate-6 duration-1000 ease-out pointer-events-none">
                <Brain className="w-80 h-80 text-blue-500/40 blur-[1px]" />
            </div>
            
            <div className="absolute top-10 left-10 flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.5rem] bg-blue-600/30 backdrop-blur-3xl flex items-center justify-center border border-blue-500/40 shadow-xl">
                    <HeartPulse className="w-7 h-7 text-blue-300" />
                </div>
                <div>
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">Neural Synthesis v4</h3>
                   <div className="flex items-center gap-2 mt-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Clinical Precision Active</span>
                   </div>
                </div>
            </div>

            <div className="relative z-10 space-y-10">
                <h3 className="text-4xl md:text-6xl font-black max-w-3xl leading-[1.05] tracking-tighter">
                    {profile?.role === 'doctor' 
                      ? `Dr. ${profile.displayName.split(' ')[0]}, managing 14 critical cases with automated clinical diagnostics.` 
                      : `HRV optimized. exhibiting peak biological resilience and 92% recovery capacity.`}
                </h3>
                <div className="flex flex-wrap items-center gap-10 pt-6">
                    <div className="space-y-1.5 cursor-pointer group/stat" onClick={() => onNavigate?.('longevity')}>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/stat:text-blue-400 transition-colors">{t('vitalityIndex')}</p>
                        <p className="text-2xl font-black text-white tracking-tight">Level 42.8</p>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                    <div className="space-y-1.5 cursor-pointer group/stat" onClick={() => onNavigate?.('nutritional')}>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/stat:text-emerald-400 transition-colors">{t('microDensity')}</p>
                        <p className="text-2xl font-black text-white tracking-tight">9.4 High</p>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                    <div className="space-y-1.5 cursor-pointer group/stat" onClick={() => onNavigate?.('labs')}>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/stat:text-indigo-400 transition-colors">{t('genomicLoad')}</p>
                        <p className="text-2xl font-black text-white tracking-tight">Optimal</p>
                    </div>
                    <Button 
                      onClick={() => onNavigate?.('longevity')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 ml-auto"
                    >
                      {profile?.role === 'doctor' ? 'COMMAND CENTER' : 'VIEW PHASES'}
                    </Button>
                </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                onClick={() => stat.onClick?.()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className={`card p-8 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-slate-200/60 bg-white shadow-2xl shadow-slate-200/5 rounded-[2.5rem] ${stat.onClick ? 'cursor-pointer active:scale-95' : ''}`}
              >
                <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 mb-8 border border-current/10 shadow-inner`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</p>
                  <div className="flex items-baseline justify-between">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest shadow-sm">{stat.sub}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="card p-10 bg-slate-900 text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden h-[420px] flex flex-col justify-between group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]"></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-xl group-hover:scale-110 transition-transform">
                         <ShieldCheck className="w-7 h-7 text-blue-400" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">{t('securityArch')}</h4>
                   </div>
                   <h3 className="text-4xl font-black mb-4 tracking-tighter leading-none uppercase">{t('bioVault')}</h3>
                   <p className="text-[12px] text-slate-400 leading-relaxed font-bold mb-10 border-l-2 border-blue-500/30 pl-5 uppercase tracking-tight">
                       Cloud-fragmented clinical vault. authorized biometrics required.
                   </p>
                </div>
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center gap-10 px-2">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol</p>
                          <p className="text-sm font-black text-emerald-400 italic">E2EE-ACTIVE</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FIPS-140</p>
                          <p className="text-sm font-black uppercase">COMPLIANT</p>
                       </div>
                   </div>
                   <Button 
                    onClick={() => setShowHealthID(true)}
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black text-[11px] uppercase tracking-[0.3em] h-16 rounded-[1.5rem] shadow-2xl shadow-blue-500/10 transition-all active:scale-95"
                   >
                    {t('records')}
                   </Button>
                </div>
          </div>

          <MedicationTracker isCard onNavigate={onNavigate} />

          {/* Precision Longevity Goals */}
          <div className="p-8 bg-blue-600 rounded-[3rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                <Activity className="w-40 h-40" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> {t('adherence')}
                   </h4>
                   <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase border border-white/20">AI Optimized</div>
                </div>
                <div className="space-y-6">
                   {[
                     { label: t('hydrationPrec'), progress: 65 },
                     { label: t('moveVel'), progress: 82 }
                   ].map((goal, i) => (
                     <div key={i} className="space-y-2.5">
                        <div className="flex justify-between items-end">
                           <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">{goal.label}</p>
                           <p className="text-sm font-black tracking-tight">{goal.progress}%</p>
                        </div>
                        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${goal.progress}%` }}
                             className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Peer Comparison Chart */}
          <div className="card p-8 border-slate-200/60 bg-white">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                       <TrendingUp className="w-4 h-4 text-emerald-600" /> Clinical Benchmark
                   </h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">vs Global Peer Average</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-emerald-600">+24%</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Vitality Boost</p>
                </div>
             </div>
             
             <div className="h-48 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={comparisonData}>
                      <defs>
                         <linearGradient id="personal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="personal" stroke="#2563eb" fillOpacity={1} fill="url(#personal)" strokeWidth={3} />
                      <Area type="monotone" dataKey="avg" stroke="#94a3b8" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* Health ID Modal */}
      {showHealthID && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-8 border-slate-100"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-32 h-32" />
            </div>
            
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl mb-4">
                    <HeartPulse className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{t('emerPass')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Local Encrypted Data Only</p>
            </div>

            <div className="space-y-4 mb-10">
                {[
                  { label: 'Patient Name', value: profile?.displayName || 'User' },
                  { label: 'Blood Group', value: 'O Pos (Rh+)', color: 'text-red-600' },
                  { label: 'Chronic History', value: 'None reported' },
                  { label: 'Allergies', value: 'Penicillin, Peanuts', color: 'text-orange-600' },
                  { label: 'Emergency Contact', value: '+1 (555) 000-0123' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className={`text-xs font-black ${item.color || 'text-slate-900'}`}>{item.value}</span>
                  </div>
                ))}
            </div>

            <Button onClick={() => setShowHealthID(false)} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-[10px]">
                CLOSE PASS
            </Button>
          </motion.div>
        </div>
      )}

      {/* Score Detail Modal */}
      {showScoreDetail && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
            
            <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Wellness Architecture</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Clinical Data Synthesis V2.4</p>
                </div>
                <button onClick={() => setShowScoreDetail(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                   <X className="w-6 h-6" />
                </button>
            </div>
            
            <p className="text-sm text-slate-600 font-medium mb-12 leading-relaxed max-w-lg">
              "Your 92/100 Clinical Vitality score represents a 14% improvement over the last biological quarter, primarily driven by cardiac efficiency and neural balance."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
               {wellnessMetrics.map((m, i) => (
                 <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group transition-all cursor-default">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{m.label}</span>
                        <div className="text-xl font-black text-slate-900">{m.score}%</div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${m.score}%` }} 
                          className="h-full bg-blue-600 rounded-full"
                        />
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase tracking-tight">{m.sub}</p>
                 </div>
               ))}
            </div>

            <Button onClick={() => setShowScoreDetail(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-8 rounded-[2rem] uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-900/20">
                DISMISS ANALYSIS
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
