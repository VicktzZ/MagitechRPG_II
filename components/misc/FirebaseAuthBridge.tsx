'use client';

import { signInWithCustomToken, signOut } from 'firebase/auth';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { auth } from '@utils/database';
import { isAdminEmail } from '@utils/adminCheck';
import { markFirebaseAuthReady } from '@utils/firebaseAuth';

/**
 * Mantém o Firebase Auth do navegador em sincronia com a sessão do NextAuth:
 * - logado no app → entra no Firebase com um token customizado emitido pelo
 *   servidor (/api/firebase/token), com uid = id do usuário no banco;
 * - deslogado → sai do Firebase.
 * As regras do Firestore usam esse uid (request.auth.uid) para decidir o acesso.
 *
 * Em caso de falha o bridge também se marca como pronto: os listeners seguem
 * sem autenticação em vez de travar a tela (as regras é que decidem o acesso).
 */
export function FirebaseAuthBridge(): null {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    const shouldBeAdmin = isAdminEmail(session?.user?.email);

    useEffect(() => {
        if (status === 'loading') return;
        let cancelled = false;

        void (async () => {
            // Restaura o login persistido (IndexedDB) antes de decidir se precisa de outro
            await auth.authStateReady();
            if (cancelled) return;

            if (status !== 'authenticated' || !userId) {
                if (auth.currentUser) await signOut(auth);
                return;
            }

            if (auth.currentUser?.uid === userId) {
                // Mesmo usuário: só renova se a permissão de admin no token estiver desatualizada
                const { claims } = await auth.currentUser.getIdTokenResult();
                if (Boolean(claims['admin']) === shouldBeAdmin) return;
            }

            const response = await fetch('/api/firebase/token', { method: 'POST' });
            if (!response.ok) {
                throw new Error(`Falha ao obter token do Firebase (${response.status})`);
            }
            const { token } = await response.json() as { token: string };
            if (!cancelled) await signInWithCustomToken(auth, token);
        })()
            .catch(error => {
                console.error('[FirebaseAuthBridge] Não foi possível autenticar no Firebase:', error);
            })
            .finally(() => {
                if (!cancelled) markFirebaseAuthReady();
            });

        return () => { cancelled = true; };
    }, [ status, userId, shouldBeAdmin ]);

    return null;
}
