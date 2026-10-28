/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import ElementIcon from '@components/misc/ElementIcon';
import StageLadder from '@components/spells/StageLadder';
import AttackTargetPicker from './attacks/AttackTargetPicker';
import { isAttackSpell, useSpellAttack } from './attacks/useSpellAttack';
import { isOpportunitySpell, OPPORTUNITY_SPELL_HELP } from '@utils/combat/opportunities';
import { useCampaignCurrentCharsheetContext, useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { postCampaignStats } from '@utils/campaignStatsClient';
import { MessageType } from '@enums';
import { Message } from '@models';
import type { SpellDTO } from '@models/dtos';
import { charsheetEntity } from '@utils/firestoreEntities';
import { rollSpellTest } from '@utils/combat/hitTest';
import {
    buildSpellCastMessage,
    buildSpellEffectMessage,
    buildInsufficientMpMessage,
    buildMpLimitExceededMessage,
    getSpellMpCost,
    hasSpellEffectDice,
    rollSpellEffect
} from '@utils/combat/spellRoller';
import { spellCastDifficulty, spellCastSucceeded } from '@utils/spellDifficulty';
import { isSustainedSpell, sustainedEffects } from '@utils/combat/sustainedSpells';
import { campaignRevealsSpellStages } from '@utils/spellReveal';
import { usePendingSpellEffects } from '@hooks/usePendingSpellEffects';
import { getMpLimit, isMpLimitEnforced } from '@utils/mpLimit';
import { campaignService } from '@services';
import { useSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import {
    Delete,
    ExpandMore
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Box,
    Chip,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { color } from '@themes/tokens';
import { type ReactElement, useState } from 'react';
import { asRequestError } from '@utils/errors';
import { executionSlot } from '@utils/combat/engine/actionBudget';
import { canEvolve, formatEvolutionPoints, getEvolutionPoints, getSpellProgress, spellStageLabel, usesStageUnlock, withoutSpell, type SpellStage } from '@utils/spellStages';

/** Nível e estágio são escalas ordenadas: neutros que clareiam até o âmbar no topo (o número vai sempre em texto) */
function getSpellLevelColor(level: number) {
    switch (level) {
    case 1:
        return { color: color.inkMuted };
    case 2:
        return { color: color.ink };
    case 3:
        return { color: color.amber };
    case 4:
        return { color: color.amberHover };
    default:
        return { color: color.inkMuted };
    }
}
export default function SpellsSection(): ReactElement {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    // Ataque assistido: em combate, na fase de ação, a magia de ataque conjurada com sucesso vai ao mestre para o alvo escolhido aqui
    const spellAttack = useSpellAttack();

    const [ expandedSpell, setExpandedSpell ] = useState<string | false>(false)
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

    const handleCastSpell = async (spell: SpellDTO, stage: SpellStage) => {
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
    const handleEndSustained = async (spell: SpellDTO) => {
        if (!charsheet?.id || !campaign?.id) return;
        try {
            await campaignService.endSustainedSpells(campaign.id, { combatantId: charsheet.id, spellKey: spell.id || spell.name });
        } catch (error) {
            console.error('Erro ao desconjurar magia:', error);
            enqueueSnackbar('Erro ao desconjurar a magia', { variant: 'error' });
        }
    }

    /** Efetuar a magia conjurada com sucesso: rola os dados do estágio (dano, cura, duração...) e manda o cartão do efeito ao chat */
    const handleEffectSpell = async (spell: SpellDTO, stage: SpellStage) => {
        if (!charsheet?.id || effectingSpellId) return;
        const spellKey = spell.id || spell.name;
        const playerName = charsheet.name || session?.user?.name || 'Jogador';

        try {
            setEffectingSpellId(spellKey);
            const effect = rollSpellEffect(spell, stage);
            // O botão some na hora; se o chat não receber a mensagem ele volta, para o jogador não perder a conjuração
            clearPending(spellKey);
            try {
                await sendCombatChatMessage(buildSpellEffectMessage(playerName, effect), MessageType.DICE);
            } catch (error) {
                markPending(spellKey, stage);
                throw error;
            }
            // O dano rolado se junta ao ataque que a conjuração declarou ao mestre (se houve alvo)
            await spellAttack.attachSpellDamage(spell, effect.totalDamage);
        } catch (error) {
            console.error('Erro ao efetuar magia:', error);
            enqueueSnackbar('Erro ao efetuar a magia', { variant: 'error' });
        } finally {
            setEffectingSpellId(null);
        }
    }

    const handleSpellExpand = (spellName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSpell(isExpanded ? spellName : false)
    }

    // Fora do Roguelite, `spellSpace` guarda os espaços LIVRES (a criação da ficha
    // desconta 1 por magia aprendida); no Roguelite ele é a capacidade total.
    const isRoguelite = campaign?.mode === 'Roguelite';

    const handleDeleteSpell = async (spellToDelete: SpellDTO) => {
        if (!charsheet?.id) return;
        
        try {
            // Remove só a magia clicada (por id) — filtrar por nome apagava
            // todas as cópias com o mesmo nome
            const spellKey = spellToDelete.id || spellToDelete.name;
            const index = charsheet.spells.findIndex(spell => (spell.id || spell.name) === spellKey);
            if (index === -1) return;

            const newSpells = charsheet.spells.filter((_, i) => i !== index);
            const update: Record<string, unknown> = { spells: newSpells };

            const currentStages = charsheet.spellStages || {};
            if (spellKey in currentStages) {
                update['spellStages'] = withoutSpell(currentStages, spellKey);
            }
            if (spellKey in (charsheet.spellUnlocked || {})) {
                update['spellUnlocked'] = withoutSpell(charsheet.spellUnlocked, spellKey);
            }

            // Mesma regra da ficha: excluir devolve o espaço e o ponto de magia
            if (!isRoguelite) {
                update['spellSpace'] = (charsheet.spellSpace || 0) + 1;
                update['points.magics'] = (charsheet.points?.magics ?? 0) + (Number(spellToDelete.level) >= 3 ? 2 : 1);
            }

            await charsheetEntity.update(charsheet.id, update as any);
            enqueueSnackbar('Magia excluída com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao excluir magia:', error);
            enqueueSnackbar('Erro ao excluir magia', { variant: 'error' });
        }
    }

    // Evoluir: gasta os pontos de evolução que o próximo estágio custa (ver `stageRule`) e libera o estágio
    const evolutionPoints = getEvolutionPoints(charsheet?.points)
    const handleEvolve = async (spell: SpellDTO) => {
        if (!charsheet?.id) return

        const spellId = spell.id || spell.name
        if (!spellId) return

        const progress = getSpellProgress(spell, charsheet, { enabled: stageRule })
        const stage = progress.next
        const cost = progress.nextCost
        if (stage === null || cost === null) return

        if (!canEvolve(progress, evolutionPoints)) {
            enqueueSnackbar(`Você precisa de ${formatEvolutionPoints(cost)} para evoluir ${spell.name}. Peça ao mestre.`, { variant: 'warning' })
            return
        }

        try {
            await charsheetEntity.update(charsheet.id, {
                'points.evolution': evolutionPoints - cost,
                spellUnlocked: { ...(charsheet.spellUnlocked || {}), [spellId]: stage }
            } as any)

            const unlockedLabel = spellStageLabel(spell.level, stage, spell.element).toLowerCase()
            enqueueSnackbar(`${spell.name} evoluiu: ${unlockedLabel} desbloqueado (-${formatEvolutionPoints(cost)})!`, { variant: 'success' })
        } catch (error) {
            console.error('Erro ao evoluir magia:', error)
            enqueueSnackbar('Erro ao evoluir a magia', { variant: 'error' })
        }
    }

    const allSpells = charsheet.spells
    const totalSpellSlots = isRoguelite
        ? (charsheet.spellSpace || 0)
        : allSpells.length + Math.max(0, charsheet.spellSpace || 0)
    const spellsByLevel = {
        1: allSpells.filter(spell => Number(spell.level) === 1),
        2: allSpells.filter(spell => Number(spell.level) === 2),
        3: allSpells.filter(spell => Number(spell.level) === 3),
        4: allSpells.filter(spell => Number(spell.level) === 4)
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* A moldura e o título vêm do Section da campanha */}
            <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Stack spacing={3}>
                    <AttackTargetPicker targeting={spellAttack.targeting} />

                    {/* Espaço de Magias */}
                    <Box 
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: 'background.raised',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        {/* Espaço de Magias */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Espaço de Magias
                            </Typography>
                            <Chip
                                label={`${allSpells.length} / ${totalSpellSlots}`}
                                color={allSpells.length >= totalSpellSlots ? 'warning' : 'primary'}
                                variant="filled"
                                sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                            />
                        </Box>

                        {/* Limite de MP por turno (só em combate) */}
                        {mpLimitEnforced && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    MP nesta rodada
                                </Typography>
                                <Tooltip
                                    title={mpLimitReleased
                                        ? 'O mestre liberou o limite de MP por turno até a rodada virar.'
                                        : 'MP gasto em magias nesta rodada / limite por turno. Reações em turnos alheios contam, e o gasto zera quando a rodada vira.'}
                                >
                                    <Chip
                                        label={`${mpSpentThisTurn} / ${mpLimit}${mpLimitReleased ? ' (liberado)' : ''}`}
                                        color={mpLimitReleased ? 'success' : mpSpentThisTurn >= mpLimit ? 'error' : 'info'}
                                        variant="filled"
                                        sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                                    />
                                </Tooltip>
                            </Box>
                        )}

                        {/* Estatísticas por Nível */}
                        <Stack direction="row" spacing={3}>
                            {[ 1, 2, 3, 4 ].map(level => {
                                const levelConfig = getSpellLevelColor(level);
                                const count = spellsByLevel[level as keyof typeof spellsByLevel].length;
                                return (
                                    <Stack key={level} alignItems="center" spacing={0.5}>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Typography variant="h6" sx={{ color: levelConfig.color, fontWeight: 700 }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Nível {level}
                                        </Typography>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Box>

                    {/* Lista de Spells */}
                    <Box>
                        {allSpells.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 4, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    bgcolor: 'transparent'
                                }}
                            >
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    Nenhuma magia conhecida
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    O grimório está vazio. Aprenda novas spells para começar a conjurar!
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {allSpells.map(spell => {
                                    const levelConfig = getSpellLevelColor(Number(spell.level));
                                    const spellId = spell.id || spell.name
                                    const progress = getSpellProgress(spell, charsheet, { enabled: stageRule })
                                    const evolvable = progress.enabled && canEvolve(progress, evolutionPoints)
                                    const currentMp = Number(charsheet.stats?.mp ?? 0)

                                    return (
                                        <Accordion
                                            key={spell.name}
                                            expanded={expandedSpell === spell.name}
                                            onChange={handleSpellExpand(spell.name)}
                                            elevation={2}
                                            sx={{
                                                bgcolor: 'background.raised',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                transition: 'border-color 120ms',
                                                '&:before': { display: 'none' },
                                                '&:hover': {
                                                    borderColor: color.borderStrong
                                                }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMore sx={{ color: levelConfig.color }} />}
                                                sx={{
                                                    minHeight: 64,
                                                    bgcolor: alpha(levelConfig.color, 0.08),
                                                    borderRadius: '8px 8px 0 0',
                                                    '& .MuiAccordionSummary-content': {
                                                        alignItems: 'center',
                                                        gap: 2
                                                    }
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                                    <Box 
                                                        sx={{
                                                            p: 0.8,
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <ElementIcon 
                                                            element={spell.element}
                                                            colored
                                                            sx={{ fontSize: '1.2rem' }} 
                                                        />
                                                    </Box>
                                                    <Box flex={1}>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{ 
                                                                fontWeight: 700,
                                                                color: levelConfig.color,
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {spell.name}
                                                        </Typography>
                                                        <Box display="flex" gap={1} flexWrap="wrap">
                                                            <Chip 
                                                                label={spell.element} 
                                                                size="small" 
                                                                variant="outlined"
                                                                sx={{ 
                                                                    borderColor: 'divider',
                                                                    color: 'text.primary',
                                                                    fontWeight: 600
                                                                }} 
                                                            />
                                                            <Chip 
                                                                label={`Nível ${spell.level}`} 
                                                                size="small" 
                                                                sx={{
                                                                    bgcolor: alpha(levelConfig.color, 0.14),
                                                                    color: levelConfig.color,
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                            {progress.enabled && progress.count > 1 && (
                                                                <Chip
                                                                    label={`${progress.unlocked} de ${progress.count} estágios`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    data-testid={`spell-progress-${spellId}`}
                                                                    sx={{ borderColor: 'divider', color: 'text.secondary' }}
                                                                />
                                                            )}
                                                            {evolvable && (
                                                                <Chip label="Pode evoluir" size="small" variant="outlined" color="primary" />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                
                                                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                                    <Tooltip title="Alcance">
                                                        <Chip 
                                                            label={spell.range} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: 'action.hover',
                                                                color: 'text.primary',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Tempo de Execução">
                                                        <Chip 
                                                            label={spell.execution} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: 'action.hover',
                                                                color: 'text.primary',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Tipo de Spell">
                                                        <Chip 
                                                            label={spell.type} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: 'action.hover',
                                                                color: 'text.primary',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Excluir Magia">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void handleDeleteSpell(spell);
                                                            }}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </AccordionSummary>
                                            
                                            <AccordionDetails sx={{ p: { xs: 1.5, sm: 3 } }}>
                                                <Stack spacing={2}>
                                                    {progress.enabled && (
                                                        <Typography variant="caption" color="text.secondary" data-testid="evolution-points">
                                                            Pontos de evolução: {evolutionPoints}
                                                        </Typography>
                                                    )}
                                                    <StageLadder
                                                        spell={spell}
                                                        progress={progress}
                                                        revealLocked={progress.enabled && campaignRevealsSpellStages(campaign)}
                                                        evolution={progress.enabled ? { points: evolutionPoints, onEvolve: async () => { await handleEvolve(spell) } } : undefined}
                                                        cast={{
                                                            onCast: async (stage) => { await handleCastSpell(spell, stage) },
                                                            isCasting: castingSpellId === spellId,
                                                            currentMp,
                                                            sustained: isSustainedSpell(spell.type) && sustainedActive[spellId]
                                                                ? { activeStage: sustainedActive[spellId], onEnd: async () => { await handleEndSustained(spell) } }
                                                                : undefined,
                                                            effect: {
                                                                pendingStage: pendingEffects[spellId],
                                                                onEffect: async (stage) => { await handleEffectSpell(spell, stage) },
                                                                onDismiss: () => { clearPending(spellId) },
                                                                busy: effectingSpellId === spellId
                                                            },
                                                            blockedReason: (_stage, cost) => (exceedsMpLimit(cost)
                                                                ? `Limite de MP por turno: ${mpSpentThisTurn}/${mpLimit} gastos e esta conjuração custa ${cost}. Clique para avisar o mestre.`
                                                                : undefined)
                                                        }}
                                                    />
                                                </Stack>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
