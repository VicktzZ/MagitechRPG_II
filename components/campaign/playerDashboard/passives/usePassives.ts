'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import type { AppliedEffect } from '@models';
import type { SpellDTO } from '@models/dtos';
import { combatantEffects } from '@utils/combat/effectDice';
import { ownedPassives, spellCostAdjustment, targetHasNotActed, type PassiveContext, type PassiveDef, type SpellCostAdjustment } from '@utils/combat/passives';
import { getSpellMpCost } from '@utils/combat/spellRoller';
import { isCombatantStealthy } from '@utils/combat/stealth';
import type { SpellStage } from '@utils/spellStages';
import { useMemo } from 'react';

export interface PlayerPassives {
    /** As passivas estruturadas que a ficha tem (automáticas e ativadas) */
    passives: PassiveDef[];
    /** Os efeitos aplicados ao personagem agora (só com o combate ativo) */
    myEffects: AppliedEffect[];
    /** O personagem está furtivo */
    stealthy: boolean;
    /** O momento da rolagem; `targetId` é o alvo escolhido (para "o alvo ainda não agiu") */
    contextFor: (targetId?: string | null) => PassiveContext;
    costAdjustment: SpellCostAdjustment;
    /** O custo de MP do estágio, já com as passivas que mexem nele (Magismo Total) */
    spellCost: (spell: SpellDTO, stage: SpellStage) => number;
}

/**
 * As passivas de classe e subclasse do personagem no painel da campanha: o que a ficha tem, o contexto da rolagem (furtivo, alvo que ainda não agiu) e o custo de MP
 * das magias com as passivas. Quem rola (arma, magia) usa isto para somar o que as passivas dão (`utils/combat/passives`).
 */
export function usePassives(): PlayerPassives {
    const { campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const combat = campaign?.session?.combat;

    const passives = useMemo(() => ownedPassives(charsheet), [ charsheet ]);
    const myEffects = combatantEffects(combat, charsheet?.id);
    const stealthy = isCombatantStealthy(combat, charsheet?.id);
    const costAdjustment = useMemo(() => spellCostAdjustment(passives), [ passives ]);

    return {
        passives,
        myEffects,
        stealthy,
        contextFor: (targetId) => ({ sheet: charsheet, stealthy, targetNotActed: targetHasNotActed(combat, targetId) }),
        costAdjustment,
        spellCost: (spell, stage) => getSpellMpCost(spell, stage, costAdjustment)
    };
}
