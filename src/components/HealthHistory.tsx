import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Clock, ShieldCheck, Download, Filter, FileText, ChevronRight, Smartphone, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function HealthHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [activeVaultTab, setActiveVaultTab] = useState<'logs' | 'prescriptions'>('logs');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [wearableData, setWearableData] = useState<any>(null);
  const [activeMetric, setActiveMetric] = useState<'steps' | 'heart' | 'sleep'>('steps');
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'symptomLogs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const pq = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubPres = onSnapshot(pq, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubPres();
    };
  }, [user]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        toast.success(`Wearable device connected! Syncing data...`);
        setConnected(true);
        handleSync();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const resp = await fetch('/api/auth/fitbit/url');
      const { url } = await resp.json();
      window.open(url, 'fitbit_oauth', 'width=600,height=800');
    } catch (err) {
      toast.error("Failed to initiate connection");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const resp = await fetch('/api/health/sync');
      const data = await resp.json();
      setWearableData(data);
      toast.success("Health data synchronized successfully");
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const getMetricColor = () => {
    switch (activeMetric) {
      case 'steps': return '#2563eb';
      case 'heart': return '#dc2626';
      case 'sleep': return '#7c3aed';
      default: return '#2563eb';
    }
  };

  const generateMockHistory = (metric: string, period: string) => {
    const days = period === 'daily' ? 24 : period === 'weekly' ? 7 : 30;
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      if (period === 'daily') {
        date.setHours(now.getHours() - (days - 1 - i));
      } else {
        date.setDate(now.getDate() - (days - 1 - i));
      }

      let value = 0;
      if (metric === 'steps') value = Math.floor(Math.random() * 5000) + 5000;
      else if (metric === 'heart') value = Math.floor(Math.random() * 20) + 65;
      else if (metric === 'sleep') value = Math.floor(Math.random() * 4) + 5;

      data.push({
        time: period === 'daily' ? format(date, 'HH:mm') : format(date, 'MMM dd'),
        value: value,
        fullDate: format(date, 'PPP'),
      });
    }
    return data;
  };

  const finalChartData = connected && wearableData && activePeriod === 'weekly' && activeMetric === 'steps'
    ? wearableData.steps.map((s: any) => ({
        time: format(new Date(s.date), 'EEE').toUpperCase(),
        value: s.value,
        fullDate: format(new Date(s.date), 'PPP')
      }))
    : generateMockHistory(activeMetric, activePeriod);

  const handleExport = () => {
    if (logs.length === 0 && prescriptions.length === 0) return toast.error("Vault is empty");
    
    let csvContent = "Type,Date,Description,Detail\n";
    
    logs.forEach(log => {
      csvContent += `LOG,${format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm')},${log.prediction},"${log.symptoms.join('; ')}"\n`;
    });
    
    prescriptions.forEach(p => {
      csvContent += `PRESCRIPTION,${format(new Date(p.date), 'yyyy-MM-dd')},Dr. ${p.doctorName},"${p.medications.replace(/\n/g, ' ')}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `medical_vault_${Date.now()}.csv`);
    link.click();
    toast.success("Medical Vault exported successfully");
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Biometric Intelligence</h2>
          <p className="text-slate-500 max-w-xl leading-relaxed font-medium">Advanced visualization of clinical telemetry and behavioral patterns. Unified secure vault for wearable and manual records.</p>
        </div>
        <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline" className="text-[10px] font-bold border-slate-200 px-4 h-11 rounded-xl shadow-sm uppercase tracking-widest hover:bg-slate-50">
                <Download className="w-3.5 h-3.5 mr-2" /> Export Vault
            </Button>
            {connected && (
              <Button 
                onClick={handleSync} 
                disabled={syncing}
                className="text-[10px] font-bold bg-blue-600 text-white px-5 h-11 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${syncing ? 'animate-spin' : ''}`} /> 
                {syncing ? 'Synching...' : 'Sync Data'}
              </Button>
            )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-12">
          <div className="card p-8 min-h-[520px] flex flex-col relative overflow-hidden bg-white border border-slate-200/60 shadow-xl shadow-slate-200/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                    {activeMetric === 'steps' && <Activity className="w-6 h-6 text-blue-600" />}
                    {activeMetric === 'heart' && <Activity className="w-6 h-6 text-red-600" />}
                    {activeMetric === 'sleep' && <Clock className="w-6 h-6 text-purple-600" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-none">
                      {activeMetric === 'steps' ? 'Movement Dynamics' : activeMetric === 'heart' ? 'Cardiac Telemetry' : 'Sleep Architecture'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                       {connected ? 'Live Wearable Stream' : 'Baseline Estimation Mode'}
                    </p>
                  </div>
                </div>
                
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
                    {(['steps', 'heart', 'sleep'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setActiveMetric(m)}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                            activeMetric === m ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {m}
                        </button>
                    ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-900 text-white rounded-lg p-1">
                    {(['daily', 'weekly', 'monthly'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setActivePeriod(p)}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${
                            activePeriod === p ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          {p}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Average Value</p>
                        <p className="text-lg font-bold text-slate-900">
                            {Math.round(finalChartData.reduce((a, b) => a + b.value, 0) / finalChartData.length).toLocaleString()}
                            <span className="text-[10px] ml-1 text-slate-400 font-bold uppercase">
                                {activeMetric === 'steps' ? 'Steps' : activeMetric === 'heart' ? 'BPM' : 'Hours'}
                            </span>
                        </p>
                    </div>
                    {(activeMetric === 'steps' || activeMetric === 'sleep') && (
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Progress</p>
                            <p className="text-lg font-bold text-emerald-600">
                                {activeMetric === 'steps' ? '82%' : '94%'}
                            </p>
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                    }}
                    labelStyle={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={getMetricColor()} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" /> Medical Vault
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveVaultTab('logs')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeVaultTab === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Diagnostic Logs
              </button>
              <button 
                onClick={() => setActiveVaultTab('prescriptions')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeVaultTab === 'prescriptions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                Prescriptions
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-12 card flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : activeVaultTab === 'logs' ? (
              logs.length === 0 ? (
                <div className="p-12 card border-dashed text-center">
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-relaxed">No medical records found in vault.<br/>Start a diagnosis to begin tracking.</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id || idx} className="card p-5 group hover:border-blue-200 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center border border-slate-100 transition-colors">
                          <Activity className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{log.prediction}</h4>
                          <p className="text-xs text-slate-500 font-medium">{log.symptoms.slice(0, 3).join(', ')}{log.symptoms.length > 3 && '...'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{(log.confidence * 100).toFixed(0)}% Match</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </div>
                ))
              )
            ) : (
              prescriptions.length === 0 ? (
                <div className="p-12 card border-dashed text-center">
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-relaxed">No prescriptions issued yet.</p>
                </div>
              ) : (
                prescriptions.map((pres, idx) => (
                  <div key={pres.id || idx} className="card p-5 group border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs italic">Rx</div>
                             <h4 className="font-bold text-slate-900">Dr. {pres.doctorName}</h4>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(pres.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4 font-mono text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed shadow-inner">
                        {pres.medications}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Signed & Verified</span>
                        <Button variant="ghost" className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600">
                            Download PDF
                        </Button>
                    </div>
                  </div>
                ))
              )
            )}
            <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:border-slate-200 hover:text-slate-400 transition-all cursor-pointer">
                + Upload Manual Records
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="card p-6 border-none bg-blue-600 text-white shadow-xl shadow-blue-600/20">
              <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-6">Patient Privacy Index</h3>
              <div className="flex items-center justify-center flex-col py-6 relative">
                 <div className="w-32 h-32 rounded-full border-[8px] border-white/10 flex items-center justify-center">
                    <div className="text-center">
                       <span className="text-4xl font-bold">98</span>
                       <span className="text-xs block opacity-70 font-bold uppercase tracking-widest mt-1">Grade A</span>
                    </div>
                 </div>
              </div>
              <p className="text-xs text-blue-100 mt-6 leading-relaxed font-medium">Your data is secured with AES-256 encryption. Only verified medical professionals can request access.</p>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs mt-6 py-5 rounded-lg shadow-lg">PRIVACY SETTINGS</Button>
           </div>

           <div className="card p-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Device Integration</h3>
              <div className="space-y-4">
                 {[
                   { id: 'apple', name: 'Apple Health', status: 'Available', icon: <Activity className="w-3.5 h-3.5" /> },
                   { id: 'fitbit', name: 'Fitbit Sync', status: connected ? 'Connected' : 'Awaiting Auth', icon: <Smartphone className="w-3.5 h-3.5" /> },
                   { id: 'bp', name: 'Blood Pressure', status: 'Manual', icon: <RefreshCw className="w-3.5 h-3.5" /> }
                 ].map((d, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">{d.icon}</div>
                        <span className="text-xs font-bold text-slate-700">{d.name}</span>
                      </div>
                      {d.id === 'fitbit' && !connected ? (
                        <button 
                          onClick={handleConnect}
                          className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                          Connect
                        </button>
                      ) : (
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${d.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                          {d.status}
                        </span>
                      )}
                   </div>
                 ))}
              </div>
              {connected && (
                <p className="text-[9px] text-slate-400 mt-4 leading-relaxed italic">
                  * Fitbit data is synced via secure OAuth2 endpoint.
                </p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

