'use client';

import { sanitizeHiddenNotices, type HiddenNotice } from '@utils/combat/awarenessSecrets';
import { db } from '@utils/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';

const NONE: HiddenNotice[] = [];

/**
 * O que o servidor deixou para o jogador saber da matriz de percepção (que é do mestre): de quem o personagem dele está fora da vista. Mora em
 * `campaigns/{campaignId}/playerData/{userId}`; as regras do Firestore só deixam o próprio usuário ler, e o documento só existe enquanto ele está escondido de alguém.
 * Só abre o listener com `enabled` (jogador, em combate) e depois do login no Firebase.
 */
export function usePlayerAwareness({ campaignId, enabled }: { campaignId: string | undefined; enabled: boolean }): HiddenNotice[] {
    const { ready: authReady, uid } = useFirebaseAuth();
    const [ notices, setNotices ] = useState<HiddenNotice[]>(NONE);

    useEffect(() => {
        setNotices(NONE);
        if (!campaignId || !enabled || !authReady || !uid) return;

        return onSnapshot(
            doc(db, 'campaigns', campaignId, 'playerData', uid),
            snapshot => {
                const data = snapshot.data() as { kind?: unknown; hiddenFrom?: unknown } | undefined;
                setNotices(data?.kind === 'awareness' ? sanitizeHiddenNotices(data.hiddenFrom) : NONE);
            },
            failure => {
                // Sem a regra publicada ou sem conexão: o jogador só fica sem o aviso (é um lembrete, não uma regra)
                console.error('[Jogador] Erro ao ler o que o mestre deixou sobre a sua percepção:', failure);
                setNotices(NONE);
            }
        );
    }, [ campaignId, enabled, authReady, uid ]);

    return notices;
}
