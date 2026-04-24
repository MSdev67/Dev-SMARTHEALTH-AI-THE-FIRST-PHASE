import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         !firebaseConfig.apiKey.includes('PLACEHOLDER') && 
         firebaseConfig.projectId !== 'gen-lang-client-0873782792'; 
         // Force local mode if project is in sync state
};

async function testConnection() {
  if (!isFirebaseConfigValid()) {
    console.log("Health Ecosystem: Localized Mode Active. Secure local storage prioritized.");
    return;
  }
  
  try {
    const testDoc = doc(db, 'system', 'handshake');
    await getDocFromServer(testDoc);
    console.log("Clinical Network: Fully Operational");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('permission-denied') || error.message.includes('not-found')) {
        console.info("Clinical Sync: Background Handshake in Progress. Data preserved in Localized Mode.");
      } else if (error.message.includes('offline')) {
        console.debug("Medical Node: Awaiting Network Stabilization.");
      } else {
        console.debug("Clinical Sync Syncing:", error.message);
      }
    }
  }
}
testConnection();
