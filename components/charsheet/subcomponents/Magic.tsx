/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

'use client';

import { Add, AutoAwesome, Close, Flare, LocalFireDepartment, Bolt, WaterDrop, Air, Grass, DarkMode, LightMode, Psychology, DoNotDisturb } from '@mui/icons-material';
import { alpha, Box, Button, CardContent, Chip, Grid, IconButton, Paper, Stack, styled, Tooltip, Typography, useTheme } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { elementColor } from '@constants';
import { calculateExtraManaCost } from '@utils/roguelite';
import { MagicPower } from './MagicPower';
import { RPGIcon } from '@components/misc';

import type { Power, Spell } from '@models/entities';
import { type Element } from '@models/types/string';

type MagicTyping<C extends 'magic-spell' | 'magic-power'> =
    C extends 'magic-spell' ?
    {
        magic: Spell,
        id: string,
        isAdding?: boolean,
        onIconClick?: () => void,
        selectedStage?: 1 | 2 | 3,
        onStageChange?: (stage: 1 | 2 | 3) => void,
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

// Mapeamento de elementos para ícones
const elementIcons: Record<ElementType, React.ReactNode> = {
    'FOGO': <LocalFireDepartment />,
    'ÁGUA': <WaterDrop />,
    'AR': <Air />,
    'TERRA': <Grass />,
    'ELETRICIDADE': <Bolt />,
    'LUZ': <LightMode />,
    'TREVAS': <DarkMode />,
    'NEUTRO': <AutoAwesome />,

    'SANGUE': <WaterDrop />,
    'VÁCUO': <DoNotDisturb />,
    'PSÍQUICO': <Psychology />,
    'EXPLOSÃO': <Flare />,
    'RADIAÇÃO': <RPGIcon 
        icon="radioactive" 
        sx={{
            marginLeft: '10px',
            marginRight: '-5px',
            filter: 'brightness(0) saturate(100%) invert(23%) sepia(39%) saturate(4708%) hue-rotate(277deg) brightness(90%) contrast(97%)' 
        }} 
    />
};

function MagicSpell({
    magic,
    id,
    isAdding,
    onIconClick,
    selectedStage,
    onStageChange,
    disabled = false
}: MagicTyping<'magic-spell'>): ReactElement {
    const theme = useTheme();

    const initialStage = Math.min(2, Math.max(0, Number(selectedStage ?? 1) - 1)) as 0 | 1 | 2

    // Estados
    const [ description, setDescription ] = useState<string>(magic.stages[initialStage] ?? magic.stages[0]);
    const [ activeStage, setActiveStage ] = useState<number>(initialStage);
    const [ extraManaCost, setExtraManaCost ] = useState<number>(calculateExtraManaCost(Number(magic.level), initialStage));

    // Elemento para cor/ícone
    const elemento = magic.element?.toUpperCase() as Element;
    const elementoColor = elementColor[elemento as keyof typeof elementColor] || theme.palette.primary.main;
    const elementIcon = elementIcons[elemento] ?? <AutoAwesome />;

    // Dados dos níveis disponíveis
    const availableStages: Array<0 | 1 | 2> = [ 0 ];
    if (magic.stages[1]) availableStages.push(1);
    if (magic.stages[2]) availableStages.push(2);
    if (magic.stages[2] && magic.level === 4) availableStages.push(2);

    const isCommonElement = 
        magic.element !== 'Vácuo' &&
        magic.element !== 'Sangue' &&
        magic.element !== 'Psíquico' &&
        magic.element !== 'Radiação' &&
        magic.element !== 'Explosão'

    useEffect(() => {
        const nextStage = Math.min(2, Math.max(0, Number(selectedStage ?? 1) - 1)) as 0 | 1 | 2
        setActiveStage(nextStage)
        setDescription(magic.stages[nextStage] ?? magic.stages[0])
        setExtraManaCost(calculateExtraManaCost(Number(magic.level), nextStage))
    }, [ magic.level, magic.stages, selectedStage ])
    
    // Trocar entre estágios e calcular custos adicionais de MP
    const handleStageChange = (stage: 0 | 1 | 2): void => {
        setActiveStage(stage);
        setDescription(magic.stages[stage]!);
        setExtraManaCost(calculateExtraManaCost(Number(magic.level), stage));
        onStageChange?.((stage + 1) as 1 | 2 | 3)
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
        },
        hover: !disabled ? {
            y: -8,
            boxShadow: `0 12px 28px ${alpha(elementoColor, 0.4)}`,
            transition: {
                duration: 0.3,
                ease: 'easeInOut'
            }
        } : {}
    };

    // Efeito de brilho
    const shineAnimation = {
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(elementoColor, 0.15)}, transparent)`,
            animation: disabled ? 'none' : 'shine 3s infinite',
            zIndex: 1
        },
        '@keyframes shine': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' }
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
                elevation={8}
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '30rem', md: '32rem' },
                    height: { xs: 'auto', sm: '35rem', md: '40rem' },
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.95)})`
                        : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.95)})`,
                    border: `1px solid ${alpha(elementoColor, theme.palette.mode === 'dark' ? 0.4 : 0.3)}`,
                    margin: '0 auto',
                    transition: 'all 0.4s ease',
                    ...(!disabled && {
                        '&:hover': {
                            borderColor: alpha(elementoColor, 0.6)
                        },
                        ...shineAnimation
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
                                height: '2px',
                                background: `linear-gradient(90deg, ${elementoColor}, transparent)`
                            }
                        }}
                    >
                        {/* Badge de elemento */}
                        <Tooltip title={`Elemento: ${magic.element}`} arrow placement="top">
                            <Chip
                                icon={elementIcon}
                                label={magic.element}
                                sx={{
                                    bgcolor: alpha(elementoColor, 0.15),
                                    color: elementoColor,
                                    border: `1px solid ${alpha(elementoColor, 0.3)}`,
                                    borderRadius: '16px',
                                    fontWeight: 600,
                                    boxShadow: `0 2px 8px ${alpha(elementoColor, 0.2)}`,
                                    '& .MuiChip-icon': { color: elementoColor },
                                    ...(!disabled && {
                                        '&:hover': {
                                            bgcolor: alpha(elementoColor, 0.25),
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 4px 12px ${alpha(elementoColor, 0.3)}`
                                        },
                                        transition: 'all 0.3s ease'
                                    })
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
                                    width: '100%',
                                    ...(!disabled && {
                                        '&:hover': { color: elementoColor }
                                    }),
                                    transition: 'color 0.3s ease'
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
                                    color: elementoColor,
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
                            pl: { xs: 2.5, sm: 3, md: 3.5 }, // Aumentar o padding-left para acomodar a borda
                            borderRadius: 2,
                            bgcolor: alpha(elementoColor, 0.05),
                            border: `1px solid ${alpha(elementoColor, 0.2)}`,
                            flex: 1,
                            position: 'relative',
                            overflow: 'auto', // Permite rolagem se o conteúdo for muito grande
                            // Altura fixa em vez de maxHeight para garantir mesmo tamanho
                            height: { xs: '180px', sm: '200px', md: '220px' }, // Altura fixa padronizada
                            // Estilização da scrollbar para ser mais fina e da cor do elemento mágico
                            '&::-webkit-scrollbar': {
                                width: '6px',
                                height: '6px'
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: alpha(elementoColor, 0.05)
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: alpha(elementoColor, 0.6),
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: alpha(elementoColor, 0.8)
                                }
                            },
                            // Firefox scrollbar styling
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${alpha(elementoColor, 0.6)} ${alpha(elementoColor, 0.05)}`,
                            // Borda esquerda que rola com o conteúdo
                            borderLeft: `4px solid ${alpha(elementoColor, 0.7)}`
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
                                zIndex: 5 // Garante que os botões fiquem acima das animações
                            }}
                        >
                            {availableStages.map(stage => (
                                <Button
                                    key={stage}
                                    variant={activeStage === stage ? 'contained' : 'outlined'}
                                    size="small"
                                    disabled={disabled}
                                    onClick={() => handleStageChange(stage)}
                                    sx={{
                                        position: 'relative', // Necessário para o z-index funcionar
                                        zIndex: 10, // Garante que o botão fique acima das animações
                                        minWidth: { xs: '80px', sm: 0 },
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                        color: activeStage === stage
                                            ? elemento === 'AR' || elemento === 'NÃO-ELEMENTAL' ? '#111' : '#fff' : elementoColor,
                                        bgcolor: activeStage === stage
                                            ? elementoColor
                                            : 'transparent',
                                        borderColor: alpha(elementoColor, 0.5),
                                        ...(!disabled && {
                                            '&:hover': {
                                                bgcolor: activeStage === stage
                                                    ? elementoColor
                                                    : alpha(elementoColor, 0.1),
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 2px 8px ${alpha(elementoColor, 0.25)}`
                                            }
                                        })
                                    }}
                                >
                                    {magic.level === 4 && !isCommonElement ? 'Maestria' : `Estágio ${stage + 1}`}
                                </Button>
                            ))}
                        </Stack>

                        {/* Botão de ação (adicionar ou remover) */}
                        {onIconClick && (
                            <Tooltip title={isAdding ? 'Adicionar magia' : 'Remover magia'} arrow placement="top">
                                <span>
                                    <IconButton
                                        onClick={onIconClick}
                                        size="small"
                                        sx={{
                                            color: isAdding ? theme.palette.success.main : theme.palette.error.main,
                                            bgcolor: alpha(isAdding ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                            border: `1px solid ${alpha(isAdding ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
                                            p: 1,
                                            zIndex: 10, // Garante que o botão fique acima da animação
                                            position: 'relative', // Necessário para o z-index funcionar
                                            '&:hover': {
                                                bgcolor: alpha(isAdding ? theme.palette.success.main : theme.palette.error.main, 0.2),
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.2s ease'
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

/** Rótulo do botão de um estágio: no nível 4 o terceiro é a Maestria */
const getStageLabel = (level: number, stage: 0 | 1 | 2): string =>
    level === 4 && stage === 2 ? 'Maestria' : `Estágio ${stage + 1}`;

/**
 * Cartão enxuto, só com elementos HTML simples dentro de um único componente estilizado: numa lista
 * de centenas de magias, dezenas de componentes MUI por cartão (cada `sx` é recalculado a cada
 * renderização) travavam a tela ao filtrar. A cor do elemento chega por variáveis CSS.
 */
const CompactSpellCard = styled('div')(({ theme }) => ({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    border: '1px solid var(--el-35)',
    borderLeft: '4px solid var(--el-85)',
    background: `linear-gradient(145deg, var(--el-10), ${alpha(theme.palette.background.paper, 0.9)} 60%)`,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': { borderColor: 'var(--el-60)', boxShadow: '0 4px 16px var(--el-25)' },
    '& .mc-header': { display: 'flex', alignItems: 'flex-start', gap: 8 },
    '& .mc-icon': { display: 'flex', marginTop: 2, color: 'var(--el)' },
    '& .mc-icon svg': { fontSize: 22 },
    '& .mc-title': { flex: 1, minWidth: 0 },
    '& .mc-name': {
        fontSize: '1rem',
        lineHeight: 1.2,
        fontWeight: 700,
        wordBreak: 'break-word',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    '& .mc-sub': { fontSize: '0.75rem', lineHeight: 1.3, color: theme.palette.text.secondary },
    '& .mc-chips': { display: 'flex', flexWrap: 'wrap', gap: 4 },
    '& .mc-chip': {
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 7px',
        borderRadius: 10,
        fontSize: '0.7rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        border: `1px solid ${alpha(theme.palette.text.primary, 0.35)}`
    },
    '& .mc-chip.level': { color: 'var(--el)', background: 'var(--el-15)', borderColor: 'transparent' },
    '& .mc-chip.cost': { color: theme.palette.info.main, background: alpha(theme.palette.info.main, 0.15), borderColor: 'transparent' },
    '& .mc-desc': {
        flex: 1,
        padding: 8,
        borderRadius: 4,
        borderLeft: '3px solid var(--el-70)',
        background: 'var(--el-07)',
        maxHeight: '9rem',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--el-60) transparent',
        fontSize: '0.8rem',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    },
    '& .mc-footer': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    '& .mc-stages': { display: 'flex', flexWrap: 'wrap', gap: 4 },
    '& .mc-stage': {
        cursor: 'pointer',
        padding: '2px 8px',
        borderRadius: 4,
        font: 'inherit',
        fontSize: '0.7rem',
        lineHeight: 1.5,
        fontWeight: 500,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        color: 'var(--el)',
        background: 'transparent',
        border: '1px solid var(--el-50)',
        '&:hover': { background: 'var(--el-10)', borderColor: 'var(--el-80)' },
        '&:disabled': { opacity: 0.5, cursor: 'default' }
    },
    '& .mc-stage.active': { color: 'var(--el-contrast)', background: 'var(--el)', borderColor: 'var(--el)' },
    '& .mc-action': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
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
    selectedStage,
    onStageChange,
    disabled = false
}: MagicTyping<'magic-spell'>): ReactElement {
    const theme = useTheme();

    const [ activeStage, setActiveStage ] = useState<0 | 1 | 2>(
        Math.min(2, Math.max(0, Number(selectedStage ?? 1) - 1)) as 0 | 1 | 2
    );

    useEffect(() => {
        setActiveStage(Math.min(2, Math.max(0, Number(selectedStage ?? 1) - 1)) as 0 | 1 | 2);
    }, [ selectedStage ]);

    const elemento = String(magic.element ?? '').toUpperCase();
    const color = elementColor[elemento as keyof typeof elementColor] || theme.palette.primary.main;
    const elementIcon = elementIcons[elemento as keyof typeof elementIcons] ?? <AutoAwesome />;
    const actionColor = isAdding ? theme.palette.success.main : theme.palette.error.main;

    const level = Number(magic.level);
    const extraManaCost = calculateExtraManaCost(level, activeStage);
    const description = magic.stages[activeStage] ?? magic.stages[0];
    const availableStages = ([ 0, 1, 2 ] as const).filter(stage => stage === 0 || Boolean(magic.stages[stage]));

    const handleStageChange = (stage: 0 | 1 | 2): void => {
        setActiveStage(stage);
        onStageChange?.((stage + 1) as 1 | 2 | 3);
    };

    const cssVars = {
        '--el': color,
        '--el-07': alpha(color, 0.07),
        '--el-10': alpha(color, 0.1),
        '--el-15': alpha(color, 0.15),
        '--el-25': alpha(color, 0.25),
        '--el-35': alpha(color, 0.35),
        '--el-50': alpha(color, 0.5),
        '--el-60': alpha(color, 0.6),
        '--el-70': alpha(color, 0.7),
        '--el-80': alpha(color, 0.8),
        '--el-85': alpha(color, 0.85),
        '--el-contrast': elemento === 'AR' || elemento === 'NÃO-ELEMENTAL' ? '#111' : '#fff',
        '--act': actionColor,
        '--act-10': alpha(actionColor, 0.1),
        '--act-20': alpha(actionColor, 0.2),
        '--act-25': alpha(actionColor, 0.25)
    } as React.CSSProperties;

    return (
        <CompactSpellCard data-id={id} style={cssVars}>
            <div className="mc-header">
                <span className="mc-icon" title={`Elemento: ${magic.element}`}>{elementIcon}</span>
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
                    {availableStages.map(stage => (
                        <button
                            key={stage}
                            type="button"
                            className={activeStage === stage ? 'mc-stage active' : 'mc-stage'}
                            disabled={disabled}
                            onClick={() => handleStageChange(stage)}
                        >
                            {getStageLabel(level, stage)}
                        </button>
                    ))}
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