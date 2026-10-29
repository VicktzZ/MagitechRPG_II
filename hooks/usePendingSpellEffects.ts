import {
    parsePendingSpellCriticals,
    parsePendingSpellEffects,
    pendingCriticalsStorageKey,
    pendingEffectsStorageKey,
    withoutPendingEffect,
    withPendingCritical,
    withPendingEffect,
    type PendingSpellCriticals,
    type PendingSpellEffects
} from '@utils/pendingSpellEffects';
import type { SpellStage } from '@utils/spellStages';
import { useCallback, useEffect, useState } from 'react';

interface PendingSpellEffectsApi {
    /** Magia (por id ou nome) → estágio conjurado com sucesso que ainda não foi efetuado */
    pending: PendingSpellEffects;
    /** Magia (por id ou nome) → foi conjurada em crítico (o dano sai vezes o multiplicador ao efetuar) */
    criticals: PendingSpellCriticals;
    markPending: (spellKey: string, stage: SpellStage, critical?: boolean) => void;
    clearPending: (spellKey: string) => void;
}

const read = (key: string): PendingSpellEffects => {
    try {
        return parsePendingSpellEffects(window.localStorage.getItem(key));
    } catch {
        return {};
    }
};

const readCriticals = (key: string): PendingSpellCriticals => {
    try {
        return parsePendingSpellCriticals(window.localStorage.getItem(key));
    } catch {
        return {};
    }
};

const write = (key: string, pending: PendingSpellEffects | PendingSpellCriticals): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(pending));
    } catch {
        // Sem armazenamento (janela privada, dados bloqueados): o botão só vale até recarregar a página
    }
};

/** As magias que o jogador conjurou com sucesso e ainda vai efetuar; lido depois da montagem, para não divergir do servidor */
export function usePendingSpellEffects(campaignId: string | undefined, charsheetId: string | undefined): PendingSpellEffectsApi {
    const key = campaignId && charsheetId ? pendingEffectsStorageKey(campaignId, charsheetId) : null;
    const criticalsKey = campaignId && charsheetId ? pendingCriticalsStorageKey(campaignId, charsheetId) : null;
    const [ pending, setPending ] = useState<PendingSpellEffects>({});
    const [ criticals, setCriticals ] = useState<PendingSpellCriticals>({});

    useEffect(() => {
        setPending(key ? read(key) : {});
        setCriticals(criticalsKey ? readCriticals(criticalsKey) : {});
    }, [ key, criticalsKey ]);

    const updateCriticals = useCallback((change: (current: PendingSpellCriticals) => PendingSpellCriticals) => {
        setCriticals(current => {
            const next = change(current);
            if (criticalsKey) write(criticalsKey, next);
            return next;
        });
    }, [ criticalsKey ]);

    const update = useCallback((change: (current: PendingSpellEffects) => PendingSpellEffects) => {
        setPending(current => {
            const next = change(current);
            if (key) write(key, next);
            return next;
        });
    }, [ key ]);

    const markPending = useCallback((spellKey: string, stage: SpellStage, critical = false) => {
        update(current => withPendingEffect(current, spellKey, stage));
        updateCriticals(current => withPendingCritical(current, spellKey, critical));
    }, [ update, updateCriticals ]);
    const clearPending = useCallback((spellKey: string) => {
        update(current => withoutPendingEffect(current, spellKey));
        updateCriticals(current => withPendingCritical(current, spellKey, false));
    }, [ update, updateCriticals ]);

    return { pending, criticals, markPending, clearPending };
}
