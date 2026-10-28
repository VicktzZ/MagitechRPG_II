'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import type { Combatant } from '@models';
import { campaignService } from '@services';
import { opportunitiesForReactor, type OpportunityData } from '@utils/combat/opportunities';
import { findAwaitingDamage, type AttackSource, type PendingAttackData } from '@utils/combat/pendingAttacks';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

/** Ataque de oportunidade do jogador: um inimigo saiu do alcance dele e ele ainda pode reagir (ver `utils/combat/opportunities.ts`) */
export interface OpportunityTargeting {
    /** A oportunidade aberta contra o alvo escolhido (`null` se não há) */
    current: OpportunityData | null;
    /** O próximo ataque é de oportunidade: há uma aberta contra o alvo e o jogador não desmarcou */
    active: boolean;
    setUse: (use: boolean) => void;
}

/** O ataque assistido do jogador: em combate ativo ele escolhe o alvo e o ataque (arma ou magia) vai para o mestre confirmar */
export interface AttackTargeting {
    /** O jogador está no combate, na fase de ação: dá para atacar com alvo */
    enabled: boolean;
    targets: Combatant[];
    targetId: string;
    setTargetId: (id: string) => void;
    /** Ataques dele que o mestre ainda não resolveu */
    pending: PendingAttackData[];
    opportunity: OpportunityTargeting;
}

export interface AttackTargetingApi {
    targeting: AttackTargeting;
    /**
     * Declara o ataque ao alvo escolhido. Devolve `true` se declarou; `false` se não há alvo ou combate (nada a fazer) ou se o servidor recusou
     * (o aviso já foi dado). `isNew` diz se não havia um ataque da mesma arma ou magia esperando o dano (refazer o acerto troca o anterior).
     */
    declare: (attack: Record<string, unknown>, options?: { opportunity?: boolean }) => Promise<{ declared: boolean; isNew: boolean }>;
    /** O dano rolado se junta ao ataque dessa arma ou magia que esperava por ele; não faz nada se não houver */
    attachDamage: (name: string, source: AttackSource, damage: number, critical?: boolean) => Promise<void>;
}

/** Alvo e declaração do ataque assistido, comum às armas (inventário) e às magias de ataque */
export function useAttackTargeting(): AttackTargetingApi {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    // `null` = o jogador ainda não escolheu: com uma oportunidade aberta, o alvo já vem como quem saiu do alcance
    const [ selectedTarget, setTargetId ] = useState<string | null>(null);
    const [ declinedOpportunity, setDeclinedOpportunity ] = useState<string | null>(null);

    // Só em combate ativo, na fase de ação, para quem está nele
    const combat = campaign?.session?.combat;
    const enabled = Boolean(combat?.isActive && combat.phase === 'ACTION' && combat.combatants?.some(c => c.id === charsheet?.id));
    const targets = enabled ? (combat?.combatants ?? []).filter(c => c.id !== charsheet?.id) : [];
    const offers = enabled ? opportunitiesForReactor(combat?.opportunities, charsheet?.id) : [];
    const suggestedTarget = offers.find(offer => targets.some(c => c.id === offer.moverId))?.moverId ?? '';
    const chosenTarget = selectedTarget ?? suggestedTarget;
    const targetId = targets.some(c => c.id === chosenTarget) ? chosenTarget : '';
    const currentOpportunity = offers.find(offer => offer.moverId === targetId) ?? null;
    const opportunityActive = Boolean(currentOpportunity) && declinedOpportunity !== currentOpportunity?.id;
    const pending = (combat?.pendingAttacks ?? []).filter(entry => entry.attackerId === charsheet?.id);

    const declare: AttackTargetingApi['declare'] = async (attack, options) => {
        if (!enabled || !targetId || !campaign?.id || !charsheet?.id) return { declared: false, isNew: false };

        const isNew = !findAwaitingDamage(combat?.pendingAttacks, charsheet.id, String(attack['name']), attack['source'] as AttackSource);
        try {
            await campaignService.declareAttack(campaign.id, {
                combatantId: charsheet.id,
                targetId,
                attack,
                ...(options?.opportunity && currentOpportunity ? { opportunityId: currentOpportunity.id } : {})
            });
            enqueueSnackbar('Ataque declarado. O mestre confirma o resultado.', { variant: 'info' });
            return { declared: true, isNew };
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Não consegui declarar o ataque ao mestre'), { variant: 'error' });
            return { declared: false, isNew };
        }
    };

    const attachDamage: AttackTargetingApi['attachDamage'] = async (name, source, damage, critical) => {
        const awaiting = enabled && charsheet?.id ? findAwaitingDamage(combat?.pendingAttacks, charsheet.id, name, source) : undefined;
        if (!awaiting || !campaign?.id) return;
        try {
            await campaignService.setAttackDamage(campaign.id, { attackId: awaiting.id, damage, ...(critical ? { critical } : {}) });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Não consegui enviar o dano ao mestre'), { variant: 'error' });
        }
    };

    const opportunity: OpportunityTargeting = {
        current: currentOpportunity,
        active: opportunityActive,
        setUse: (use) => { setDeclinedOpportunity(use ? null : currentOpportunity?.id ?? null); }
    };

    return { targeting: { enabled, targets, targetId, setTargetId, pending, opportunity }, declare, attachDamage };
}
