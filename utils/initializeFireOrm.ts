import admin from 'firebase-admin';
import { initialize } from 'fireorm';

let fireormInitialized = false;

export function initFirebaseAdmin() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                })
            });
            console.log('[Firebase Admin] Inicializado. ✅');
        } catch (error) {
            console.error('[Firebase Admin] Erro ao inicializar Firebase Admin:', error);
        }
    } else {
        console.log('[Firebase Admin] Já inicializado, pulando.');
    }

    if (!fireormInitialized) {
        try {
            const firestore = admin.firestore();
            initialize(firestore);
            fireormInitialized = true;
            console.log('FireORM inicializado.');
        } catch (error: any) {
            // O FireORM pode dar erro se já foi inicializado
            if (!error.message.includes('already been initialized')) {
                console.error('Erro ao inicializar FireORM:', error);
            }
        }
    } else {
        console.log('FireORM já inicializado, pulando.');
    }
}