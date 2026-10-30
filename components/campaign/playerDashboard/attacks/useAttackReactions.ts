'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { campaignService } from '@services';
import { reactionOptionsFor, type ReactionOption } from '@utils/combat/attackReactions';
import { readAbilityDayUses, type AbilityUses, type PassiveDef } from '@utils/combat/passives';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import { asRequestError, errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { usePassives } from '../passives/usePassives';

export interface AttackReactions {
    /** Chave (`ataque:habilidade`) da reação sendo enviada: o botão fica sem clique enquanto a rota responde */
    busyKey: string | null;
    /** As habilidades de reação da ficha para esse ataque (vazio se a ficha não tem nenhuma) */
    optionsFor: (attack: PendingAttackData) => ReactionOption[];
    /** Reage ao ataque: o servidor confere a habilidade, os usos e o MP e guarda a reação no ataque para o mestre ver ao resolver */
    react: (attack: PendingAttackData, ability: PassiveDef) => Promise<void>;
}

export const reactionBusyKey = (attackId: string, abilityKey: string): string => `${attackId}:${abilityKey}`;

/**
 * "Reagir" no cartão do ataque recebido: Barreira de Ki, Metamorfose Adaptativa, Resposta Tática, Reflexos Táticos, Xeque-Mate (`utils/combat/attackReactions.ts`). A reação vai
 * ao servidor (`react_attack`), que a guarda no ataque pendente; o mestre a vê no cartão de resolução. Erro de regra (sem MP, usos esgotados) vira aviso.
 */
export function useAttackReactions(): AttackReactions {
    const { campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { passives } = usePassives();
    const { enqueueSnackbar } = useSnackbar();
    const [ busyKey, setBusyKey ] = useState<string | null>(null);

    const me = campaign?.session?.combat?.combatants?.find(combatant => combatant.id === charsheet?.id);
    const uses: AbilityUses = { day: readAbilityDayUses(charsheet), combat: me?.abilityUses ?? {} };
    const currentMp = Number(charsheet?.stats?.mp ?? me?.currentMp ?? 0);

    const optionsFor: AttackReactions['optionsFor'] = (attack) => reactionOptionsFor(passives, attack, currentMp, uses);

    const react: AttackReactions['react'] = async (attack, ability) => {
        if (!campaign?.id || busyKey) return;

        setBusyKey(reactionBusyKey(attack.id, ability.key));
        try {
            const data = await campaignService.reactToAttack(campaign.id, { attackId: attack.id, abilityKey: ability.key });
            for (const warning of data.warnings ?? []) enqueueSnackbar(warning, { variant: 'warning' });
            enqueueSnackbar(`${ability.name}: reação declarada. O mestre a considera ao resolver o ataque.`, { variant: 'info' });
        } catch (error) {
            const { response } = asRequestError(error);
            const rule = response?.status !== undefined && response.status < 500 && response.data?.code === 'REACTION_BLOCKED';
            enqueueSnackbar(errorMessage(error, 'Não consegui declarar a reação'), { variant: rule ? 'warning' : 'error' });
        } finally {
            setBusyKey(null);
        }
    };

    return { busyKey, optionsFor, react };
}
