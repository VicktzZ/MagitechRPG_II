import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// Removido Analytics temporariamente para evitar problemas de instalação
// export let analytics: ReturnType<typeof getAnalytics> | undefined;
// if (typeof window !== 'undefined') {
//     isSupported()
//         .then((supported) => {
//             if (supported) {
//                 analytics = getAnalytics(app);
//             }
//         })
//         .catch(() => {
//             // silenciosamente ignora quando não suportado
//         });
// }