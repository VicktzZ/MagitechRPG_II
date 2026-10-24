import {
    parsePendingSpellEffects,
    pendingEffectsStorageKey,
    withoutPendingEffect,
    withPendingEffect,
    type PendingSpellEffects
} from '@utils/pendingSpellEffects';
import type { SpellStage } from '@utils/spellStages';
import { useCallback, useEffect, useState } from 'react';

interface PendingSpellEffectsApi {
    /** Magia (por id ou nome) → estágio conjurado com sucesso que ainda não foi efetuado */
    pending: PendingSpellEffects;
    markPending: (spellKey: string, stage: SpellStage) => void;
    clearPending: (spellKey: string) => void;
}

const read = (key: string): PendingSpellEffects => {
    try {
        return parsePendingSpellEffects(window.localStorage.getItem(key));
    } catch {
        return {};
    }
};

const write = (key: string, pending: PendingSpellEffects): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(pending));
    } catch {
        // Sem armazenamento (janela privada, dados bloqueados): o botão só vale até recarregar a página
    }
};

/** As magias que o jogador conjurou com sucesso e ainda vai efetuar; lido depois da montagem, para não divergir do servidor */
export function usePendingSpellEffects(campaignId: string | undefined, charsheetId: string | undefined): PendingSpellEffectsApi {
    const key = campaignId && charsheetId ? pendingEffectsStorageKey(campaignId, charsheetId) : null;
    const [ pending, setPending ] = useState<PendingSpellEffects>({});

    useEffect(() => {
        setPending(key ? read(key) : {});
    }, [ key ]);

    const update = useCallback((change: (current: PendingSpellEffects) => PendingSpellEffects) => {
        setPending(current => {
            const next = change(current);
            if (key) write(key, next);
            return next;
        });
    }, [ key ]);

    const markPending = useCallback((spellKey: string, stage: SpellStage) => { update(current => withPendingEffect(current, spellKey, stage)); }, [ update ]);
    const clearPending = useCallback((spellKey: string) => { update(current => withoutPendingEffect(current, spellKey)); }, [ update ]);

    return { pending, markPending, clearPending };
}
