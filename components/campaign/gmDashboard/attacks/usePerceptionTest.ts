'use client';

import { useCampaignContext } from '@contexts';
import type { Charsheet } from '@models/entities';
import { rollCreatureExpertise } from '@utils/combat/creatureRoll';
import { PERCEPTION_EXPERTISE } from '@utils/combat/awareness';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import { planSheetRoll, rollSheetPlan } from '@utils/sheetRoll';
import { describeRoll } from './useAttackResolution';

export interface PerceptionResult {
    total: number;
    /** Como saiu a rolagem ("Percepção: [12, 7: 12] + 3 = 15") */
    text: string;
    /** O total alcançou a DT */
    passed: boolean;
}

/**
 * O teste de Percepção que o mestre rola pelo observador para notar um escondido. Rola no painel, sem mandar ao chat (o chat revelaria quem se esconde de quem).
 * Cada tipo de ficha segue a regra dele: o jogador, a do botão da perícia na ficha (`planSheetRoll`); a criatura, a regra da criatura (`⌊atributo/5⌋` d20).
 */
export function usePerceptionTest(): (observerId: string, dt: number) => PerceptionResult | null {
    const { campaign, charsheets, rpgSystem } = useCampaignContext();

    return (observerId, dt) => {
        const observer = campaign.session?.combat?.combatants?.find(candidate => candidate.id === observerId);
        if (!observer) return null;

        if (observer.type === 'creature') {
            const creature = findBaseCreature(observer.id, campaign.custom?.creatures ?? []);
            const result = rollCreatureExpertise(creature, PERCEPTION_EXPERTISE);
            if (!result) return null;
            return {
                total: result.total,
                text: describeRoll(PERCEPTION_EXPERTISE, result.rolls, result.used, result.bonus, result.total),
                passed: result.total >= dt
            };
        }

        const sheet = charsheets.find((candidate: Charsheet) => candidate.id === observer.id) ?? null;
        const plan = planSheetRoll(sheet, PERCEPTION_EXPERTISE, rpgSystem);
        if (!plan) return null;
        const result = rollSheetPlan(plan);
        return {
            total: result.total,
            text: describeRoll(PERCEPTION_EXPERTISE, result.rolls, result.used, plan.bonus, result.total),
            passed: result.total >= dt
        };
    };
}
