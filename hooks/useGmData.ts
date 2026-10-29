'use client';

import { creatureDefensesFromDocs, type CreatureDefenses, type GmDataDoc } from '@utils/combat/creatureSecrets';
import { db } from '@utils/database';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';

const NO_DEFENSES: Record<string, CreatureDefenses> = {};

export interface GmData {
    /** Defesas das criaturas (elemento, fraquezas, resistências), por id da criatura; só as que já têm documento privado */
    creatureDefenses: Record<string, CreatureDefenses>;
    /** Falha ao ler (sem permissão, sem conexão...): as criaturas ficam com o que o documento da campanha traz */
    error: Error | null;
}

/**
 * Os dados privados do mestre em tempo real: campaigns/{campaignId}/gmData. As regras do Firestore só deixam o mestre da campanha ler, então
 * só abre o listener com `enabled` (o usuário é o mestre) e depois do login no Firebase. Uma subcoleção, um listener: cada tipo de dado
 * (`kind`) sai da mesma escuta.
 */
export function useGmData({ campaignId, enabled }: { campaignId: string | undefined; enabled: boolean }): GmData {
    const { ready: authReady, uid } = useFirebaseAuth();
    const [ docs, setDocs ] = useState<readonly GmDataDoc[]>([]);
    const [ error, setError ] = useState<Error | null>(null);

    useEffect(() => {
        setDocs([]);
        setError(null);
        if (!campaignId || !enabled || !authReady) return;

        return onSnapshot(
            collection(db, 'campaigns', campaignId, 'gmData'),
            snapshot => {
                setError(null);
                setDocs(snapshot.docs.map(each => ({ id: each.id, data: each.data() as Record<string, unknown> })));
            },
            failure => {
                console.error('[Mestre] Erro ao ler os dados privados do mestre:', failure);
                setError(failure);
            }
        );
    }, [ campaignId, enabled, authReady, uid ]);

    const creatureDefenses = useMemo(() => (docs.length === 0 ? NO_DEFENSES : creatureDefensesFromDocs(docs)), [ docs ]);
    return useMemo(() => ({ creatureDefenses, error }), [ creatureDefenses, error ]);
}
