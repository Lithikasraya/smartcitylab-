// Real Firebase client configuration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyD3MlHI4o6ykz5INBrC7n7-DSs52nz5Eus",
  authDomain: "sclv2-9c3c3.firebaseapp.com",
  projectId: "sclv2-9c3c3",
  storageBucket: "sclv2-9c3c3.firebasestorage.app",
  messagingSenderId: "671157613719",
  appId: "1:671157613719:web:d9baeb39488c1b22f625d2",
  measurementId: "G-BNENDR6468"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const isFirebaseConfigured = true;

export default app;