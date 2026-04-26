import admin from 'firebase-admin';
import { initialize } from 'fireorm';

let fireormInitialized = false;

export function initFirebaseAdmin() {
    if (!admin.apps.length) {
        try {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

            if (!projectId || !clientEmail || !privateKeyRaw) {
                throw new Error(
                    `[Firebase Admin] Variáveis de ambiente ausentes: ${
                        [
                            !projectId && 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
                            !clientEmail && 'FIREBASE_CLIENT_EMAIL',
                            !privateKeyRaw && 'FIREBASE_PRIVATE_KEY'
                        ].filter(Boolean).join(', ')
                    }`
                );
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKeyRaw.replace(/\\n/g, '\n')
                })
            });
            console.log('[Firebase Admin] Inicializado. ✅');
        } catch (error) {
            console.error('[Firebase Admin] Erro ao inicializar Firebase Admin:', error);
            // NÃO engolir: rethrow para impedir que o fireorm tente seguir em frente
            // sem firestore válido (causa do erro "Firestore must be initialized first").
            throw error;
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
            // O FireORM pode dar erro se já foi inicializado (HMR do Next dev recarrega
            // este módulo mas mantém o metadata global). Nesse caso já está pronto.
            if (error?.message?.includes?.('already been initialized')) {
                fireormInitialized = true;
                console.log('FireORM já estava inicializado (reaproveitando metadata).');
            } else {
                console.error('Erro ao inicializar FireORM:', error);
                throw error;
            }
        }
    } else {
        console.log('FireORM já inicializado, pulando.');
    }
}