import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";

// Initialize Firebase
let app: FirebaseApp | null;
let auth: Auth;

if (typeof window !== "undefined" && !firebaseConfig.apiKey) {
    console.warn("Firebase API keys are missing. Authentication will not work.");
}

if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} else {
    // Mock for build/dev without keys
    app = null;
    auth = {
        currentUser: null,
        onAuthStateChanged: () => () => { },
        signInWithPopup: () => Promise.reject("No API Key"),
        signOut: () => Promise.resolve()
    } as any;
}

export { app, auth };
