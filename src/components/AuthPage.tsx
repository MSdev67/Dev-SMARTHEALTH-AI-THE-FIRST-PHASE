import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthProvider';
import { useLanguage } from '../lib/LanguageProvider';
import { Activity, Shield, Mail, Lock, User, Phone, Droplets, Loader2, Globe, Calendar, Quote, HeartPulse, Brain, Microscope } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function AuthPage() {
  const { signIn, signInEmail, signUpEmail } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const medicalQuotes = [
    { text: "Health is a state of complete physical, mental and social well-being.", author: "World Health Organization" },
    { text: "The art of medicine consists of amusing the patient while nature cures the disease.", author: "Voltaire" },
    { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
    { text: "Medicine is a science of uncertainty and an art of probability.", author: "William Osler" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % medicalQuotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    bloodGroup: '',
    role: 'patient'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInEmail(formData.email, formData.password);
        toast.success("Welcome back to SmartHealth AI");
      } else {
        if (!formData.fullName || !formData.phone || (role === 'patient' && !formData.bloodGroup)) {
          throw new Error("Please fill all clinical fields");
        }
        await signUpEmail(formData.email, formData.password, { ...formData, role });
        toast.success("Medical Profile Created Successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
      toast.success("Biometric Sync Complete via Google");
    } catch (err: any) {
      toast.error(err.message || "Credential verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-16 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full grid-bg" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
             <Activity className="w-7 h-7 text-white" />
           </div>
           <span className="text-xl font-black text-white tracking-widest uppercase">SmartHealth <span className="text-blue-500">AI</span></span>
        </div>

        <div className="relative z-10 space-y-12">
           <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-xl"
              >
                <Quote className="w-12 h-12 text-blue-500/40 mb-8" />
                <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                  "{medicalQuotes[quoteIndex].text}"
                </h2>
                <div className="flex items-center gap-4">
                   <div className="w-8 h-px bg-blue-500"></div>
                   <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">{medicalQuotes[quoteIndex].author}</p>
                </div>
              </motion.div>
           </AnimatePresence>

           <div className="grid grid-cols-2 gap-8 pt-12">
              {[
                { label: 'HIPAA COMPLIANT', icon: Shield, desc: 'Advanced encryption standards' },
                { label: 'AI DIAGNOSTICS', icon: Brain, desc: '98.4% predictive accuracy' },
                { label: 'VITAL SYNC', icon: HeartPulse, desc: 'Real-time biological tracking' },
                { label: 'LAB INTEGRATION', icon: Microscope, desc: 'Unified clinical data access' }
              ].map((feature, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black text-white tracking-widest uppercase">{feature.label}</span>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 pt-10">
           <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Trusted by 12,000+ clinicians worldwide</p>
           </div>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white relative">
        <div className="absolute top-8 right-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
            </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3">
              {isLogin ? 'Access Portal' : 'Clinical Entry'}
            </h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              {isLogin 
                ? 'Resume your health intelligence journey with secure biometric synchronization.' 
                : 'Establish your professional health profile and join the global medical AI node.'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-10">
            <button 
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all uppercase ${role === 'patient' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Patient Node
            </button>
            <button 
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all uppercase ${role === 'doctor' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Doctor Node
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="group relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder={t('fullName')}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-200 focus:bg-white outline-none transition-all"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="group relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="tel"
                      required
                      placeholder={t('phone')}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-200 focus:bg-white outline-none transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  {role === 'patient' && (
                    <div className="group relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <select
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-200 focus:bg-white outline-none appearance-none transition-all"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      >
                        <option value="" disabled>{t('bloodGroup')}</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                placeholder={t('email')}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-200 focus:bg-white outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                required
                placeholder={t('password')}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-200 focus:bg-white outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <Button 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Establish Secure Sync' : 'Initialize Profile')}
              </Button>
            </div>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white px-6 text-slate-300 tracking-[0.3em]">Credentials</span></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border-2 border-slate-100 py-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            {t('signInGoogle')}
          </Button>

          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-10 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
          >
            {isLogin ? t('needAccount') : t('alreadyHaveAccount')}
          </button>

          <div className="mt-12 flex items-center justify-center gap-6 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> 
                <span>GDPR Ready</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> 
                <span>SOC2 Type II</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
