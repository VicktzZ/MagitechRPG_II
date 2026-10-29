'use client';

import { useCampaignContext } from '@contexts';
import type { Combatant } from '@models';
import { summarizeTurnOrder, type TurnOrderSummary } from '@utils/combat/turnOrder';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * A ordem de turnos do combate ativo para quem está vendo (`viewerId` é o id do personagem dele, se estiver no combate). O LP dos jogadores vem das fichas da campanha (o
 * combatente guarda uma cópia que pode estar velha) e o das criaturas só aparece para o mestre ou quando ele deixou a vida das criaturas à mostra. `null` sem combate ativo.
 */
export function useTurnOrder(viewerId?: string | null): TurnOrderSummary | null {
    const { campaign, charsheets } = useCampaignContext();
    const { data: session } = useSession();
    const combat = campaign?.session?.combat;
    const isGM = Boolean(session?.user?.id && campaign?.admin?.includes(session.user.id));
    const showCreatureLp = Boolean(combat?.showEnemyLp) || isGM;

    return useMemo(() => {
        if (!combat?.isActive) return null;

        const playerLp = (combatant: Combatant): { lp: number; maxLp: number } | null => {
            const sheet = charsheets?.find(candidate => candidate.id === combatant.id || candidate.id === combatant.odacId);
            return sheet?.stats ? { lp: sheet.stats.lp ?? 0, maxLp: sheet.stats.maxLp ?? 0 } : null;
        };
        return summarizeTurnOrder(combat, { viewerId, showCreatureLp, playerLp });
    }, [ combat, charsheets, viewerId, showCreatureLp ]);
}
