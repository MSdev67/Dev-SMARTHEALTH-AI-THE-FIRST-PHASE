import React, { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { useLanguage } from '../lib/LanguageProvider';
import { User, Phone, Droplets, Mail, Save, Loader2, Camera, Shield, Heart, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

export default function Profile() {
  const { profile, updateUserProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    bloodGroup: profile?.bloodGroup || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{t('profile')}</h2>
        <p className="text-slate-500 max-w-xl leading-relaxed">Manage your personal and medical information. All clinical data is encrypted using AES-256 standards.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleUpdate} className="card p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100">
               <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-lg">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-bold">{profile?.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
               </div>
               <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900">{profile?.displayName}</h3>
                  <p className="text-sm text-slate-500 font-medium">{profile?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">{profile?.role || 'Patient'}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('phone')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('bloodGroup')}</label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm opacity-50 cursor-not-allowed outline-none"
                    value={profile?.email || ''}
                  />
                </div>
              </div>
            </div>

            <Button disabled={loading} className="w-full bg-slate-900 text-white rounded-lg py-6 font-bold shadow-lg transition-transform active:scale-[0.99] uppercase tracking-widest text-xs">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {t('saveProfile')}</>}
            </Button>
          </form>

          <div className="card p-8 bg-white border-slate-200/60">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Biological Achievements</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Proof of Wellness Consistency</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 italic font-black text-blue-600 text-xs">V+</div>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Consistency', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', earned: true },
                  { label: 'Vitality', icon: Heart, color: 'text-red-600', bg: 'bg-red-50', earned: true },
                  { label: 'Precision', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', earned: false },
                  { label: 'Zenith', icon: Droplets, color: 'text-indigo-600', bg: 'bg-indigo-50', earned: false },
                ].map((badge, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 transition-all ${badge.earned ? 'border-slate-100 bg-white shadow-lg shadow-slate-200/40' : 'border-slate-50 opacity-40 grayscale'}`}>
                     <div className={`${badge.bg} ${badge.color} p-4 rounded-2xl`}>
                        <badge.icon className="w-6 h-6" />
                     </div>
                     <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{badge.label}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> {t('settings')}
            </h3>
            
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('language')}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['en', 'hi', 'ka', 'te', 'ta', 'ml'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`py-2 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-all ${
                      language === lang 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {lang === 'en' ? 'English' : 
                     lang === 'hi' ? 'Hindi' : 
                     lang === 'ka' ? 'Kannada' : 
                     lang === 'te' ? 'Telugu' : 
                     lang === 'ta' ? 'Tamil' : 
                     'Malayalam'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 italic text-[10px] text-slate-400 font-medium leading-relaxed">
               Changing language will update the entire application interface instantly. More regional supports are coming soon.
            </div>
          </div>

          <div className="card p-6 bg-emerald-600 text-white border-none shadow-xl shadow-emerald-600/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Heart className="w-24 h-24" />
             </div>
             <h4 className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-4">Health Passport</h4>
             <p className="text-xs text-emerald-50 mb-6 leading-relaxed font-medium">Your digital health identity is ready. Present this in partner hospitals for instant medical record integration.</p>
             <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 font-bold text-xs">GENERATE QR CODE</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
