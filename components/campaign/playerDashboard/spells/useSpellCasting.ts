'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { usePendingSpellEffects } from '@hooks/usePendingSpellEffects';
import { Message } from '@models';
import type { SpellDTO } from '@models/dtos';
import { campaignService } from '@services';
import { postCampaignStats } from '@utils/campaignStatsClient';
import { executionSlot } from '@utils/combat/engine/actionBudget';
import { rollSpellTest } from '@utils/combat/hitTest';
import { isOpportunitySpell, OPPORTUNITY_SPELL_HELP } from '@utils/combat/opportunities';
import {
    buildSpellCastMessage,
    buildSpellEffectMessage,
    buildInsufficientMpMessage,
    buildMpLimitExceededMessage,
    getSpellMpCost,
    hasSpellEffectDice,
    rollSpellEffect
} from '@utils/combat/spellRoller';
import { isSustainedSpell, sustainedEffects } from '@utils/combat/sustainedSpells';
import { asRequestError } from '@utils/errors';
import { getMpLimit, isMpLimitEnforced } from '@utils/mpLimit';
import { spellCastDifficulty, spellCastSucceeded } from '@utils/spellDifficulty';
import { getSpellProgress, usesStageUnlock, type SpellStage } from '@utils/spellStages';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { isAttackSpell, useSpellAttack, type SpellAttackApi } from '../attacks/useSpellAttack';

export interface SpellCasting {
    /** Ataque assistido das magias: o alvo é o do painel inteiro (seção "Ações") */
    spellAttack: SpellAttackApi;
    castingSpellId: string | null;
    effectingSpellId: string | null;
    /** Magia (por id ou nome) → estágio conjurado com sucesso que ainda tem o botão "Efetuar" */
    pendingEffects: Readonly<Record<string, SpellStage>>;
    clearPending: (spellKey: string) => void;
    /** O personagem no combate ativo, se estiver */
    myCombatantId: string | undefined;
    mpLimitEnforced: boolean;
    mpLimit: number;
    mpSpentThisTurn: number;
    mpLimitReleased: boolean;
    /** Magias sustentadas que ele mantém agora: id da magia → estágio conjurado */
    sustainedActive: Record<string, SpellStage>;
    exceedsMpLimit: (cost: number) => boolean;
    /** Desbloqueio de estágios vale para esta ficha (`usesStageUnlock`) */
    stageRule: boolean;
    castSpell: (spell: SpellDTO, stage: SpellStage) => Promise<void>;
    endSustained: (spell: SpellDTO) => Promise<void>;
    effectSpell: (spell: SpellDTO, stage: SpellStage) => Promise<void>;
}

/**
 * Conjurar, efetuar e desconjurar magias do jogador na campanha. Vive uma vez só para o painel (`SpellCastingProvider`), porque a seção de Magias e os quadrados
 * da seção "Ações" conjuram pelo mesmo caminho e dividem o estado (conjuração em andamento, "Efetuar" pendente).
 */
export function useSpellCastingState(): SpellCasting {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    // Ataque assistido: em combate, na fase de ação, a magia de ataque conjurada com sucesso vai ao mestre para o alvo escolhido
    const spellAttack = useSpellAttack();

    const [ castingSpellId, setCastingSpellId ] = useState<string | null>(null)
    const [ effectingSpellId, setEffectingSpellId ] = useState<string | null>(null)
    // Conjurações com sucesso que ainda esperam o botão "Efetuar" (rolar dano, cura, duração...)
    const { pending: pendingEffects, markPending, clearPending } = usePendingSpellEffects(campaign?.id, charsheet?.id)

    // Limite de MP por turno: só vale em combate ativo, para quem participa dele (utils/mpLimit.ts)
    const combat = campaign?.session?.combat
    const myCombatant = combat?.isActive ? combat.combatants?.find(c => c.id === charsheet?.id) : undefined
    const mpLimitEnforced = Boolean(myCombatant) && Boolean(charsheet) && isMpLimitEnforced(charsheet, campaign?.mode)
    const mpLimit = charsheet ? getMpLimit(charsheet) : 0
    const mpSpentThisTurn = myCombatant?.mpSpentThisTurn ?? 0
    const mpLimitReleased = Boolean(myCombatant?.mpLimitOverride)
    // Magias sustentadas que ele mantém agora (efeito sobre o combatente): id da magia → estágio conjurado
    const sustainedActive: Record<string, SpellStage> = {}
    for (const effect of sustainedEffects(myCombatant?.effects)) {
        if (effect.sustained) sustainedActive[effect.sustained.spellKey] = effect.sustained.stage as SpellStage
    }
    const exceedsMpLimit = (cost: number): boolean => mpLimitEnforced && !mpLimitReleased && mpSpentThisTurn + cost > mpLimit

    // Avisos (MP insuficiente, limite de MP) são log de combate; a conjuração em si vai como mensagem de dados (cartão com dropdown)
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

    // Desbloqueio de estágios (ver utils/spellStages.ts): vale no Magitech padrão, não em sistema customizado nem no Roguelite
    const stageRule = usesStageUnlock(charsheet ?? {}, campaign?.mode);

    const castSpell = async (spell: SpellDTO, stage: SpellStage) => {
        if (!charsheet?.id) return;
        const spellKey = spell.id || spell.name;
        if (castingSpellId) return;

        const progress = getSpellProgress(spell, charsheet, { enabled: stageRule });
        if (stage > progress.unlocked) {
            enqueueSnackbar(`O estágio ${stage} de ${spell.name} ainda está bloqueado. Evolua a magia primeiro.`, { variant: 'warning' });
            return;
        }

        // Ataque de oportunidade em curso (um inimigo saiu do alcance dele): a magia de ataque tem de ser de Reação e alcance Curto. Antes de gastar o MP.
        const opportunity = spellAttack.targeting.opportunity.active && isAttackSpell(spell);
        if (opportunity && !isOpportunitySpell(spell)) {
            enqueueSnackbar(OPPORTUNITY_SPELL_HELP, { variant: 'warning' });
            return;
        }

        const mpCost = getSpellMpCost(spell, stage);
        const playerName = charsheet.name || session?.user?.name || 'Jogador';
        const currentMp = Number(charsheet.stats?.mp ?? 0);

        if (currentMp < mpCost) {
            await sendCombatChatMessage(buildInsufficientMpMessage(playerName, spell, mpCost, currentMp));
            enqueueSnackbar(`MP insuficiente para conjurar ${spell.name}`, { variant: 'warning' });
            return;
        }

        if (exceedsMpLimit(mpCost)) {
            await sendCombatChatMessage(buildMpLimitExceededMessage(playerName, spell, mpCost, mpSpentThisTurn, mpLimit));
            enqueueSnackbar(`Limite de MP por turno excedido (${mpSpentThisTurn}/${mpLimit})`, { variant: 'warning' });
            return;
        }

        let reservedMp = false;

        try {
            setCastingSpellId(spellKey);

            // O servidor é quem decide: registra o gasto na rodada e recusa (409) o que passar do limite (só em combate)
            if (myCombatant) {
                await campaignService.spendCombatMp(campaign.id, { combatantId: charsheet.id, value: mpCost });
                reservedMp = true;
            }

            const newMp = Math.max(0, currentMp - mpCost);
            await updateCharsheet({ 'stats.mp': newMp });

            // Conjurar = teste de magia do jogador contra a DT do nível e do estágio; o MP é gasto de qualquer jeito
            const test = rollSpellTest(charsheet);
            const succeeded = spellCastSucceeded(test.total, spellCastDifficulty(spell.level, stage));
            // Só uma conjuração com sucesso deixa efetuar a magia; o botão já está lá quando o cartão aparece no chat
            if (succeeded && hasSpellEffectDice(spell, stage)) markPending(spellKey, stage);
            await sendCombatChatMessage(buildSpellCastMessage(playerName, spell, stage, test, mpCost), MessageType.DICE);
            // Conjuração com sucesso de magia de ataque: o teste de magia é o acerto e o mestre confirma o resultado contra o alvo
            if (succeeded) await spellAttack.declareSpell(spell, test, { opportunity });

            // Gasta a ação da rodada que a magia pede (Padrão, Bônus, Movimento, Reação, Completa). É aviso, nunca trava: o mestre decide
            // o que vale quando a ação já tinha acabado.
            if (myCombatant && combat?.phase === 'ACTION' && executionSlot(spell.execution)) {
                try {
                    await campaignService.spendCombatAction(campaign.id, { combatantId: charsheet.id, execution: String(spell.execution) })
                } catch (actionError) {
                    const { response: actionResponse } = asRequestError(actionError)
                    if (actionResponse?.status === 409 && actionResponse.data?.code === 'ACTION_UNAVAILABLE') {
                        enqueueSnackbar(`Você já não tinha a ação ${String(spell.execution)} disponível nesta rodada. Avise o mestre.`, { variant: 'warning' })
                    } else {
                        console.error('Erro ao gastar a ação da magia:', actionError)
                    }
                }
            }

            // Magia sustentada em combate: o MP acabou, tudo que ele mantém acaba; senão, conjurada com sucesso ela fica ativa (fora do combate é como
            // uma imediata). Erro aqui não desfaz a conjuração, que já foi paga e anunciada.
            if (myCombatant) {
                try {
                    if (newMp <= 0) {
                        await campaignService.endSustainedSpells(campaign.id, { combatantId: charsheet.id })
                    } else if (succeeded && isSustainedSpell(spell.type)) {
                        await campaignService.startSustainedSpell(campaign.id, { combatantId: charsheet.id, spellKey, spellName: spell.name, stage, cost: mpCost })
                    }
                } catch (sustainError) {
                    console.error('Erro ao atualizar a magia sustentada:', sustainError)
                    enqueueSnackbar('A magia foi conjurada, mas não ficou ativa no combate. Avise o mestre.', { variant: 'warning' })
                }
            }

            // Estatísticas: magia conjurada + MP gasto
            postCampaignStats(campaign.id, [ {
                charsheetId: charsheet.id,
                userId: session?.user?.id,
                charsheetName: charsheet.name,
                inc: {
                    'resources.spellsCast': 1,
                    'resources.mpSpent': mpCost
                }
            } ]);

            if (!succeeded) {
                enqueueSnackbar(`A conjuração de ${spell.name} falhou no teste (${test.total} contra DT ${spellCastDifficulty(spell.level, stage)}). O MP foi gasto.`, { variant: 'warning' });
            }
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'MP_LIMIT_EXCEEDED') {
                // Estado local defasado: o servidor já tinha mais MP gasto nesta rodada
                const { spent = 0, limit = 0 } = response.data;
                await sendCombatChatMessage(buildMpLimitExceededMessage(playerName, spell, mpCost, spent, limit));
                enqueueSnackbar(response.data.error ?? 'Limite de MP por turno excedido', { variant: 'warning' });
            } else {
                if (reservedMp) {
                    // Desfaz a reserva para a conjuração que falhou não consumir o limite da rodada
                    void campaignService.spendCombatMp(campaign.id, { combatantId: charsheet.id, value: -mpCost }).catch(() => undefined);
                }
                console.error('Erro ao conjurar magia:', error);
                enqueueSnackbar('Erro ao conjurar magia', { variant: 'error' });
            }
        } finally {
            setCastingSpellId(null);
        }
    }

    /** Desconjurar: encerra a magia sustentada que o jogador mantém (o MP já pago não volta) */
    const endSustained = async (spell: SpellDTO) => {
        if (!charsheet?.id || !campaign?.id) return;
        try {
            await campaignService.endSustainedSpells(campaign.id, { combatantId: charsheet.id, spellKey: spell.id || spell.name });
        } catch (error) {
            console.error('Erro ao desconjurar magia:', error);
            enqueueSnackbar('Erro ao desconjurar a magia', { variant: 'error' });
        }
    }

    /** Efetuar a magia conjurada com sucesso: rola os dados do estágio (dano, cura, duração...) e manda o cartão do efeito ao chat */
    const effectSpell = async (spell: SpellDTO, stage: SpellStage) => {
        if (!charsheet?.id || effectingSpellId) return;
        const spellKey = spell.id || spell.name;
        const playerName = charsheet.name || session?.user?.name || 'Jogador';

        try {
            setEffectingSpellId(spellKey);
            const effect = rollSpellEffect(spell, stage);
            // O botão "Efetuar" permanece depois de apertado (decisão do dono): só sai ao descartar a conjuração (X) ou quando uma nova conjuração da magia o troca
            await sendCombatChatMessage(buildSpellEffectMessage(playerName, effect), MessageType.DICE);
            // O dano rolado se junta ao ataque que a conjuração declarou ao mestre (se houve alvo)
            await spellAttack.attachSpellDamage(spell, effect.totalDamage);
        } catch (error) {
            console.error('Erro ao efetuar magia:', error);
            enqueueSnackbar('Erro ao efetuar a magia', { variant: 'error' });
        } finally {
            setEffectingSpellId(null);
        }
    }

    return {
        spellAttack,
        castingSpellId,
        effectingSpellId,
        pendingEffects,
        clearPending,
        myCombatantId: myCombatant?.id,
        mpLimitEnforced,
        mpLimit,
        mpSpentThisTurn,
        mpLimitReleased,
        sustainedActive,
        exceedsMpLimit,
        stageRule,
        castSpell,
        endSustained,
        effectSpell
    };
}
