import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigValid } from './firebase';
import { storage } from './storage';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUpEmail: (email: string, pass: string, data: any) => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const isCloudActive = isFirebaseConfigValid();

  useEffect(() => {
    if (!isCloudActive) {
      // Simulation for Localized Mode
      const localUser = localStorage.getItem('smarthealth_session_user');
      if (localUser) {
        const parsed = JSON.parse(localUser);
        setUser(parsed);
        storage.get('users', parsed.uid).then(p => setProfile(p));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            storage.save('users', currentUser.uid, data); // Sync to local
          } else {
            const newProfile = {
              userId: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Guest',
              role: 'patient',
              language: 'en',
              phone: '',
              bloodGroup: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
            storage.save('users', currentUser.uid, newProfile);
          }
        } catch (e) {
          console.warn("Cloud Sync Deferred:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isCloudActive]);

  const signIn = async () => {
    if (!isCloudActive) {
      const demoUser = { uid: 'demo_user_123', email: 'vibe@smarthealth.ai', displayName: 'Clinical User' };
      localStorage.setItem('smarthealth_session_user', JSON.stringify(demoUser));
      setUser(demoUser as any);
      const demoProfile = await storage.get('users', 'demo_user_123') || {
        userId: 'demo_user_123',
        email: 'vibe@smarthealth.ai',
        displayName: 'Clinical User',
        role: 'patient',
        createdAt: new Date().toISOString()
      };
      setProfile(demoProfile);
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInEmail = async (email: string, pass: string) => {
    if (!isCloudActive) {
      const demoUser = { uid: 'demo_user_email', email: email, displayName: email.split('@')[0] };
      localStorage.setItem('smarthealth_session_user', JSON.stringify(demoUser));
      setUser(demoUser as any);
      const demoProfile = await storage.get('users', 'demo_user_email') || {
        userId: 'demo_user_email',
        email: email,
        displayName: email.split('@')[0],
        role: 'patient',
        createdAt: new Date().toISOString()
      };
      setProfile(demoProfile);
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpEmail = async (email: string, pass: string, data: any) => {
    if (!isCloudActive) {
      const demoUser = { uid: 'demo_user_new', email, displayName: data.fullName };
      localStorage.setItem('smarthealth_session_user', JSON.stringify(demoUser));
      setUser(demoUser as any);
      const newProfile = {
        userId: 'demo_user_new',
        email,
        displayName: data.fullName,
        phone: data.phone,
        bloodGroup: data.bloodGroup || '',
        role: data.role || 'patient',
        createdAt: new Date().toISOString()
      };
      await storage.save('users', 'demo_user_new', newProfile);
      setProfile(newProfile);
      return;
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: data.fullName });
    
    const newProfile = {
      userId: res.user.uid,
      email: email,
      displayName: data.fullName,
      phone: data.phone,
      bloodGroup: data.bloodGroup || '',
      role: data.role || 'patient',
      language: 'en',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', res.user.uid), newProfile);
    setProfile(newProfile);
    storage.save('users', res.user.uid, newProfile);
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    if (isCloudActive) {
      await updateDoc(doc(db, 'users', user.uid), data);
    }
    const updated = { ...profile, ...data };
    setProfile(updated);
    storage.save('users', user.uid, updated);
  };

  const logout = async () => {
    localStorage.removeItem('smarthealth_session_user');
    if (isCloudActive) await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInEmail, signUpEmail, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
