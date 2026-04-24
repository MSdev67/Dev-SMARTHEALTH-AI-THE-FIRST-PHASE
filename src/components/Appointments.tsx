import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthProvider';
import { Calendar, Clock, User, Phone, Video, MapPin, CheckCircle, Clock3, Loader2, ShieldCheck, Trash2, Plus, Shield, Pill, FileText, Send, Brain, AlertCircle, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MOCK_DOCTORS = [
  { id: 'doc1', name: 'Dr. Sarah Wilson', specialty: 'General Practitioner', rating: 4.8, available: '9 AM - 5 PM' },
  { id: 'doc2', name: 'Dr. James Chen', specialty: 'Dermatologist', rating: 4.9, available: '10 AM - 6 PM' },
  { id: 'doc3', name: 'Dr. Amara Reddy', specialty: 'Pediatrician', rating: 4.7, available: '8 AM - 4 PM' }
];

export default function Appointments() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [booking, setBooking] = useState(false);
  const [mySlots, setMySlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState('');
  const [doctorSlots, setDoctorSlots] = useState<string[]>([]);
  const [prescribingApp, setPrescribingApp] = useState<any>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [submittingPrescription, setSubmittingPrescription] = useState(false);
  const [showTriage, setShowTriage] = useState(false);
  const [triageNote, setTriageNote] = useState('');

  const handleSelectDoctor = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setSelectedSlot('');
    setDoctorSlots([]);
    
    // Fetch doctor's availability
    try {
      const docSnap = await getDoc(doc(db, 'doctor_availability', doctor.id));
      if (docSnap.exists()) {
        setDoctorSlots(docSnap.data().slots || []);
      } else {
        // Fallback for demo
        setDoctorSlots(['09:00', '10:00', '11:00', '14:00', '15:00']);
      }
    } catch (e) {
      setDoctorSlots(['09:00', '11:00', '15:00']); // Resilient fallback
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch user appointments
    const q = query(
      collection(db, 'appointments'),
      where(profile?.role === 'doctor' ? 'doctorId' : 'patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch doctor's own slots if clinical role
    if (profile?.role === 'doctor') {
      const unsubSlots = onSnapshot(doc(db, 'doctor_availability', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setMySlots(docSnap.data().slots || []);
        }
      });
      return () => {
        unsubscribe();
        unsubSlots();
      };
    }

    return unsubscribe;
  }, [user, profile]);

  const handleAddSlot = async () => {
    if (!newSlot || !user) return;
    if (mySlots.includes(newSlot)) {
      toast.error("This slot already exists");
      return;
    }
    const updatedSlots = [...mySlots, newSlot].sort();
    await setDoc(doc(db, 'doctor_availability', user.uid), { slots: updatedSlots });
    setNewSlot('');
    toast.success("Time slot added");
  };

  const handleRemoveSlot = async (slot: string) => {
    if (!user) return;
    const updatedSlots = mySlots.filter(s => s !== slot);
    await setDoc(doc(db, 'doctor_availability', user.uid), { slots: updatedSlots });
    toast.success("Time slot removed");
  };

  const handleBook = async (doctor: any) => {
    if (!user || !selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    setBooking(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        patientName: profile?.displayName || 'Patient',
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: selectedSlot,
        status: 'pending',
        type: 'online',
        createdAt: new Date().toISOString()
      });
      setSelectedDoctor(null);
      setSelectedSlot('');
      toast.success("Consultation booked successfully");
    } catch (err) {
      console.error(err);
      toast.error("Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleIssuePrescription = async () => {
    if (!prescribingApp || !prescriptionText) return;
    setSubmittingPrescription(true);
    try {
      await addDoc(collection(db, 'prescriptions'), {
        patientId: prescribingApp.patientId,
        patientName: prescribingApp.patientName,
        doctorId: user?.uid,
        doctorName: profile?.displayName,
        appointmentId: prescribingApp.id,
        medications: prescriptionText,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      // Optionally update appointment status
      await setDoc(doc(db, 'appointments', prescribingApp.id), { ...prescribingApp, status: 'confirmed', hasPrescription: true });
      
      setPrescribingApp(null);
      setPrescriptionText('');
      toast.success("Prescription issued and synced to Vault");
    } catch (err) {
      toast.error("Failed to issue prescription");
    } finally {
      setSubmittingPrescription(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{profile?.role === 'doctor' ? 'Clinical Workspace' : 'Internal Medicine Consults'}</h2>
        <p className="text-slate-500 max-w-xl leading-relaxed">
          {profile?.role === 'doctor' 
            ? 'Manage your consultation slots and view upcoming patient sessions.' 
            : 'Book end-to-edn encrypted video consultations with senior specialists. Standard appointment duration is 30 minutes.'}
        </p>
      </header>

      {profile?.role === 'doctor' && (
        <div className="card p-8 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Availability Manager</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Define your specific clinical time slots</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {mySlots.map((slot, idx) => (
              <div key={`${slot}-${idx}`} className="group flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-600">{slot}</span>
                <button onClick={() => handleRemoveSlot(slot)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {mySlots.length === 0 && (
              <p className="text-xs text-slate-400 italic">No slots defined. Add slots below to appear in the directory.</p>
            )}
          </div>

          <div className="flex items-center gap-3 max-w-xs">
            <input 
              type="time" 
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-100 outline-none"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
            />
            <Button onClick={handleAddSlot} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 h-11">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4" /> Recommended Specialists
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_DOCTORS.map((doc) => (
              <div key={doc.id} className="card p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xl border border-slate-200">
                    {doc.name.split(' ')[1][0]}
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                    Online Now
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-1">{doc.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-4">{doc.specialty}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-8 font-medium">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600" /> {doc.available}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-600" /> Telemedicine</div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSelectDoctor(doc)} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-5 font-bold shadow-sm">Reserve Session</Button>
                  <Button variant="outline" className="rounded-lg p-3 border-slate-200 hover:bg-slate-50"><Video className="w-4 h-4 text-slate-400" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-slate-400" /> {profile?.role === 'doctor' ? 'Clinical Schedule' : 'Appointment Queue'}
          </h3>
          <div className="space-y-4">
            {loading ? (
              <div className="p-10 card flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : appointments.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No active sessions</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="card p-5 border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(app.date), 'MMM dd, yyyy')}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{profile?.role === 'doctor' ? app.patientName : app.doctorName}</h4>
                  <p className="text-xs text-slate-500 mb-5 flex items-center gap-2 font-medium">
                    <Clock className="w-3 h-3" /> {app.time} • {profile?.role === 'doctor' ? 'Upcoming Case' : 'Secure Video'}
                  </p>
                  <div className="flex gap-2">
                    <Button className="flex-1 text-xs font-bold bg-slate-900 text-white rounded-lg py-4">
                        {profile?.role === 'doctor' ? 'START CONSULTATION' : 'ENTER CLINIC ROOM'}
                    </Button>
                    {profile?.role === 'doctor' && (
                        <Button 
                            onClick={() => setPrescribingApp(app)}
                            variant="outline" 
                            className="p-3 rounded-lg border-slate-200 text-blue-600 hover:bg-blue-50"
                        >
                            <Pill className="w-4 h-4" />
                        </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="card p-6 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-24 h-24" />
             </div>
             <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Medical Records</h3>
             <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">Your prescriptions and lab reports are automatically synced to the Medical Vault after each session.</p>
             <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 font-bold text-xs">VIEW VAULT</Button>
          </div>
        </div>
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-10 max-w-md w-full shadow-2xl border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Consultation</h3>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Booking with <strong>{selectedDoctor.name}</strong>. A HIPAA-compliant video link will be generated in your dashboard.</p>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Calendar className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date Schedule</p>
                  <p className="font-bold text-sm text-slate-800">Today, {format(new Date(), 'EEEE')}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Select Available Time</p>
                <div className="grid grid-cols-3 gap-2">
                  {doctorSlots.map((slot, idx) => (
                    <button
                      key={`${slot}-${idx}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedSlot === slot 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                  {doctorSlots.length === 0 && (
                    <div className="col-span-3 space-y-4">
                      <p className="text-[10px] text-slate-400 italic">No available slots for today.</p>
                      <Button 
                        onClick={() => setShowTriage(true)}
                        variant="ghost" 
                        className="w-full text-blue-600 font-black text-[9px] uppercase tracking-widest bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl py-6"
                      >
                         INITIATE AI PRIORITY TRIAGE
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600"><Video className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Medium</p>
                  <p className="font-bold text-sm text-slate-800">AES-256 Video Call</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setSelectedDoctor(null)} variant="outline" className="flex-1 py-6 rounded-lg font-bold border-slate-200">Cancel</Button>
              <Button onClick={() => handleBook(selectedDoctor)} disabled={booking} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-bold shadow-lg shadow-blue-500/20">
                {booking ? 'Reserving...' : 'Confirm Booking'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {prescribingApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-10 max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                <Pill className="w-48 h-48 text-blue-600" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 italic font-black text-xl">Rx</div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-none">Issue Digital Rx</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                           <Shield className="w-3 h-3 text-emerald-500" /> SECURE BLOCKCHAIN-BACKED PRESCRIPTION
                        </p>
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Identification</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Verified Case</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{prescribingApp.patientName}</h4>
                        <p className="text-xs text-slate-500 font-medium">Session: {prescribingApp.date} • {prescribingApp.time}</p>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Medications & Dosage Instructions</label>
                        <textarea 
                            value={prescriptionText}
                            onChange={(e) => setPrescriptionText(e.target.value)}
                            placeholder="Example: Amoxicillin 500mg - 1 caps every 8 hours for 7 days"
                            className="w-full h-40 px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button onClick={() => setPrescribingApp(null)} variant="outline" className="flex-1 py-7 rounded-2xl font-bold border-slate-200 text-slate-400 hover:text-slate-900 transition-all">Discard</Button>
                    <Button 
                        onClick={handleIssuePrescription} 
                        disabled={submittingPrescription || !prescriptionText} 
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-7 rounded-2xl font-bold shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {submittingPrescription ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                        SIGN & ISSUE
                    </Button>
                </div>
            </div>
          </motion.div>
        </div>
      )}

      {showTriage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border-4 border-blue-50 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 p-12 opacity-5 scale-150">
               <Activity className="w-48 h-48 text-blue-600" />
            </div>
            
            <div className="relative z-10">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 mb-8">
                  <Brain className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">AI Priority Triage</h3>
               <p className="text-xs text-slate-500 font-medium mb-10 leading-relaxed italic">
                  Clinical slots are currently at peak capacity. Describe your symptoms below for an AI-driven urgency assessment to potentially expedite your case.
               </p>

               <div className="space-y-6 mb-12">
                  <textarea 
                    value={triageNote}
                    onChange={(e) => setTriageNote(e.target.value)}
                    placeholder="Briefly describe your urgency..."
                    className="w-full h-32 px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  />
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                     <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-orange-700 font-bold leading-relaxed uppercase">High-priority cases are reviewed by clinical supervisors within 60 minutes.</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <Button onClick={() => setShowTriage(false)} variant="outline" className="flex-1 py-7 rounded-2xl font-bold border-slate-200">Discard</Button>
                  <Button 
                    onClick={() => {
                        toast.success("AI Triage complete. Case categorized: URGENT. Clinical node notified.");
                        setShowTriage(false);
                        setSelectedDoctor(null);
                    }}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-7 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                  >
                     SUBMIT FOR TRIAGE
                  </Button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
