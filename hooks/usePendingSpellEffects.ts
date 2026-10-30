import type { ExtraSpec } from '@utils/combat/passives/rolls';
import {
    parsePendingSpellCriticals,
    parsePendingSpellEffects,
    parsePendingSpellExtras,
    pendingCriticalsStorageKey,
    pendingEffectsStorageKey,
    pendingExtrasStorageKey,
    withoutPendingEffect,
    withPendingCritical,
    withPendingEffect,
    withPendingExtras,
    type PendingSpellCriticals,
    type PendingSpellEffects,
    type PendingSpellExtras
} from '@utils/pendingSpellEffects';
import type { SpellStage } from '@utils/spellStages';
import { useCallback, useEffect, useState } from 'react';

interface PendingSpellEffectsApi {
    /** Magia (por id ou nome) → estágio conjurado com sucesso que ainda não foi efetuado */
    pending: PendingSpellEffects;
    /** Magia (por id ou nome) → foi conjurada em crítico (o dano sai vezes o multiplicador ao efetuar) */
    criticals: PendingSpellCriticals;
    /** Magia (por id ou nome) → acréscimos que a conjuração já decidiu (metamagia, Fixação, Magia Guiada): entram no dano ou na cura ao efetuar */
    extras: PendingSpellExtras;
    markPending: (spellKey: string, stage: SpellStage, critical?: boolean, extras?: readonly ExtraSpec[]) => void;
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

const readExtras = (key: string): PendingSpellExtras => {
    try {
        return parsePendingSpellExtras(window.localStorage.getItem(key));
    } catch {
        return {};
    }
};

const write = (key: string, pending: PendingSpellEffects | PendingSpellCriticals | PendingSpellExtras): void => {
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
    const extrasKey = campaignId && charsheetId ? pendingExtrasStorageKey(campaignId, charsheetId) : null;
    const [ pending, setPending ] = useState<PendingSpellEffects>({});
    const [ criticals, setCriticals ] = useState<PendingSpellCriticals>({});
    const [ extras, setExtras ] = useState<PendingSpellExtras>({});

    useEffect(() => {
        setPending(key ? read(key) : {});
        setCriticals(criticalsKey ? readCriticals(criticalsKey) : {});
        setExtras(extrasKey ? readExtras(extrasKey) : {});
    }, [ key, criticalsKey, extrasKey ]);

    const updateExtras = useCallback((change: (current: PendingSpellExtras) => PendingSpellExtras) => {
        setExtras(current => {
            const next = change(current);
            if (extrasKey) write(extrasKey, next);
            return next;
        });
    }, [ extrasKey ]);

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

    const markPending = useCallback((spellKey: string, stage: SpellStage, critical = false, specs: readonly ExtraSpec[] = []) => {
        update(current => withPendingEffect(current, spellKey, stage));
        updateCriticals(current => withPendingCritical(current, spellKey, critical));
        updateExtras(current => withPendingExtras(current, spellKey, specs));
    }, [ update, updateCriticals, updateExtras ]);
    const clearPending = useCallback((spellKey: string) => {
        update(current => withoutPendingEffect(current, spellKey));
        updateCriticals(current => withPendingCritical(current, spellKey, false));
        updateExtras(current => withPendingExtras(current, spellKey, []));
    }, [ update, updateCriticals, updateExtras ]);

    return { pending, criticals, extras, markPending, clearPending };
}
