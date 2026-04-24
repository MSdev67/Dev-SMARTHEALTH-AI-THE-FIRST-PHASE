import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MoreHorizontal, Sparkles, Languages, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { medicalChatStream } from '../services/geminiService';
import { useLanguage } from '../lib/LanguageProvider';
import { GenerateContentResponse } from "@google/genai";
import { Button } from './ui/button';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'model';
  text: string;
};

export default function ChatBot({ onNavigate }: { onNavigate?: (tab: any) => void }) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t('welcomeSub') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepMode, setDeepMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const suggestedQueries = [
    { label: "Common Cold", query: "What are the first signs of a common cold and how to treat it?" },
    { label: "Fever Relief", query: "What is the best way to handle a mild fever at home?" },
    { label: "Heart Health", query: "What are 5 daily habits for better cardiovascular health?" },
    { label: "Sleep Hygiene", query: "Can you provide a checklist for better sleep hygiene?" }
  ];

  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalInput = customQuery || input;
    if (!finalInput.trim() || loading) return;

    const userMessage = finalInput.trim();
    if (!customQuery) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    const chatHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    try {
      const stream = await medicalChatStream(chatHistory, language, deepMode);
      let assistantText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          assistantText += c.text;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'model', text: assistantText };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[75vh] flex flex-col bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden relative group">
      <div className="p-8 border-b-2 border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-black/10">
             <Bot className={`w-7 h-7 ${deepMode ? 'text-blue-400' : 'text-emerald-400'}`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse ${deepMode ? 'bg-blue-600' : 'bg-emerald-500'}`}></div>
               <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{t('aiAssistant')}</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagnostic Node Active</span>
               {deepMode && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100">Deep Clinical Mode</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 px-5 py-2.5 rounded-2xl group/toggle transition-all hover:border-blue-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enhanced Mode</span>
                <button 
                  onClick={() => setDeepMode(!deepMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${deepMode ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${deepMode ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>
            <Button 
                onClick={() => onNavigate?.('appointments')}
                className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
                <Calendar className="w-4 h-4 mr-2" /> Book Clinical
            </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
        <AnimatePresence initial={false}>
          {messages.length === 1 && (
            <motion.div 
              key="quick-suggestions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10 border-b-2 border-slate-100 mb-10"
            >
              {suggestedQueries.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, s.query)}
                  className="p-6 text-left bg-white hover:bg-blue-50 border-2 border-slate-100 rounded-[2rem] transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                >
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2 group-hover:translate-x-1 transition-transform">Bio-Query Input</p>
                  <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{s.label}</p>
                </button>
              ))}
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={`msg-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end font-black uppercase tracking-tight' : 'justify-start font-bold uppercase tracking-tight'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] p-6 rounded-[2.5rem] shadow-2xl ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-blue-600/20 rounded-tr-none' 
                  : 'bg-white text-slate-900 border-2 border-slate-100 rounded-tl-none shadow-slate-200/5'
              } text-xs leading-relaxed`}>
                <div className="prose prose-sm prose-inherit max-w-none prose-p:my-1">
                  <ReactMarkdown>
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              key="loading-indicator"
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex justify-start"
            >
              <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] rounded-tl-none shadow-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse">Bio-Neural Synthesis Layer active...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      <div className="p-8 bg-white border-t-2 border-slate-50 relative z-10">
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('typeQuery')}
            className="w-full p-6 pr-16 text-xs font-black uppercase border-2 border-slate-100 rounded-[2rem] bg-slate-50 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner tracking-widest placeholder:text-slate-300"
          />
          <button 
            disabled={!input.trim() || loading} 
            className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 disabled:bg-slate-200 transition-all shadow-lg active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="flex items-center justify-center gap-10 mt-6 overflow-hidden max-w-full">
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] whitespace-nowrap">Clinical Node: Verified</p>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] whitespace-nowrap">BioBERT Analysis Active</p>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] whitespace-nowrap">AES-256 Secured</p>
        </div>
      </div>
    </div>
  );
}
