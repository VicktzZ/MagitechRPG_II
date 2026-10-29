import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { auth } from '@utils/database';
import { isFirebaseAuthReady, subscribeFirebaseAuthReady } from '@utils/firebaseAuth';

/**
 * Estado da autenticação do navegador no Firebase.
 * - ready: o FirebaseAuthBridge já decidiu (entrou, não há sessão ou falhou)
 * - uid: usuário autenticado no Firebase, ou null
 *
 * Os hooks de tempo real só abrem listeners com `ready` e reabrem quando o
 * `uid` muda — com as regras exigindo login, um listener aberto antes da
 * autenticação seria recusado e encerrado.
 */
export function useFirebaseAuth(): { ready: boolean, uid: string | null } {
    const ready = useSyncExternalStore(subscribeFirebaseAuthReady, isFirebaseAuthReady, () => false);
    // Começa em null (igual ao render do servidor); onAuthStateChanged entrega o estado real logo em seguida
    const [ uid, setUid ] = useState<string | null>(null);

    useEffect(() => onAuthStateChanged(auth, user => { setUid(user?.uid ?? null); }), []);

    return { ready, uid };
}
