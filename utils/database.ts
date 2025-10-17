import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
// Inicializa Analytics apenas no browser e quando suportado
export let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined') {
    // Evita falhas em ambientes sem suporte (ex.: SSR/Node)
    isSupported()
        .then((supported) => {
            if (supported) {
                analytics = getAnalytics(app);
            }
        })
        .catch(() => {
            // silenciosamente ignora quando não suportado
        });
}