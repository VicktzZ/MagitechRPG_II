import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Firebase Auth do navegador. O login do app continua sendo o NextAuth; o
 * FirebaseAuthBridge troca a sessão do NextAuth por um token customizado
 * (/api/firebase/token) para que as regras do Firestore saibam quem é o usuário.
 */
export const auth = getAuth(app);

// Desenvolvimento local contra os emuladores do Firebase (firebase emulators:start).
// O servidor usa FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST (lidos pelo Admin SDK).
if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true') {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
