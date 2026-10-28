'use client';

import { campaignService } from '@services';
import type { CombatEventItem } from '@utils/combat/history';
import { useEffect, useState } from 'react';

interface CombatHistory {
    /** `null` até a primeira resposta */
    events: CombatEventItem[] | null;
    /** A consulta falhou (o histórico é um extra: o combate segue) */
    failed: boolean;
}

/**
 * Os últimos eventos do combate (só o mestre lê). Busca ao abrir e de novo sempre que `signature` muda (o diálogo manda algo que muda a
 * cada ação: round, nº de logs), então o evento recém-feito aparece sem recarregar a página.
 */
export function useCombatHistory(campaignId: string, signature: string, enabled: boolean): CombatHistory {
    const [ events, setEvents ] = useState<CombatEventItem[] | null>(null);
    const [ failed, setFailed ] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;

        void (async () => {
            try {
                const result = await campaignService.getCombatEvents(campaignId);
                if (cancelled) return;
                setEvents(result.events);
                setFailed(false);
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();

        return () => { cancelled = true; };
    }, [ campaignId, signature, enabled ]);

    return { events, failed };
}
