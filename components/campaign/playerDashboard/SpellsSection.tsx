/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import ElementIcon from '@components/misc/ElementIcon';
import StageLadder from '@components/spells/StageLadder';
import { useCampaignCurrentCharsheetContext, useCampaignContext } from '@contexts';
import type { SpellDTO } from '@models/dtos';
import { charsheetEntity } from '@utils/firestoreEntities';
import { isSustainedSpell } from '@utils/combat/sustainedSpells';
import { campaignRevealsSpellStages } from '@utils/spellReveal';
import { useSnackbar } from 'notistack';
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
import { canEvolve, formatEvolutionPoints, getEvolutionPoints, getSpellProgress, spellStageLabel, withoutSpell, type SpellStage } from '@utils/spellStages';
import CastModifiersPanel from './spells/CastModifiersPanel';
import { useSpellCasting } from './spells/SpellCastingContext';

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
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    // Conjurar, efetuar e desconjurar: o estado é do painel inteiro (a seção "Ações" conjura pelos mesmos caminhos)
    const {
        castingSpellId, effectingSpellId, pendingEffects, clearPending, mpLimitEnforced, mpLimit, mpSpentThisTurn, mpLimitReleased, sustainedActive, exceedsMpLimit, stageRule,
        castSpell: handleCastSpell, endSustained: handleEndSustained, effectSpell: handleEffectSpell, planFor, fixationStage
    } = useSpellCasting();

    const [ expandedSpell, setExpandedSpell ] = useState<string | false>(false)
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
                                {/* Metamagia, Teia da Realidade, Fixação Mágica: o que vale para a próxima conjuração (some sem essas habilidades) */}
                                <CastModifiersPanel />
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
                                                        // O custo que se cobra: o do estágio mais a metamagia e a Teia da Realidade que estão ligadas
                                                        costOf={(stage) => planFor(spell, stage as SpellStage).cost}
                                                        evolution={progress.enabled ? { points: evolutionPoints, onEvolve: async () => { await handleEvolve(spell) } } : undefined}
                                                        cast={{
                                                            onCast: async (stage) => { await handleCastSpell(spell, stage) },
                                                            isCasting: castingSpellId === spellId,
                                                            fixation: fixationStage(spell) !== null ? { stage: fixationStage(spell)! } : undefined,
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
