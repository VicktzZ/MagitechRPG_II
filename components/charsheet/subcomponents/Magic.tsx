/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

'use client';

import { Add, AutoAwesome, Close, Flare, LocalFireDepartment, Bolt, WaterDrop, Air, Grass, DarkMode, LightMode, Psychology, DoNotDisturb } from '@mui/icons-material';
import { alpha, Box, Button, CardContent, Chip, Grid, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { elementColor } from '@constants';
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
        disabled?: boolean
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
    disabled = false
}: MagicTyping<'magic-spell'>): ReactElement {
    const theme = useTheme();

    // Estados
    const [ description, setDescription ] = useState<string>(magic.stages[0]);
    const [ activeStage, setActiveStage ] = useState<number>(0);
    const [ extraManaCost, setExtraManaCost ] = useState<number>(0);

    // Elemento para cor/ícone
    const elemento = magic.element?.toUpperCase() as Element;
    const elementoColor = elementColor[elemento as keyof typeof elementColor] || theme.palette.primary.main;
    const elementIcon = elementIcons[elemento] ?? <AutoAwesome />;

    // Dados dos níveis disponíveis
    const availableStages: Array<0 | 1 | 2> = [ 0 ];
    if (magic.stages[1]) availableStages.push(1);
    if (magic.stages[2]) availableStages.push(2);
    if (magic.stages[2] && magic.level === 4) availableStages.push(2);

    // Trocar entre estágios e calcular custos adicionais de MP
    const handleStageChange = (stage: 0 | 1 | 2): void => {
        setActiveStage(stage);
        setDescription(magic.stages[stage]!);

        // Cálculo do custo adicional de MP baseado no nível da magia e estágio
        let extraCost = 0;
        const magicLevel = Number(magic.level);

        if (magicLevel === 4) {
            if (stage === 1) extraCost = 4;
            else if (stage === 2) extraCost = 9;
        } else if (magicLevel === 3) {
            if (stage === 1) extraCost = 2;
            else if (stage === 2) extraCost = 5;
        } else if (magicLevel === 2) {
            if (stage === 1) extraCost = 2;
            else if (stage === 2) extraCost = 4;
        } else {
            if (stage === 1) extraCost = 1;
            else if (stage === 2) extraCost = 2;
        }

        setExtraManaCost(extraCost);
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
                                    {magic.level === 4 ? 'Maestria' : `Estágio ${stage}`}
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

// Componente Magic que escolhe entre MagicSpell e MagicPower
export default function Magic<C extends 'magic-spell' | 'magic-power'>({
    as,
    ...props
}: {
    as?: C
    disabled?: boolean
} & MagicTyping<C>): ReactElement {
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
            <Component {...props as any} />
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