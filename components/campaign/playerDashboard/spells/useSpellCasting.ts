'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { MessageType } from '@enums';
import { usePendingSpellEffects } from '@hooks/usePendingSpellEffects';
import { Message } from '@models';
import type { SpellDTO } from '@models/dtos';
import { campaignService } from '@services';
import { postCampaignStats } from '@utils/campaignStatsClient';
import { combatantBudget } from '@utils/combat/actionBudgets';
import { executionSlot } from '@utils/combat/engine/actionBudget';
import { critMargin, critMultiplier } from '@utils/combat/critical';
import { rollSpellTest } from '@utils/combat/hitTest';
import { blockReason, combatantActionBlocks, isBlocked } from '@utils/combat/actionFlags';
import { combatantAttackDice } from '@utils/combat/environment';
import {
    critMarginReduction, critMultiplierSources, effectCritMarginReduction, effectDamageSpecs, effectHitBonus, guidedBonusDice, isFixedSpell, planCast, quickCastUsed, spellEffectSpecs, spellHitExtras,
    twinCastAllows, twinCastRule, type CastPlan, type TwinRole
} from '@utils/combat/passives';
import { isOpportunitySpell, OPPORTUNITY_SPELL_HELP } from '@utils/combat/opportunities';
import {
    buildSpellCastMessage,
    buildSpellEffectMessage,
    buildInsufficientMpMessage,
    buildMpLimitExceededMessage,
    hasSpellEffectDice,
    rollSpellEffect
} from '@utils/combat/spellRoller';
import { isSustainedSpell, sustainedEffects } from '@utils/combat/sustainedSpells';
import { asRequestError } from '@utils/errors';
import { getMpLimit, isMpLimitEnforced } from '@utils/mpLimit';
import { spellCastDifficulty, spellCastSucceeded } from '@utils/spellDifficulty';
import { getSpellProgress, spellStageCount, usesStageUnlock, type SpellStage } from '@utils/spellStages';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { isAttackSpell, useSpellAttack, type SpellAttackApi } from '../attacks/useSpellAttack';
import { usePassives } from '../passives/usePassives';

export interface SpellCasting {
    /** Ataque assistido das magias: o alvo é o do painel inteiro (seção "Ações") */
    spellAttack: SpellAttackApi;
    castingSpellId: string | null;
    effectingSpellId: string | null;
    /** Magia (por id ou nome) → estágio conjurado com sucesso que ainda tem o botão "Efetuar" */
    pendingEffects: Readonly<Record<string, SpellStage>>;
    /** Magia (por id ou nome) → foi conjurada em crítico: ao efetuar, o dano sai vezes o multiplicador */
    pendingCriticals: Readonly<Record<string, true>>;
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
    /** O custo de MP do estágio com as passivas (Magismo Total): é o que se cobra ao conjurar e o que as telas mostram */
    spellCost: (spell: SpellDTO, stage: SpellStage) => number;
    /** Desbloqueio de estágios vale para esta ficha (`usesStageUnlock`) */
    stageRule: boolean;
    castSpell: (spell: SpellDTO, stage: SpellStage) => Promise<void>;
    endSustained: (spell: SpellDTO) => Promise<void>;
    effectSpell: (spell: SpellDTO, stage: SpellStage) => Promise<void>;
    /** Metamagia e Teia da Realidade ligadas para a próxima conjuração (ver `utils/combat/passives/casting.ts`) */
    cast: CastModifiersState;
    /** O plano desta conjuração (custo, ação, dados a mais...) com o que está ligado agora; é o que as telas mostram e o que `castSpell` cobra */
    planFor: (spell: SpellDTO, stage: SpellStage) => CastPlan;
    /** O estágio que a Fixação Mágica deixa conjurar além do liberado (o próximo), ou `null` se a magia não é a fixada ou não há o que pular */
    fixationStage: (spell: SpellDTO) => SpellStage | null;
}

export interface CastModifiersState {
    /** Opções de metamagia ligadas (Intensificação Mágica, Estágio Quatro) */
    selected: readonly string[];
    toggleOption: (id: string) => void;
    /** Teia da Realidade: `armed` = a próxima magia abre o par; `waitingSecond` = a primeira já foi, falta a segunda (sem ação) */
    twin: { available: boolean; armed: boolean; waitingSecond: boolean };
    armTwin: (armed: boolean) => void;
    cancelTwin: () => void;
    /** Conjuração Rápida: dá para usar agora (ação Bônus livre e ainda não usada nesta rodada) */
    quickCastReady: boolean;
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
    // Passivas de classe e subclasse: custo de MP, teste de magia e dano ou cura do efeito
    const { passives, myEffects, contextFor, spellCost } = usePassives();

    const [ castingSpellId, setCastingSpellId ] = useState<string | null>(null)
    const [ effectingSpellId, setEffectingSpellId ] = useState<string | null>(null)
    // Conjurações com sucesso que ainda esperam o botão "Efetuar" (rolar dano, cura, duração...)
    const { pending: pendingEffects, criticals: pendingCriticals, extras: pendingExtras, markPending, clearPending } = usePendingSpellEffects(campaign?.id, charsheet?.id)
    // Metamagia ligada para a próxima conjuração e o par da Teia da Realidade: estado desta tela (recarregar a página esquece)
    const [ selectedOptions, setSelectedOptions ] = useState<string[]>([])
    const [ twinArmed, setTwinArmed ] = useState(false)
    const [ twinSecond, setTwinSecond ] = useState(false)

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

    // Habilidades de conjuração: o plano diz o custo, a ação, os dados a mais e o que entra no efeito (ver `utils/combat/passives/casting.ts`)
    const twinAvailable = twinCastRule(passives) !== null;
    const quickCastReady = Boolean(myCombatant) && combat?.phase === 'ACTION' && combatantBudget(myCombatant).bonus > 0 && !quickCastUsed(myCombatant?.quickCastRound, combat?.round ?? 0);
    const fixationStage = (spell: SpellDTO): SpellStage | null => {
        if (!charsheet || !isFixedSpell(passives, charsheet, spell.id || spell.name)) return null;
        const progress = getSpellProgress(spell, charsheet, { enabled: stageRule });
        return progress.enabled && progress.next !== null && !progress.needsMastery ? progress.next : null;
    };
    const planFor = (spell: SpellDTO, stage: SpellStage): CastPlan => {
        const spellKey = spell.id || spell.name;
        const fixed = Boolean(charsheet) && isFixedSpell(passives, charsheet, spellKey);
        const twin: TwinRole = !twinCastAllows(passives, spell) ? 'none' : twinSecond ? 'second' : twinArmed ? 'first' : 'none';
        return planCast({
            spell,
            stage,
            stageCount: spellStageCount(spell),
            passives,
            context: contextFor(spellAttack.targeting.targetId),
            selected: selectedOptions,
            baseCost: spellCost(spell, stage),
            twin,
            quickCastReady,
            fixed,
            // Sem estágio para pular (a magia já está no máximo que dá para conjurar): a Fixação soma o dano
            fixedAtMaxStage: fixed && fixationStage(spell) === null,
            guidedDice: isAttackSpell(spell) ? guidedBonusDice(passives, myCombatant?.guided, spellAttack.targeting.targetId, spell.name) : 0
        });
    };

    const castSpell = async (spell: SpellDTO, stage: SpellStage) => {
        if (!charsheet?.id) return;
        const spellKey = spell.id || spell.name;
        if (castingSpellId) return;

        // Silenciamento, Paralisia... (flag `no_spells`): não conjura. Antes de rolar ou gastar MP; o mestre libera tirando o efeito
        const spellBlocks = combatantActionBlocks(combat, charsheet.id);
        if (isBlocked(spellBlocks, 'no_spells')) {
            enqueueSnackbar(`${blockReason(spellBlocks, 'no_spells', 'Você')}.`, { variant: 'warning' });
            return;
        }

        const progress = getSpellProgress(spell, charsheet, { enabled: stageRule });
        // Fixação Mágica: a magia fixada vale um estágio à frente do liberado, só para conjurar
        if (stage > progress.unlocked && fixationStage(spell) !== stage) {
            enqueueSnackbar(`O estágio ${stage} de ${spell.name} ainda está bloqueado. Evolua a magia primeiro.`, { variant: 'warning' });
            return;
        }

        // A Teia da Realidade só vale com magia de nível 2 ou menos: com o par armado e uma magia maior, o aviso diz e a conjuração segue comum
        if ((twinArmed || twinSecond) && !twinCastAllows(passives, spell)) {
            enqueueSnackbar(`${spell.name}: a Teia da Realidade só vale para magia de nível 2 ou menos. A conjuração segue comum e o par continua à espera.`, { variant: 'info' });
        }

        // Ataque de oportunidade em curso (um inimigo saiu do alcance dele): a magia de ataque tem de ser de Reação e alcance Curto. Antes de gastar o MP.
        const opportunity = spellAttack.targeting.opportunity.active && isAttackSpell(spell);
        if (opportunity && !isOpportunitySpell(spell)) {
            enqueueSnackbar(OPPORTUNITY_SPELL_HELP, { variant: 'warning' });
            return;
        }

        // O que as habilidades de conjuração mudam nesta conjuração (metamagia, Teia da Realidade, Conjuração Rápida, Fixação Mágica, Magia Guiada)
        const plan = planFor(spell, stage);
        const mpCost = plan.cost;
        const stageCost = spellCost(spell, stage);
        const twinRole: TwinRole = !twinCastAllows(passives, spell) ? 'none' : twinSecond ? 'second' : twinArmed ? 'first' : 'none';
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
            // Os efeitos de ataque (Cegueira, Precisão...) e a luz da cena valem para o teste das magias de ataque, que é o acerto delas; cura, defesa e controle não atacam
            const attacking = isAttackSpell(spell);
            const effects = attacking ? combatantAttackDice(combat, charsheet.id) : undefined;
            // Passivas (Não-Elementalista +1d20, Domínio Elemental +2) e habilidades ativadas (Ritmo da Batalha +2 no acerto das magias de ataque) somam ao teste
            const fromPassives = spellHitExtras(passives, contextFor(), spell);
            const fromAbilities = attacking ? effectHitBonus(myEffects) : { flat: 0, notes: [] as string[] };
            // Margem de crítico das magias de ataque: 20, menos o que as passivas (Ascensão Arcana 19) e as habilidades ativadas (Forma Primordial −2) tiram
            const marginCut = attacking
                ? { fromPassives: critMarginReduction(passives, contextFor(spellAttack.targeting.targetId), 'spell', spell), fromEffects: effectCritMarginReduction(myEffects) }
                : undefined;
            const test = rollSpellTest(charsheet, {
                extraDice: (effects?.advantages ?? 0) + fromPassives.advantages,
                lessDice: effects?.disadvantages,
                notes: [ ...(effects?.notes ?? []), ...fromPassives.notes, ...fromAbilities.notes, ...(marginCut?.fromPassives.notes ?? []), ...(marginCut?.fromEffects.notes ?? []), ...plan.notes ],
                flatBonus: fromPassives.flat + fromAbilities.flat,
                bonusDice: plan.testDice,
                critMargin: critMargin(20, (marginCut?.fromPassives.reduction ?? 0) + (marginCut?.fromEffects.reduction ?? 0) + (attacking ? plan.critMarginReduction : 0))
            });
            const succeeded = spellCastSucceeded(test.total, spellCastDifficulty(spell.level, stage));
            // Acerto crítico: só a magia de ataque conjurada com sucesso (cura, defesa e controle não atacam); o dano dela sai vezes o multiplicador ao efetuar
            const critical = attacking && succeeded && test.critical;
            // Só uma conjuração com sucesso deixa efetuar a magia; o botão já está lá quando o cartão aparece no chat
            if (succeeded && hasSpellEffectDice(spell, stage)) markPending(spellKey, stage, critical, plan.effectSpecs);
            await sendCombatChatMessage(buildSpellCastMessage(playerName, spell, stage, test, mpCost, { critical }), MessageType.DICE);
            // Conjuração com sucesso de magia de ataque: o teste de magia é o acerto e o mestre confirma o resultado contra o alvo
            if (succeeded) await spellAttack.declareSpell(spell, test, { opportunity, critical });

            // Gasta a ação da rodada que a magia pede (Padrão, Bônus, Movimento, Reação, Completa). É aviso, nunca trava: o mestre decide
            // o que vale quando a ação já tinha acabado.
            // A Conjuração Rápida troca a ação por Bônus; a segunda magia da Teia da Realidade não gasta ação (a da primeira já pagou pelas duas)
            if (myCombatant && combat?.phase === 'ACTION' && plan.execution !== null && executionSlot(plan.execution)) {
                try {
                    await campaignService.spendCombatAction(campaign.id, { combatantId: charsheet.id, execution: plan.execution, ...(plan.quickCast ? { quickCast: true } : {}) })
                } catch (actionError) {
                    const { response: actionResponse } = asRequestError(actionError)
                    if (actionResponse?.status === 409 && actionResponse.data?.code === 'ACTION_UNAVAILABLE') {
                        enqueueSnackbar(`Você já não tinha a ação ${plan.execution} disponível nesta rodada. Avise o mestre.`, { variant: 'warning' })
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
                        // A manutenção é metade do custo do estágio: a metamagia e o +1 da Teia da Realidade são pagamento único
                        await campaignService.startSustainedSpell(campaign.id, { combatantId: charsheet.id, spellKey, spellName: spell.name, stage, cost: stageCost })
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

            // O que foi ligado vale só para esta conjuração; a Teia da Realidade abre o par na primeira magia e fecha na segunda
            setSelectedOptions([]);
            if (twinRole === 'first') { setTwinArmed(false); setTwinSecond(true); } else if (twinRole === 'second') setTwinSecond(false);

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
            // Passivas (Feitiçaria, Magia Resiliente, Manipulação Elemental...) e habilidades ativadas (Trilha da Fortuna) somam ao dano ou à cura do estágio
            const context = contextFor(spellAttack.targeting.targetId);
            // Conjurada em crítico: o dano do estágio sai vezes o multiplicador (×2, ou o que uma habilidade sobe); a duração não dobra
            const effect = rollSpellEffect(
                spell,
                stage,
                // Os acréscimos da conjuração (metamagia, Fixação no estágio máximo, Magia Guiada) ficaram guardados com ela
                [ ...spellEffectSpecs(passives, context, spell), ...effectDamageSpecs(myEffects, context, 'spell'), ...(pendingExtras[spellKey] ?? []) ],
                pendingCriticals[spellKey] ? { critMultiplier: critMultiplier(critMultiplierSources(passives, context, 'spell', spell)) } : {}
            );
            // O botão "Efetuar" permanece depois de apertado (decisão do dono): só sai ao descartar a conjuração (X) ou quando uma nova conjuração da magia o troca
            await sendCombatChatMessage(buildSpellEffectMessage(playerName, effect), MessageType.DICE);
            // O dano rolado se junta ao ataque que a conjuração declarou ao mestre (se houve alvo)
            await spellAttack.attachSpellDamage(spell, effect.totalDamage, effect.critMultiplier !== undefined);
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
        pendingCriticals,
        clearPending,
        myCombatantId: myCombatant?.id,
        mpLimitEnforced,
        mpLimit,
        mpSpentThisTurn,
        mpLimitReleased,
        sustainedActive,
        exceedsMpLimit,
        spellCost,
        stageRule,
        castSpell,
        endSustained,
        effectSpell,
        planFor,
        fixationStage,
        cast: {
            selected: selectedOptions,
            toggleOption: (id) => { setSelectedOptions(current => (current.includes(id) ? current.filter(entry => entry !== id) : [ ...current, id ])); },
            twin: { available: twinAvailable, armed: twinArmed, waitingSecond: twinSecond },
            armTwin: (armed) => { setTwinArmed(armed); },
            cancelTwin: () => { setTwinArmed(false); setTwinSecond(false); },
            quickCastReady
        }
    };
}
