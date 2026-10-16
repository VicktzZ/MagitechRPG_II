import { useSession } from 'next-auth/react';
import type { User } from '@models/entities';
import { useFirestoreRealtime } from './useFirestoreRealtime';

/**
 * Documento do usuário logado, em tempo real. Lê só o próprio documento — a
 * coleção `users` tem e-mails e assinaturas de todos e não é legível por
 * outros usuários nas regras do Firestore.
 */
export function useCurrentUserDoc(): { user: User | null, loading: boolean } {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const { data, loading } = useFirestoreRealtime('user', {
        filters: userId ? [ { field: 'id', operator: '==', value: userId } ] : undefined,
        enabled: !!userId
    });

    return { user: data?.[0] ?? null, loading };
}
