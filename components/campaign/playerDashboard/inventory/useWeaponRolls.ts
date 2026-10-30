import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { Message, type Weapon } from '@models';
import { campaignService } from '@services';
import { asRequestError } from '@utils/errors';
import {
    rollWeaponHit,
    rollWeaponDamage,
    buildHitMessageText,
    buildDamageMessageText,
    buildDamageErrorText
} from '@utils/combat/weaponRoller';
import { critMultiplier } from '@utils/combat/critical';
import { combatantAttackDice } from '@utils/combat/environment';
import { findAwaitingDamage } from '@utils/combat/pendingAttacks';
import { isCombatantStealthy } from '@utils/combat/stealth';
import { isOpportunityWeapon, OPPORTUNITY_WEAPON_HELP } from '@utils/combat/opportunities';
import { critMarginReduction, critMultiplierSources, effectCritMarginReduction, effectDamageSpecs, effectHitBonus, weaponDamageSpecs } from '@utils/combat/passives';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { hitMarkKey, setHitCritical, useHitCriticals } from '../attacks/hitCriticals';
import { useAttackTargeting } from '../attacks/useAttackTargeting';
import { usePassives } from '../passives/usePassives';

/**
 * Rolagens de acerto e dano das armas do inventário, enviadas ao chat da sessão: o acerto como log de combate e o dano
 * como mensagem de dados (cartão com o total à vista e as rolagens no dropdown, ver `actionRollMessage.ts`).
 * Com o efeito Furtivo (em combate ativo) o acerto rola 1d20 a mais (vantagem) e o dano sai dobrado, e o chat diz isso (`stealth.ts`).
 */
export function useWeaponRolls() {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    // Ataque assistido: em combate, na fase de ação, o acerto e o dano da arma vão ao mestre (alvo escolhido no inventário)
    const { targeting, declare, attachDamage } = useAttackTargeting();
    // Passivas de classe e subclasse: somam ao acerto e ao dano (Armado, Bom de Briga, Sempre Distante...) e as habilidades ativadas também (Ritmo da Batalha, Postura do Lobo...)
    const { passives, myEffects, contextFor } = usePassives();
    // Acerto crítico (o d20 natural passou da margem): marcado sozinho; o botão de dano rola o crítico enquanto o acerto espera o dano
    const hitMarks = useHitCriticals();
    const markKey = (weapon: Weapon): string => hitMarkKey(charsheet?.id, 'weapon', weapon.name);
    const isWeaponCritical = (weapon: Weapon): boolean => {
        const awaiting = charsheet?.id ? findAwaitingDamage(campaign?.session?.combat?.pendingAttacks, charsheet.id, weapon.name, 'weapon') : undefined;
        return hitMarks.has(markKey(weapon)) || awaiting?.critical === true;
    };

    const sendCombatChatMessage = async (text: string, type: MessageType = MessageType.COMBAT_LOG) => {
        if (!session?.user) return;
        await handleSendMessage(new Message({
            text,
            type,
            by: {
                id: session.user.id ?? '',
                name: session.user.name ?? '',
                image: session.user.image ?? ''
            },
            timestamp: new Date().toISOString(),
            isHTML: true
        }));
        if (!isChatOpen) setIsChatOpen(true);
    };

    const handleWeaponHit = async (weapon: Weapon, e: ReactMouseEvent) => {
        e.stopPropagation();
        // Ataque de oportunidade (um inimigo saiu do alcance dele): só arma branca, e a ação gasta é a Reação. Antes de rolar, para não deixar rolagem solta no chat
        const opportunity = targeting.opportunity.active;
        // Contra-ataque dado por uma reação (Xeque-Mate, Resposta Tática...): bônus no acerto, crítico garantido; a habilidade já gastou a Reação e pode liberar qualquer arma
        const counter = opportunity ? targeting.opportunity.current?.counter : undefined;
        if (opportunity && counter?.meleeOnly !== false && !isOpportunityWeapon(weapon)) {
            enqueueSnackbar(OPPORTUNITY_WEAPON_HELP, { variant: 'warning' });
            return;
        }
        // Os efeitos aplicados (Cegueira, Precisão...) e a luz da cena (penumbra, escuridão, conforme a visão dele) somam vantagens e desvantagens de ataque;
        // o chat e o mestre sabem de onde vêm
        const effects = combatantAttackDice(campaign?.session?.combat, charsheet?.id);
        // A margem de crítico da arma (`effect.critChance`, 20 se vazia) cai com as passivas e as habilidades ativadas (Forma Primordial −2)
        const marginCut = { fromPassives: critMarginReduction(passives, contextFor(targeting.targetId), 'weapon'), fromEffects: effectCritMarginReduction(myEffects) };
        const hitBonus = effectHitBonus(myEffects);
        const counterBonus = counter?.hitBonus ?? 0;
        const hit = rollWeaponHit(weapon, charsheet, {
            stealth: isCombatantStealthy(campaign?.session?.combat, charsheet?.id),
            effects,
            flatBonus: {
                flat: hitBonus.flat + counterBonus,
                notes: [
                    ...hitBonus.notes,
                    ...(counter && counterBonus !== 0 ? [ `${counter.source}: ${counterBonus > 0 ? '+' : '−'}${Math.abs(counterBonus)} no acerto` ] : []),
                    ...marginCut.fromPassives.notes,
                    ...marginCut.fromEffects.notes
                ]
            },
            critMarginReduction: marginCut.fromPassives.reduction + marginCut.fromEffects.reduction
        });
        const critical = hit.critical || counter?.guaranteedCrit === true;
        setHitCritical(markKey(weapon), critical);
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        await sendCombatChatMessage(buildHitMessageText(playerName, weapon, hit, counter?.guaranteedCrit ? counter.source : undefined));

        // Refazer o acerto da mesma arma troca o ataque que ainda espera o dano e não gasta outra ação
        const { declared, isNew } = await declare({
            source: 'weapon',
            name: weapon.name,
            kind: 'fisico',
            attackType: weapon.effect?.effectType ?? undefined,
            attackTotal: hit.total,
            rolls: hit.rolls,
            bonus: hit.bonus,
            ...(hit.keep === 'lowest' ? { keep: 'lowest' } : {}),
            ...(critical ? { critical: true } : {}),
            // Corpo a corpo (arma branca): as reações do alvo Resposta Tática e Retaliação só valem contra ele
            ...(isOpportunityWeapon(weapon) ? { melee: true } : {})
        }, { opportunity });
        if (!declared || !isNew || !campaign?.id || !charsheet?.id) return;

        // Atacar gasta a ação Padrão (a Reação, no ataque de oportunidade): é aviso, nunca trava (o mestre decide). O contra-ataque não gasta ação: a reação que o deu já gastou a Reação
        if (counter) return;
        const execution = opportunity ? 'Reação' : 'Padrão';
        try {
            await campaignService.spendCombatAction(campaign.id, { combatantId: charsheet.id, execution });
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'ACTION_UNAVAILABLE') {
                enqueueSnackbar(`Você já não tinha a ação ${execution} disponível nesta rodada. Avise o mestre.`, { variant: 'warning' });
            } else {
                console.error('Erro ao gastar a ação do ataque:', error);
            }
        }
    };

    const handleWeaponDamage = async (weapon: Weapon, isCritical: boolean, e: ReactMouseEvent) => {
        e.stopPropagation();
        // O botão "Dano" rola crítico sozinho quando o acerto foi crítico; "Crítico" continua forçando o crítico na mão
        const critical = isCritical || isWeaponCritical(weapon);
        const context = contextFor(targeting.targetId);
        // Contra-ataque dado por uma reação: o ataque pendente guarda os dados a mais (Xeque-Mate: +6d6)
        const awaiting = charsheet?.id ? findAwaitingDamage(campaign?.session?.combat?.pendingAttacks, charsheet.id, weapon.name, 'weapon') : undefined;
        const counterExtras = awaiting?.counter?.extraDice ? [ { source: awaiting.counter.source, dice: [ awaiting.counter.extraDice ], flat: 0, sameDie: 0 } ] : [];
        const extras = [ ...weaponDamageSpecs(passives, context, weapon), ...effectDamageSpecs(myEffects, context, 'weapon', weapon), ...counterExtras ];
        const result = rollWeaponDamage(weapon, critical, {
            stealth: isCombatantStealthy(campaign?.session?.combat, charsheet?.id),
            extras,
            critMultiplier: critMultiplier(critMultiplierSources(passives, context, 'weapon'))
        });
        const playerName = charsheet?.name || session?.user?.name || 'Jogador';
        if (!result) {
            await sendCombatChatMessage(buildDamageErrorText(weapon, critical));
            return;
        }
        await sendCombatChatMessage(buildDamageMessageText(playerName, weapon, result), MessageType.DICE);
        setHitCritical(markKey(weapon), false);

        // O dano se junta ao ataque que esperava por ele (o que o jogador declarou no acerto)
        await attachDamage(weapon.name, 'weapon', result.total, critical);
    };

    return { handleWeaponHit, handleWeaponDamage, isWeaponCritical, targeting };
}
