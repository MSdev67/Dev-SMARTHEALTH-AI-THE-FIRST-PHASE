import React, { useState } from 'react';
import { Activity, MessageSquare, Calendar, History, Shield, User as UserIcon, LogOut, AlertCircle, Stethoscope, UserCircle, LayoutDashboard, Pill, Utensils, FlaskConical, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/AuthProvider';
import { useLanguage } from './lib/LanguageProvider';
import { isFirebaseConfigValid } from './lib/firebase';
import Dashboard from './components/Dashboard';
import SymptomChecker from './components/SymptomChecker';
import ChatBot from './components/ChatBot';
import Appointments from './components/Appointments';
import HealthHistory from './components/HealthHistory';
import BioMetricsHub from './components/BioMetricsHub';
import Profile from './components/Profile';
import AuthPage from './components/AuthPage';
import MedicationTracker from './components/MedicationTracker';
import NutritionalHub from './components/NutritionalHub';
import LabVault from './components/LabVault';
import LongevityHub from './components/LongevityHub';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

export default function App() {
  const { user, profile, loading, logout } = useAuth();
  const { t, language } = useLanguage();
  const isCloud = isFirebaseConfigValid();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'symptoms' | 'chat' | 'appointments' | 'history' | 'biometrics' | 'profile' | 'medications' | 'nutritional' | 'labs' | 'longevity'>('dashboard');

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20"
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Ecosystem</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'biometrics', label: 'Vitals Hub', icon: Activity },
    { id: 'symptoms', label: profile?.role === 'doctor' ? 'Clinical Cases' : 'Diagnostics', icon: profile?.role === 'doctor' ? Activity : Stethoscope },
    { id: 'nutritional', label: 'Nutritional Hub', icon: Utensils },
    { id: 'medications', label: 'Pharmaceutics', icon: Pill },
    { id: 'labs', label: 'Lab Vault', icon: FlaskConical },
    { id: 'longevity', label: 'Longevity Suite', icon: Award },
    { id: 'appointments', label: profile?.role === 'doctor' ? 'My Schedule' : 'Clinical Bookings', icon: Calendar },
    { id: 'chat', label: t('healthBot'), icon: MessageSquare },
    { id: 'history', label: t('records'), icon: History },
    { id: 'profile', label: t('profile'), icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] grid-bg flex flex-col md:flex-row font-sans text-slate-800 selection:bg-blue-100" key={language}>
      {/* Sidebar */}
      <nav className="w-full md:w-80 bg-white border-r border-slate-200/60 flex flex-col p-8 sticky top-0 h-screen overflow-y-auto z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)] print:hidden">
        <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none italic uppercase">SmartHealth<span className="text-blue-600">AI</span></span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 block">Clinical Intelligence</span>
          </div>
        </div>

        {/* Global Wellness Score Widget */}
        <div className="mb-10 p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
           <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vitality Index</p>
                 <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-black tracking-tighter">92</span>
                 <span className="text-xs font-bold text-slate-400 mb-1.5">/ 100</span>
              </div>
              <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: '92%' }} 
                   className="h-full bg-blue-500"
                 />
              </div>
           </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Command Center</p>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                <span className={`text-sm font-black uppercase tracking-tight ${activeTab === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="nav-indicator-glow" className="absolute left-0 w-1.5 h-1.5 bg-white rounded-full ml-2 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => setActiveTab('profile')}>
            <Avatar className="w-12 h-12 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
              <AvatarImage src={profile?.photoURL || ''} />
              <AvatarFallback className="bg-blue-600 text-white text-sm font-black uppercase">{profile?.displayName?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-black truncate text-sm text-slate-900 uppercase tracking-tighter">{profile?.displayName || user.displayName}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{profile?.role || 'Patient Node'}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-black text-[11px] uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Secure Termination
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto relative scroll-smooth bg-slate-50/40">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="print:p-0"
            >
              <div className="mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:hidden">
                 <div className="flex items-center gap-4">
                    <div className="px-5 py-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 backdrop-blur-md">
                       <div className="relative">
                          <div className={`w-2 h-2 rounded-full ${isCloud ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></div>
                          <div className={`absolute -inset-1 rounded-full blur-[4px] opacity-40 ${isCloud ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                       </div>
                       {isCloud ? 'Global Clinical Cloud' : 'Secure Localized Node'}
                    </div>
                    <div className="hidden lg:flex px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest">
                       Clinical Shield Active
                    </div>
                 </div>
                 <div className="flex items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <button onClick={() => setActiveTab('profile')} className={`cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'text-blue-600' : ''}`}>
                       <Shield className="w-3.5 h-3.5" /> {t('settings')}
                    </button>
                    <span className="cursor-pointer hover:text-blue-600 transition-colors">Digital Help Desk</span>
                 </div>
              </div>
              
              {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
              {activeTab === 'symptoms' && <SymptomChecker onNavigate={setActiveTab} />}
              {activeTab === 'medications' && <MedicationTracker />}
              {activeTab === 'nutritional' && <NutritionalHub />}
              {activeTab === 'labs' && <LabVault />}
              {activeTab === 'longevity' && <LongevityHub />}
              {activeTab === 'chat' && <ChatBot onNavigate={setActiveTab} />}
              {activeTab === 'appointments' && <Appointments />}
              {activeTab === 'history' && <HealthHistory />}
              {activeTab === 'biometrics' && <BioMetricsHub />}
              {activeTab === 'profile' && <Profile />}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <footer className="mt-20 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] print:hidden">
          <div>&copy; 2024 SmartHealth AI Ecosystem</div>
          <div className="flex gap-10">
            <span>{t('hipaaCompliantShort')}</span>
            <span>{t('gdprSecuredShort')}</span>
            <span>AES-256</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

