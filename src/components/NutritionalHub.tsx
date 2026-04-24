import React, { useState, useRef } from 'react';
import { Camera, Upload, Utensils, Zap, Wind, Sun, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Info, Search, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function NutritionalHub() {
  const [analyzing, setAnalyzing] = useState(false);
  const [mealResult, setMealResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        analyzeMeal(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async (base64Image: string) => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = base64Image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this meal image and provide a nutritional breakdown. Focus on high nutritional accuracy for macros and micro-density. Also identify potential allergens." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mealName: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              microDensity: { type: Type.STRING, description: "Scale of 1-10 for nutrient density" },
              micronutrients: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              allergens: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              clinicalAdvice: { type: Type.STRING }
            },
            required: ["mealName", "calories", "protein", "carbs", "fats"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setMealResult(data);
      toast.success("Bio-Nutritional Analysis Complete");
    } catch (error) {
      console.error("Meal Analysis Error:", error);
      toast.error("Analysis Failed. Ensure valid clinical data.");
    } finally {
      setAnalyzing(false);
    }
  };

  const pathogens = [
    { name: "Air Quality Index", value: "42", status: "Optimal", color: "text-emerald-500", icon: Wind, description: "Minimal atmospheric particulate matter detected." },
    { name: "Pollen Concentration", value: "High", status: "Warning", color: "text-orange-500", icon: Leaf, description: "Increased birch and ragweed levels in your sector." },
    { name: "UV Intensity", value: "8.4", status: "Extreme", color: "text-red-500", icon: Sun, description: "Limit direct biological exposure. Photo-aging risk high." }
  ];

  return (
    <div className="space-y-16 pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <Utensils className="w-6 h-6 text-blue-600" />
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Biometric Fuel Analysis</p>
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Nutritional Hub</h2>
        <p className="text-slate-500 max-w-2xl leading-relaxed font-bold text-lg">AI-powered physiological synthesis of caloric intake. Transform visual data into biological performance metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Environmental Pathogen Tracker */}
        <div className="lg:col-span-1 space-y-8">
           <div className="card p-10 bg-slate-900 text-white rounded-[3rem] border-none shadow-2xl shadow-slate-900/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Wind className="w-40 h-40" />
              </div>
              <div className="relative z-10 space-y-8">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 text-blue-400">
                    <Zap className="w-5 h-5" /> Pathogen Scan
                 </h3>
                 <div className="space-y-6">
                    {pathogens.map((p, i) => (
                       <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all cursor-crosshair">
                          <div className="flex items-start justify-between mb-3">
                             <div className="flex items-center gap-3">
                                <p.icon className={`w-5 h-5 ${p.color}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.name}</span>
                             </div>
                             <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-black/40 border border-white/5 ${p.color}`}>{p.status}</span>
                          </div>
                          <p className="text-3xl font-black tracking-tighter mb-2">{p.value}</p>
                          <p className="text-[9px] text-slate-500 font-bold leading-relaxed">{p.description}</p>
                       </div>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-white/10">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2 leading-none">Clinical Directive</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">Environmental threats detected. Activating respiratory protection protocol and hydration increase.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* AI Meal Scanner */}
        <div className="lg:col-span-2 space-y-10">
           <div className="card p-12 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/20 border-slate-100 flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-8">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Bio-Visual Scanner</h3>
                    <p className="text-slate-500 text-sm font-bold leading-relaxed">Capture or upload your meal for immediate clinical protein-carb synthesis and micro-density mapping.</p>
                 </div>

                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-square rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer group hover:border-blue-600 hover:bg-blue-50 transition-all overflow-hidden relative"
                 >
                    {selectedImage ? (
                       <img src={selectedImage} alt="Meal" className="w-full h-full object-cover" />
                    ) : (
                       <>
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-6 border border-slate-100">
                             <Camera className="w-10 h-10 text-blue-600" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ignite Optical Scan</span>
                       </>
                    )}
                    {analyzing && (
                       <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] animate-pulse">Decoding Nutritional Blueprint</p>
                       </div>
                    )}
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageUpload} 
                   accept="image/*" 
                   className="hidden" 
                 />

                 <Button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
                 >
                    <Upload className="w-4 h-4 mr-3" /> Execute Digital Upload
                 </Button>
              </div>

              <div className="flex-1">
                 <AnimatePresence mode="wait">
                    {mealResult ? (
                       <motion.div 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="h-full flex flex-col"
                       >
                          <div className="mb-10 pb-6 border-b-2 border-slate-50">
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] block mb-2">Synthesis Successful</span>
                             <h4 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">{mealResult.mealName}</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-10">
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Load</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">{mealResult.calories} <span className="text-[10px] uppercase text-slate-400">kcal</span></p>
                             </div>
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Micro Density</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tighter">{mealResult.microDensity}/10</p>
                             </div>
                          </div>

                          <div className="space-y-6 flex-1">
                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-4">Macro Distribution</h5>
                             <div className="space-y-4">
                                {[
                                   { label: 'Proteline', value: mealResult.protein, color: 'bg-blue-600', max: 50 },
                                   { label: 'Carbsynth', value: mealResult.carbs, color: 'bg-emerald-500', max: 100 },
                                   { label: 'Lipids', value: mealResult.fats, color: 'bg-orange-400', max: 30 }
                                ].map((macro, idx) => (
                                   <div key={idx} className="space-y-2">
                                      <div className="flex justify-between items-end">
                                         <span className="text-[10px] font-black uppercase text-slate-600">{macro.label}</span>
                                         <span className="text-xs font-black text-slate-900">{macro.value}g</span>
                                      </div>
                                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                                           className={`h-full ${macro.color} rounded-full`}
                                         />
                                      </div>
                                   </div>
                                ))}
                             </div>

                             <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                   <Info className="w-4 h-4 text-blue-600" />
                                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Clinical Advice</span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{mealResult.clinicalAdvice}</p>
                             </div>
                          </div>
                       </motion.div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                             <Search className="w-10 h-10 text-slate-200" />
                          </div>
                          <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-2 leading-none">Optical Standby</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Awaiting biometric fuel data for synthesis.</p>
                       </div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
