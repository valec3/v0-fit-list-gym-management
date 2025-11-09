import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore/lite";
const firebaseConfig = {
  apiKey: "AIzaSyA85I92k5V4C5FQr3U_oUGokyQBZHA4uu4",
  authDomain: "gym-app-b17c5.firebaseapp.com",
  projectId: "gym-app-b17c5",
  storageBucket: "gym-app-b17c5.firebasestorage.app",
  messagingSenderId: "97990114381",
  appId: "1:97990114381:web:dffc3a8c759c303ae0b004",
  measurementId: "G-4G22TEQ0D3",
};

// Initialize Firebase app safely (avoid double-init across module reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics requires a browser environment — only initialize when window is available
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // analytics may fail in non-browser or restricted environments; keep it optional
    analytics = undefined;
  }
}

const db = getFirestore(app);

export { app, analytics, db };
