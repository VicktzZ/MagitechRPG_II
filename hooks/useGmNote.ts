'use client';

import { db } from '@utils/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';

export interface GmNoteState {
    /** Texto salvo da anotação (vazio se ainda não há) */
    text: string;
    /** Ainda não chegou a primeira leitura */
    loading: boolean;
    /** Falha ao ler (sem permissão, sem conexão...): não se deve gravar por cima de algo que não deu para ler */
    error: Error | null;
}

/**
 * Anotação privada do mestre sobre uma ficha, em tempo real: campaigns/{campaignId}/gmNotes/{charsheetId}.
 * As regras do Firestore só deixam o mestre da campanha ler; abre o listener só depois do login no Firebase.
 */
export function useGmNote(campaignId: string | undefined, charsheetId: string | undefined): GmNoteState {
    const { ready: authReady, uid } = useFirebaseAuth();
    const [ state, setState ] = useState<GmNoteState>({ text: '', loading: true, error: null });

    useEffect(() => {
        setState({ text: '', loading: true, error: null });
        if (!campaignId || !charsheetId || !authReady) return;

        return onSnapshot(
            doc(db, 'campaigns', campaignId, 'gmNotes', charsheetId),
            snapshot => {
                const data = snapshot.data() as { text?: unknown } | undefined;
                setState({ text: typeof data?.text === 'string' ? data.text : '', loading: false, error: null });
            },
            error => {
                console.error('[Anotações] Erro ao ler a anotação do mestre:', error);
                setState({ text: '', loading: false, error });
            }
        );
    }, [ campaignId, charsheetId, authReady, uid ]);

    return state;
}
