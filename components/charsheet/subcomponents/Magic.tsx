/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

'use client';

import { Add, Close, LockOutlined } from '@mui/icons-material';
import { alpha, Box, Button, CardContent, Chip, Grid, IconButton, Paper, Stack, styled, Tooltip, Typography, useTheme } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { elementColor } from '@constants';
import { calculateExtraManaCost } from '@utils/roguelite';
import { EVOLUTION_POINT_COST, formatEvolutionPoints, spellStageCount, spellStageLabel, stageAccessText, stageRule } from '@utils/spellStages';
import { color } from '@themes/tokens';
import { MagicPower } from './MagicPower';
import ElementIcon, { resolveElement } from '@components/misc/ElementIcon';

import type { Power, Spell } from '@models/entities';

type MagicTyping<C extends 'magic-spell' | 'magic-power'> =
    C extends 'magic-spell' ?
    {
        magic: Spell,
        id: string,
        isAdding?: boolean,
        onIconClick?: () => void,
        /**
         * Estágio que o cartão mostra ao abrir, para vitrines (a landing). Com a regra de desbloqueio (`unlockedStage`) o cartão abre
         * no estágio liberado mais novo. Trocar de estágio no cartão é só ver o texto e o custo dele: não grava nada.
         */
        initialStage?: 1 | 2 | 3,
        /**
         * Estágio liberado até agora. Sem ele (sistema customizado, Roguelite, modal de escolha) todos os estágios
         * estão abertos; com ele, os estágios acima ficam bloqueados (cadeado, sem texto) e o cartão mostra o progresso.
         */
        unlockedStage?: 1 | 2 | 3,
        /**
         * O mestre liberou a visualização (`utils/spellReveal.ts`): os estágios bloqueados continuam com o cadeado, mas dá para abri-los para
         * ler o texto e ver o custo de MP. Só visualização: não libera nada.
         */
        revealStages?: boolean,
        /** Libera o próximo estágio (botão "Evoluir"); sem ele o cartão só mostra o progresso */
        onUnlockStage?: (stage: 1 | 2 | 3) => void,
        /** Pontos de evolução da ficha: sem pontos para o custo do próximo estágio o botão fica desabilitado. Sem este valor não há cobrança. */
        evolutionPoints?: number,
        /** Pontos que o próximo estágio custa (depende do nível da magia); `null` quando ele só abre pela maestria. Padrão: 1 */
        nextCost?: number | null,
        disabled?: boolean,
        /** Cartão enxuto para listas em grade (ex: modal de escolher magias) */
        compact?: boolean
    }
    :
    {
        magicPower: Power,

        id: string,
        isAdding?: boolean,
        onIconClick?: () => void,
        disabled?: boolean
    }

/** Cadeado em SVG simples: o cartão enxuto evita um componente MUI por botão (listas de centenas de magias) */
function LockMark(): ReactElement {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Z" />
        </svg>
    );
}

/** Rótulo do botão de um estágio: no nível 4 de elemento primário o terceiro é a Maestria (o secundário não tem: "Estágio 3") */
const getStageLabel = (level: number, stage: 0 | 1 | 2, element?: unknown): string => spellStageLabel(level, stage + 1, element);

function MagicSpell({
    magic,
    id,
    isAdding,
    onIconClick,
    initialStage,
    unlockedStage,
    revealStages = false,
    onUnlockStage,
    evolutionPoints,
    nextCost = EVOLUTION_POINT_COST,
    disabled = false
}: MagicTyping<'magic-spell'>): ReactElement {
    const theme = useTheme();
    const hasEvolutionPoint = evolutionPoints === undefined || nextCost === null || evolutionPoints >= nextCost

    // Índice (0 a 2) do último estágio liberado; sem a regra de desbloqueio, todos
    const stageCount = spellStageCount(magic)
    const hasUnlockRule = unlockedStage !== undefined
    const unlockedIndex = Math.min(2, (hasUnlockRule ? Math.max(1, unlockedStage) : 3) - 1) as 0 | 1 | 2
    const nextStage = hasUnlockRule && unlockedStage < stageCount ? (unlockedStage + 1) as 2 | 3 : null
    const nextLabel = nextStage ? spellStageLabel(Number(magic.level), nextStage, magic.element) : ''

    const clampToUnlocked = (stage: number): 0 | 1 | 2 => Math.min(unlockedIndex, Math.min(2, Math.max(0, stage))) as 0 | 1 | 2
    // O cartão abre no estágio liberado mais novo (ou no pedido, nas vitrines sem a regra)
    const startStage = hasUnlockRule ? unlockedIndex : clampToUnlocked(Number(initialStage ?? 1) - 1)

    // Estados
    const [ description, setDescription ] = useState<string>(magic.stages[startStage] ?? magic.stages[0]);
    const [ shownStage, setShownStage ] = useState<number>(startStage);
    const [ extraManaCost, setExtraManaCost ] = useState<number>(calculateExtraManaCost(Number(magic.level), startStage, magic.mpCostIncrease));

    // Elemento para a marca (glifo)
    const elementoColor = elementColor[resolveElement(magic.element)];

    // Dados dos níveis disponíveis
    const availableStages: Array<0 | 1 | 2> = [ 0 ];
    if (magic.stages[1]) availableStages.push(1);
    if (magic.stages[2]) availableStages.push(2);

    // Evoluir a magia mostra o estágio novo
    useEffect(() => {
        setShownStage(startStage)
        setDescription(magic.stages[startStage] ?? magic.stages[0])
        setExtraManaCost(calculateExtraManaCost(Number(magic.level), startStage, magic.mpCostIncrease))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ magic.level, magic.stages, initialStage, unlockedIndex ])
    
    // Ver outro estágio liberado: mostra o texto e o custo de MP dele (só a tela, não grava nada)
    const handleStageChange = (stage: 0 | 1 | 2): void => {
        if (stage > unlockedIndex && !revealStages) return;
        setShownStage(stage);
        setDescription(magic.stages[stage]!);
        setExtraManaCost(calculateExtraManaCost(Number(magic.level), stage, magic.mpCostIncrease));
    };

    // Animações
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut'
            }
        }
    };

    return (
        <motion.div
            data-id={id}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            style={{ pointerEvents: 'auto' }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '30rem', md: '32rem' },
                    height: { xs: 'auto', sm: '35rem', md: '40rem' },
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    bgcolor: 'background.raised',
                    border: '1px solid',
                    borderColor: 'divider',
                    margin: '0 auto',
                    transition: 'border-color 120ms',
                    ...(!disabled && {
                        '&:hover': {
                            borderColor: color.borderStrong
                        }
                    })
                }}
            >
                <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    height: '100%',
                    p: { xs: 2, sm: 2.5, md: 3 },
                    overflow: 'hidden' // Evita transbordamento
                }}>
                    {/* Header com elemento e nome */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2 }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{
                            position: 'relative',
                            pb: 1,
                            width: '100%',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '1px',
                                bgcolor: 'divider'
                            }
                        }}
                    >
                        {/* Badge de elemento */}
                        <Tooltip title={`Elemento: ${magic.element}`} arrow placement="top">
                            <Chip
                                icon={<ElementIcon element={magic.element} colored />}
                                label={magic.element}
                                variant="outlined"
                                sx={{
                                    color: 'text.primary',
                                    borderColor: 'divider',
                                    borderRadius: '16px',
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: elementoColor }
                                }}
                            />
                        </Tooltip>

                        {/* Nome da magia com tooltip */}
                        <Tooltip
                            title={`Magia de ${magic.element}: ${magic.type} de nível ${magic.level}`}
                            arrow
                            placement="top"
                        >
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    color: theme.palette.text.primary,
                                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' },
                                    wordBreak: 'break-word',
                                    width: '100%'
                                }}
                            >
                                {magic.name}
                            </Typography>
                        </Tooltip>
                    </Stack>

                    {/* Informações detalhadas da magia */}
                    <Stack spacing={1.5} sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={alpha(theme.palette.text.primary, 0.8)}
                            >
                                NÍVEL:
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 600
                                }}
                            >
                                {magic.level}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={alpha(theme.palette.text.primary, 0.8)}
                            >
                                CUSTO:
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.info.main,
                                    fontWeight: 600
                                }}
                            >
                                {Number(magic.mpCost) + extraManaCost} MP
                                {extraManaCost > 0 && (
                                    <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                            ml: 0.5,
                                            color: theme.palette.warning.main,
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        (+{extraManaCost})
                                    </Typography>
                                )}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={alpha(theme.palette.text.primary, 0.8)}
                            >
                                TIPO:
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {magic.type}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={alpha(theme.palette.text.primary, 0.8)}
                            >
                                ALCANCE:
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {magic.range}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={alpha(theme.palette.text.primary, 0.8)}
                            >
                                EXECUÇÃO:
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {magic.execution}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Conteúdo da magia (descrição do estágio selecionado) */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 1.5, sm: 2, md: 2.5 },
                            pl: { xs: 2.5, sm: 3, md: 3.5 },
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            flex: 1,
                            position: 'relative',
                            overflow: 'auto', // Permite rolagem se o conteúdo for muito grande
                            // Altura fixa em vez de maxHeight para garantir mesmo tamanho
                            height: { xs: '180px', sm: '200px', md: '220px' }, // Altura fixa padronizada
                            // Barra de rolagem fina e neutra
                            '&::-webkit-scrollbar': {
                                width: '6px',
                                height: '6px'
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: color.borderStrong,
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: color.inkFaint
                                }
                            },
                            // Firefox scrollbar styling
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${color.borderStrong} transparent`
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' }
                            }}
                        >
                            {description}
                        </Typography>
                    </Paper>

                    {/* Estágio bloqueado aberto para leitura (revelado pelo mestre) */}
                    {hasUnlockRule && shownStage > unlockedIndex && (
                        <Typography variant="caption" color="text.secondary" data-testid="spell-revealed-note" sx={{ mt: 1 }}>
                            Estágio ainda bloqueado: revelado pelo mestre só para leitura. Evolua a magia para conjurá-lo.
                        </Typography>
                    )}

                    {/* Progresso: estágio liberado até agora, o que custa o próximo e o botão para liberá-lo */}
                    {hasUnlockRule && (
                        <Stack spacing={0.5} sx={{ mt: 1.5, width: '100%' }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                <Typography variant="caption" color="text.secondary" data-testid="spell-unlocked-stage">
                                    Estágio desbloqueado: <strong>{unlockedStage} de {stageCount}</strong>
                                </Typography>
                                {onUnlockStage && nextStage && nextCost !== null && (
                                    <Tooltip
                                        title={hasEvolutionPoint
                                            ? `Libera o ${nextLabel} desta magia e gasta ${formatEvolutionPoints(nextCost)}`
                                            : `Você precisa de ${formatEvolutionPoints(nextCost)} para evoluir esta magia. Peça ao mestre.`}
                                        arrow
                                        placement="top"
                                    >
                                        <span>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                disabled={disabled || !hasEvolutionPoint}
                                                onClick={() => onUnlockStage(nextStage)}
                                                aria-label={`Evoluir ${magic.name} para o ${nextLabel}`}
                                                sx={{ position: 'relative', zIndex: 10, py: 0.25, px: 1.25 }}
                                            >
                                                {`Evoluir (${nextCost} ${nextCost === 1 ? 'ponto' : 'pontos'})`}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                )}
                            </Stack>
                            {nextStage && (
                                <Typography variant="caption" color="text.secondary" data-testid="spell-next-cost">
                                    {`${nextLabel}: ${stageAccessText(stageRule(magic, nextStage), magic.element).toLowerCase()}`}
                                </Typography>
                            )}
                        </Stack>
                    )}

                    {/* Botões de estágio */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1.5, sm: 1 }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ width: '100%' }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            sx={{ 
                                mt: 2,
                                width: '100%',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 5
                            }}
                        >
                            {availableStages.map(stage => {
                                const locked = stage > unlockedIndex
                                // Revelado pelo mestre: o estágio segue bloqueado (cadeado), mas dá para abrir e ler
                                const viewable = !locked || revealStages
                                const label = getStageLabel(Number(magic.level), stage, magic.element)
                                const stageButton = (
                                    <Button
                                        key={locked ? undefined : stage}
                                        variant="outlined"
                                        color={shownStage === stage ? 'primary' : 'secondary'}
                                        size="small"
                                        disabled={disabled || !viewable}
                                        onClick={() => handleStageChange(stage)}
                                        aria-label={locked ? `${label} bloqueado${revealStages ? ' (texto revelado pelo mestre)' : ''}` : label}
                                        aria-pressed={viewable ? shownStage === stage : undefined}
                                        startIcon={locked ? <LockOutlined fontSize="inherit" /> : undefined}
                                        sx={{
                                            position: 'relative', // Necessário para o z-index funcionar
                                            zIndex: 10,
                                            minWidth: { xs: '80px', sm: 0 },
                                            px: locked ? 1 : 1.5,
                                            py: 0.5,
                                            whiteSpace: 'nowrap',
                                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                            '& .MuiButton-startIcon': { mr: 0.5, ml: 0 },
                                            ...(shownStage === stage && viewable && {
                                                bgcolor: color.amberSubtle,
                                                borderColor: color.amberLine,
                                                color: 'primary.main',
                                                '&:hover': { bgcolor: color.amberSubtle, borderColor: color.amberLine }
                                            })
                                        }}
                                    >
                                        {label}
                                    </Button>
                                )
                                // Botão desabilitado não dispara eventos: o span leva a dica de por que está bloqueado
                                return locked ? (
                                    <Tooltip
                                        key={stage}
                                        title={revealStages ? 'Revelado pelo mestre: dá para ler, mas evolua a magia para desbloquear este estágio' : 'Evolua a magia para desbloquear este estágio'}
                                        arrow
                                        placement="top"
                                    >
                                        <span>{stageButton}</span>
                                    </Tooltip>
                                ) : stageButton
                            })}
                        </Stack>

                        {/* Botão de ação (adicionar ou remover) */}
                        {onIconClick && (
                            <Tooltip title={isAdding ? 'Adicionar magia' : 'Remover magia'} arrow placement="top">
                                <span>
                                    <IconButton
                                        onClick={onIconClick}
                                        aria-label={isAdding ? `Adicionar magia ${magic.name}` : `Remover magia ${magic.name}`}
                                        size="small"
                                        sx={{
                                            color: isAdding ? theme.palette.primary.main : theme.palette.error.main,
                                            bgcolor: alpha(isAdding ? theme.palette.primary.main : theme.palette.error.main, 0.1),
                                            border: `1px solid ${alpha(isAdding ? theme.palette.primary.main : theme.palette.error.main, 0.2)}`,
                                            p: 1,
                                            zIndex: 10,
                                            position: 'relative', // Necessário para o z-index funcionar
                                            '&:hover': {
                                                bgcolor: alpha(isAdding ? theme.palette.primary.main : theme.palette.error.main, 0.2)
                                            },
                                            transition: 'background-color 120ms'
                                        }}
                                    >
                                        {isAdding ? <Add /> : <Close />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>
                </CardContent>
            </Paper>
        </motion.div>
    );
}

/**
 * Cartão enxuto, só com elementos HTML simples dentro de um único componente estilizado: numa lista
 * de centenas de magias, dezenas de componentes MUI por cartão (cada `sx` é recalculado a cada
 * renderização) travavam a tela ao filtrar. A cor da ação (adicionar/remover) chega por variáveis CSS.
 * O elemento aparece só no glifo; o cartão é plano (fundo raised, borda divider).
 */
const CompactSpellCard = styled('div')(({ theme }) => ({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 16,
    borderRadius: 8,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.raised,
    transition: 'border-color 120ms',
    '&:hover': { borderColor: color.borderStrong },
    '& .mc-header': { display: 'flex', alignItems: 'flex-start', gap: 8 },
    '& .mc-icon': { display: 'flex', marginTop: 2 },
    '& .mc-icon svg': { fontSize: 26 },
    '& .mc-title': { flex: 1, minWidth: 0 },
    '& .mc-name': {
        fontSize: '1.15rem',
        lineHeight: 1.2,
        fontWeight: 700,
        wordBreak: 'break-word',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    '& .mc-sub': { fontSize: '0.85rem', lineHeight: 1.3, color: theme.palette.text.secondary },
    '& .mc-chips': { display: 'flex', flexWrap: 'wrap', gap: 4 },
    '& .mc-chip': {
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 9px',
        borderRadius: 12,
        fontSize: '0.8rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        border: `1px solid ${alpha(theme.palette.text.primary, 0.35)}`
    },
    '& .mc-chip.level': { background: alpha(theme.palette.text.primary, 0.1), borderColor: 'transparent' },
    '& .mc-chip.cost': { color: theme.palette.info.main, background: alpha(theme.palette.info.main, 0.15), borderColor: 'transparent' },
    '& .mc-desc': {
        flex: 1,
        padding: 10,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        maxHeight: '11rem',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${color.borderStrong} transparent`,
        fontSize: '0.92rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    },
    '& .mc-footer': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    '& .mc-stages': { display: 'flex', flexWrap: 'wrap', gap: 4 },
    '& .mc-stage': {
        cursor: 'pointer',
        padding: '3px 10px',
        borderRadius: 4,
        font: 'inherit',
        fontSize: '0.78rem',
        lineHeight: 1.5,
        fontWeight: 500,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
        background: 'transparent',
        border: `1px solid ${color.borderControl}`,
        transition: 'background-color 120ms, border-color 120ms',
        '&:hover': { background: theme.palette.action.hover },
        '&:disabled': { opacity: 0.5, cursor: 'default' }
    },
    '& .mc-stage.locked': { display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'not-allowed' },
    '& .mc-stage.active, & .mc-stage.active:hover': { color: theme.palette.primary.main, background: color.amberSubtle, borderColor: color.amberLine },
    '& .mc-action': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        padding: 0,
        cursor: 'pointer',
        borderRadius: '50%',
        color: 'var(--act)',
        background: 'var(--act-10)',
        border: '1px solid var(--act-25)',
        '&:hover': { background: 'var(--act-20)' }
    }
}));

/**
 * Versão enxuta do cartão de magia, para listas em grade (ex: modal de escolher magias): altura
 * pelo conteúdo, informações em linhas curtas e sem animações contínuas.
 */
function MagicSpellCompact({
    magic,
    id,
    isAdding,
    onIconClick,
    initialStage,
    unlockedStage,
    revealStages = false,
    disabled = false
}: MagicTyping<'magic-spell'>): ReactElement {
    const theme = useTheme();

    // Estágios acima do liberado ficam bloqueados (cadeado, sem o texto); sem a regra de desbloqueio, todos abertos
    const unlockedIndex = Math.min(2, (unlockedStage === undefined ? 3 : Math.max(1, unlockedStage)) - 1) as 0 | 1 | 2;
    const clampToUnlocked = (stage: number): 0 | 1 | 2 => Math.min(unlockedIndex, Math.min(2, Math.max(0, stage))) as 0 | 1 | 2;

    // Abre no estágio liberado mais novo (ou no pedido, nas vitrines sem a regra)
    const startStage = (): 0 | 1 | 2 => (unlockedStage === undefined ? clampToUnlocked(Number(initialStage ?? 1) - 1) : unlockedIndex);
    const [ shownStage, setShownStage ] = useState<0 | 1 | 2>(startStage);

    useEffect(() => {
        setShownStage(startStage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ initialStage, unlockedIndex ]);

    const actionColor = isAdding ? theme.palette.primary.main : theme.palette.error.main;

    const level = Number(magic.level);
    const extraManaCost = calculateExtraManaCost(level, shownStage, magic.mpCostIncrease);
    const description = magic.stages[shownStage] ?? magic.stages[0];
    const availableStages = ([ 0, 1, 2 ] as const).filter(stage => stage === 0 || Boolean(magic.stages[stage]));

    const handleStageChange = (stage: 0 | 1 | 2): void => {
        if (stage > unlockedIndex && !revealStages) return;
        setShownStage(stage);
    };

    const cssVars = {
        '--act': actionColor,
        '--act-10': alpha(actionColor, 0.1),
        '--act-20': alpha(actionColor, 0.2),
        '--act-25': alpha(actionColor, 0.25)
    } as React.CSSProperties;

    return (
        <CompactSpellCard data-id={id} style={cssVars}>
            <div className="mc-header">
                <span className="mc-icon" title={`Elemento: ${magic.element}`}><ElementIcon element={magic.element} colored /></span>
                <div className="mc-title">
                    <div className="mc-name" title={magic.name}>{magic.name}</div>
                    <div className="mc-sub">{magic.element} · {magic.type}</div>
                </div>
            </div>

            <div className="mc-chips">
                <span className="mc-chip level">Nível {magic.level}</span>
                <span className="mc-chip cost">
                    {Number(magic.mpCost) + extraManaCost} MP{extraManaCost > 0 ? ` (+${extraManaCost})` : ''}
                </span>
                <span className="mc-chip" title="Alcance">{magic.range}</span>
                <span className="mc-chip" title="Execução">{magic.execution}</span>
            </div>

            <div className="mc-desc">{description}</div>

            <div className="mc-footer">
                <div className="mc-stages">
                    {availableStages.map(stage => {
                        const locked = stage > unlockedIndex;
                        const label = getStageLabel(level, stage, magic.element);
                        return (
                            <button
                                key={stage}
                                type="button"
                                className={locked && !revealStages ? 'mc-stage locked' : shownStage === stage ? 'mc-stage active' : 'mc-stage'}
                                disabled={disabled || (locked && !revealStages)}
                                aria-label={locked ? `${label} bloqueado${revealStages ? ' (texto revelado pelo mestre)' : ''}` : label}
                                title={locked ? `${revealStages ? 'Revelado pelo mestre. ' : ''}${stageAccessText(stageRule(magic, (stage + 1) as 1 | 2 | 3), magic.element)}. Evolua a magia na ficha para desbloquear` : undefined}
                                onClick={() => handleStageChange(stage)}
                            >
                                {locked && <LockMark />}
                                {label}
                            </button>
                        );
                    })}
                </div>

                {onIconClick && (
                    <button
                        type="button"
                        className="mc-action"
                        onClick={onIconClick}
                        title={isAdding ? 'Adicionar magia' : 'Remover magia'}
                        aria-label={isAdding ? 'Adicionar magia' : 'Remover magia'}
                    >
                        {isAdding ? <Add fontSize="small" /> : <Close fontSize="small" />}
                    </button>
                )}
            </div>
        </CompactSpellCard>
    );
}

// Componente Magic que escolhe entre MagicSpell e MagicPower
export default function Magic<C extends 'magic-spell' | 'magic-power'>({
    as,
    ...props
}: {
    as?: C
    disabled?: boolean
} & MagicTyping<C>): ReactElement {
    // O cartão enxuto preenche a célula da grade, então não passa pelo wrapper que centraliza
    const spellProps = props as unknown as MagicTyping<'magic-spell'>;
    if (as !== 'magic-power' && spellProps.compact) {
        return <MagicSpellCompact {...spellProps} />;
    }

    const Component = as === 'magic-power' ? MagicPower : MagicSpell;

    // Wrapper para garantir animação e estilo consistente
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {(() => {
                // Quando for MagicPower, renomeia magicPower -> power
                if (as === 'magic-power') {
                    const { magicPower, ...rest } = props as any;
                    return <Component {...{ ...rest, power: magicPower }} />;
                }
                return <Component {...(props as any)} />;
            })()}
        </div>
    );
}

export function MagicCollection({
    items,
    type = 'magic-spell',
    disabled = false
}: {
    items: Spell[] | Power[],
    type?: 'magic-spell' | 'magic-power',
    disabled?: boolean
}): ReactElement {
    
    const [ selectedElement  ] = useState<string | null>(null);

    // Para implementação futura - filtragem por elemento
    const filteredItems = selectedElement
        ? items.filter(item => {
            const elemento = 'element' in item ? item.element : '';
            return elemento.toUpperCase() === selectedElement;
        })
        : items;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Grid responsivo de cards */}
            <Grid container spacing={3} justifyContent="center">
                {filteredItems.map((item, index) => (
                    <Grid item xs={12} md={6} lg={4} key={`magic-${index}`}>
                        <Magic
                            as={type}
                            {...{
                                id: `magic-${index}`,
                                [type === 'magic-spell' ? 'magic' : 'magicPower']: item,
                                disabled
                            } as any}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}