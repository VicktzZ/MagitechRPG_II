/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import ElementIcon from '@components/misc/ElementIcon';
import { useCampaignCurrentCharsheetContext, useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { postCampaignStats } from '@utils/campaignStatsClient';
import { MessageType } from '@enums';
import { Message } from '@models';
import type { SpellDTO } from '@models/dtos';
import { charsheetEntity } from '@utils/firestoreEntities';
import {
    castSpell,
    buildSpellCastMessage,
    buildInsufficientMpMessage,
    buildMpLimitExceededMessage
} from '@utils/combat/spellRoller';
import { getMpLimit, isMpLimitEnforced } from '@utils/mpLimit';
import { campaignService } from '@services';
import { useSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import {
    Bolt,
    Delete,
    ExpandMore,
    LockOutlined
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Box,
    Button,
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
import { getStageProgress, materializeUnlocked, spellStageCount, usesStageUnlock, withoutSpell } from '@utils/spellStages';

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
interface SpellStageProps {
    stage: number
    description: string
    spell: SpellDTO
    onCast?: (stage: 1 | 2 | 3) => void | Promise<void>
    isCasting?: boolean
    canCast?: boolean
    currentMp?: number
    /** Preenchido quando a conjuração estouraria o limite de MP por turno */
    blockedReason?: string
}

function SpellStage({ stage, description, spell, onCast, isCasting, canCast, currentMp, blockedReason }: SpellStageProps): ReactElement {
    let mpCost = Number(spell.mpCost)
    let extraCost: Record<string, number> = {
        'estágio 1': 0,
        'estágio 2': 1,
        'estágio 3': 2
    }

    if (Number(spell.level) === 4)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 4,
            'maestria': 9
        }
        
    if (Number(spell.level) === 3)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 5
        }

    if (Number(spell.level) === 2)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 4
        }

    if (stage === 2) mpCost += extraCost['estágio 2']
    if (stage === 3) mpCost += extraCost['estágio 3']
    if (stage === 4) mpCost += extraCost['maestria']

    const getStageColor = (stageNum: number) => {
        if (stageNum === 4) return { color: color.amberHover }; // Maestria
        switch (stageNum) {
        case 1:
            return { color: color.inkMuted };
        case 2:
            return { color: color.ink };
        case 3:
            return { color: color.amber };
        default:
            return { color: color.inkMuted };
        }
    };

    const stageConfig = getStageColor(stage);

    return (
        <Paper 
            elevation={1}
            sx={{ 
                p: 2, 
                mb: 2,
                border: '1px solid',
                borderColor: alpha(stageConfig.color, 0.25),
                borderRadius: 2,
                bgcolor: alpha(stageConfig.color, 0.06)
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} gap={1} flexWrap="wrap">
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: stageConfig.color,
                        fontWeight: 700
                    }}
                >
                    {stage !== 4 ? `Estágio ${stage}` : 'Maestria'}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Tooltip
                        title={typeof currentMp === 'number'
                            ? `${currentMp} / custo ${mpCost} MP`
                            : `Custo ${mpCost} MP`
                        }
                    >
                        <Chip
                            label={`${mpCost} MP`}
                            sx={{
                                bgcolor: alpha(color.mp, 0.14),
                                color: color.mp,
                                fontWeight: 600
                            }}
                        />
                    </Tooltip>
                    {onCast && stage !== 4 && (
                        <Tooltip title={canCast === false
                            ? `MP insuficiente (precisa de ${mpCost})`
                            : blockedReason ?? `Conjurar — gasta ${mpCost} MP`
                        }>
                            <span>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Bolt fontSize="small" />}
                                    disabled={isCasting || canCast === false}
                                    onClick={() => { void onCast(stage as 1 | 2 | 3) }}
                                    sx={{
                                        bgcolor: stageConfig.color,
                                        color: 'background.default',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        opacity: blockedReason ? 0.55 : 1,
                                        '&:hover': {
                                            bgcolor: stageConfig.color,
                                            filter: 'brightness(0.9)'
                                        }
                                    }}
                                >
                                    Conjurar
                                </Button>
                            </span>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            <Typography 
                variant="body2" 
                sx={{ 
                    lineHeight: 1.6,
                    textAlign: 'justify'
                }}
            >
                {description}
            </Typography>
        </Paper>
    )
}

export default function SpellsSection(): ReactElement {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();

    const [ expandedSpell, setExpandedSpell ] = useState<string | false>(false)
    const [ castingSpellId, setCastingSpellId ] = useState<string | null>(null)

    // Limite de MP por turno: só vale em combate ativo, para quem participa dele (utils/mpLimit.ts)
    const combat = campaign?.session?.combat
    const myCombatant = combat?.isActive ? combat.combatants?.find(c => c.id === charsheet?.id) : undefined
    const mpLimitEnforced = Boolean(myCombatant) && Boolean(charsheet) && isMpLimitEnforced(charsheet, campaign?.mode)
    const mpLimit = charsheet ? getMpLimit(charsheet) : 0
    const mpSpentThisTurn = myCombatant?.mpSpentThisTurn ?? 0
    const mpLimitReleased = Boolean(myCombatant?.mpLimitOverride)
    const exceedsMpLimit = (cost: number): boolean => mpLimitEnforced && !mpLimitReleased && mpSpentThisTurn + cost > mpLimit

    const sendCombatChatMessage = async (text: string) => {
        if (!session?.user) return;
        await handleSendMessage(new Message({
            text,
            type: MessageType.COMBAT_LOG,
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

    const handleCastSpell = async (spell: SpellDTO, stage: 1 | 2 | 3) => {
        if (!charsheet?.id) return;
        const spellKey = spell.id || spell.name;
        if (castingSpellId) return;

        const progress = getStageProgress(charsheet, spellKey, spellStageCount(spell), stageRule);
        if (stage > progress.unlocked) {
            enqueueSnackbar(`O estágio ${stage} de ${spell.name} ainda está bloqueado. Evolua a magia primeiro.`, { variant: 'warning' });
            return;
        }

        const result = castSpell(spell, stage);
        const playerName = charsheet.name || session?.user?.name || 'Jogador';
        const currentMp = Number(charsheet.stats?.mp ?? 0);

        if (currentMp < result.mpCost) {
            await sendCombatChatMessage(buildInsufficientMpMessage(playerName, spell, result.mpCost, currentMp));
            enqueueSnackbar(`MP insuficiente para conjurar ${spell.name}`, { variant: 'warning' });
            return;
        }

        if (exceedsMpLimit(result.mpCost)) {
            await sendCombatChatMessage(buildMpLimitExceededMessage(playerName, spell, result.mpCost, mpSpentThisTurn, mpLimit));
            enqueueSnackbar(`Limite de MP por turno excedido (${mpSpentThisTurn}/${mpLimit})`, { variant: 'warning' });
            return;
        }

        let reservedMp = false;

        try {
            setCastingSpellId(spellKey);

            // O servidor é quem decide: registra o gasto no turno e recusa (409) o que passar do limite
            if (myCombatant) {
                await campaignService.spendCombatMp(campaign.id, { combatantId: charsheet.id, value: result.mpCost });
                reservedMp = true;
            }

            const newMp = Math.max(0, currentMp - result.mpCost);
            await updateCharsheet({ 'stats.mp': newMp });
            await sendCombatChatMessage(buildSpellCastMessage(playerName, result));

            // Estatísticas: magia conjurada + MP gasto
            postCampaignStats(campaign.id, [ {
                charsheetId: charsheet.id,
                userId: session?.user?.id,
                charsheetName: charsheet.name,
                inc: {
                    'resources.spellsCast': 1,
                    'resources.mpSpent': result.mpCost
                }
            } ]);
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'MP_LIMIT_EXCEEDED') {
                // Estado local defasado: o servidor já tinha mais MP gasto neste turno
                const { spent = 0, limit = 0 } = response.data;
                await sendCombatChatMessage(buildMpLimitExceededMessage(playerName, spell, result.mpCost, spent, limit));
                enqueueSnackbar(response.data.error ?? 'Limite de MP por turno excedido', { variant: 'warning' });
            } else {
                if (reservedMp) {
                    // Desfaz a reserva para a conjuração que falhou não consumir o limite do turno
                    void campaignService.spendCombatMp(campaign.id, { combatantId: charsheet.id, value: -result.mpCost }).catch(() => undefined);
                }
                console.error('Erro ao conjurar magia:', error);
                enqueueSnackbar('Erro ao conjurar magia', { variant: 'error' });
            }
        } finally {
            setCastingSpellId(null);
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

    const handleSetSpellStage = async (spell: SpellDTO, stage: 1 | 2 | 3) => {
        if (!charsheet?.id) return

        const spellId = spell.id || spell.name
        if (!spellId) return

        const progress = getStageProgress(charsheet, spellId, spellStageCount(spell), stageRule)
        if (stage > progress.unlocked) return

        try {
            const update: Record<string, unknown> = {
                spellStages: {
                    ...(charsheet.spellStages || {}),
                    [spellId]: stage
                }
            }
            // Ficha antiga: grava o estágio que a magia já tinha liberado antes de trocar o ativo
            const unlocked = materializeUnlocked(charsheet.spellUnlocked, spellId, progress)
            if (unlocked !== (charsheet.spellUnlocked ?? {})) update['spellUnlocked'] = unlocked

            await charsheetEntity.update(charsheet.id, update as any)

            enqueueSnackbar(`Estágio da magia "${spell.name}" definido para ${stage}!`, { variant: 'success' })
        } catch (error) {
            console.error('Erro ao atualizar estágio da magia:', error)
            enqueueSnackbar('Erro ao atualizar estágio da magia', { variant: 'error' })
        }
    }

    // Evoluir: libera o próximo estágio, sem custo, e já o deixa ativo
    const handleUnlockStage = async (spell: SpellDTO, stage: 1 | 2 | 3) => {
        if (!charsheet?.id) return

        const spellId = spell.id || spell.name
        if (!spellId) return

        try {
            await charsheetEntity.update(charsheet.id, {
                spellUnlocked: { ...(charsheet.spellUnlocked || {}), [spellId]: stage },
                spellStages: { ...(charsheet.spellStages || {}), [spellId]: stage }
            } as any)

            enqueueSnackbar(`${spell.name} evoluiu: estágio ${stage} desbloqueado!`, { variant: 'success' })
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
                                    MP neste turno
                                </Typography>
                                <Tooltip
                                    title={mpLimitReleased
                                        ? 'O mestre liberou o limite de MP por turno até o início do seu próximo turno.'
                                        : 'MP gasto em magias desde o início do seu turno / limite por turno. Reações em turnos alheios contam.'}
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
                                    const progress = getStageProgress(charsheet, spellId, spellStageCount(spell), stageRule)
                                    const selectedStage = progress.active
                                    const nextStage = progress.next
                                    const availableStages: Array<1 | 2 | 3> = [ 1 ]
                                    if (spell.stages?.[1]) availableStages.push(2)
                                    if (spell.stages?.[2]) availableStages.push(3)
                                    
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
                                            
                                            <AccordionDetails sx={{ p: 3 }}>
                                                <Stack spacing={2}>
                                                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">Estágio ativo:</Typography>
                                                        {availableStages.map(stage => {
                                                            const locked = stage > progress.unlocked
                                                            return (
                                                                <Tooltip key={stage} title={locked ? 'Evolua a magia para desbloquear este estágio' : ''} arrow>
                                                                    <span>
                                                                        <Chip
                                                                            label={`Estágio ${stage}`}
                                                                            size="small"
                                                                            clickable={!locked}
                                                                            disabled={locked}
                                                                            icon={locked ? <LockOutlined /> : undefined}
                                                                            aria-label={locked ? `Estágio ${stage} bloqueado` : `Estágio ${stage}`}
                                                                            onClick={() => { void handleSetSpellStage(spell, stage) }}
                                                                            color={selectedStage === stage ? 'primary' : 'default'}
                                                                            variant={selectedStage === stage ? 'filled' : 'outlined'}
                                                                        />
                                                                    </span>
                                                                </Tooltip>
                                                            )
                                                        })}
                                                        {progress.enabled && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                                Desbloqueado: {progress.unlocked} de {progress.count}
                                                            </Typography>
                                                        )}
                                                        {nextStage && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                aria-label={`Evoluir ${spell.name} para o estágio ${nextStage}`}
                                                                onClick={() => { void handleUnlockStage(spell, nextStage) }}
                                                                sx={{ py: 0, px: 1 }}
                                                            >
                                                                Evoluir
                                                            </Button>
                                                        )}
                                                    </Box>

                                                    {(() => {
                                                        const description = spell.stages?.[selectedStage - 1]
                                                        if (!description) return null
                                                        const previewCost = castSpell(spell, selectedStage).mpCost
                                                        const currentMp = Number(charsheet.stats?.mp ?? 0)
                                                        const limitBlockedReason = exceedsMpLimit(previewCost)
                                                            ? `Limite de MP por turno: ${mpSpentThisTurn}/${mpLimit} gastos e esta conjuração custa ${previewCost}. Clique para avisar o mestre.`
                                                            : undefined
                                                        return (
                                                            <SpellStage
                                                                spell={spell}
                                                                stage={selectedStage}
                                                                description={description}
                                                                onCast={(stg) => handleCastSpell(spell, stg)}
                                                                isCasting={castingSpellId === (spell.id || spell.name)}
                                                                canCast={currentMp >= previewCost}
                                                                currentMp={currentMp}
                                                                blockedReason={limitBlockedReason}
                                                            />
                                                        )
                                                    })()}
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
