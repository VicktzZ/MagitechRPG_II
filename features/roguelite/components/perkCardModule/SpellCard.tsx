import React, { useMemo, useRef, useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, keyframes } from '@mui/material'
import {
    AutoAwesome,
    LocalFireDepartment,
    WaterDrop,
    Air,
    Grass,
    Bolt,
    LightMode,
    DarkMode,
    Psychology,
    Flare,
    Warning,
    DoNotDisturb,
    Stars
} from '@mui/icons-material'
import { spellElementColor } from '@/constants'
import { calculateExtraManaCost } from '@utils/roguelite'
import type { PerkAttribute } from './types'

// Animações definidas fora do componente para evitar conflitos
const starPulseAnimation = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`

interface SpellCardProps {
    title: string
    subtitle?: string
    description: string
    element: string
    icon?: React.ReactNode
    attributes?: PerkAttribute[]
    level?: number
    stages?: string[]
    mpCost?: number
    // Seleção
    isSelected?: boolean
    onClick?: () => void
}

// Ícones de elementos usando ícones do MUI
const elementIcons: Record<string, React.ReactNode> = {
    'FOGO': <LocalFireDepartment />,
    'ÁGUA': <WaterDrop />,
    'AR': <Air />,
    'TERRA': <Grass />,
    'ELETRICIDADE': <Bolt />,
    'LUZ': <LightMode />,
    'TREVAS': <DarkMode />,
    'NÃO-ELEMENTAL': <AutoAwesome />,
    
    'SANGUE': <WaterDrop />,
    'VÁCUO': <DoNotDisturb />,
    'PSÍQUICO': <Psychology />,
    'RADIAÇÃO': <Warning />,
    'EXPLOSÃO': <Flare />,
    'TÓXICO': <Warning />,
    
    'GELO': <WaterDrop />,
    'PLANTA': <Grass />,
    'METAL': <Bolt />
}

export function SpellCard({
    title
    ,
    description,
    element,
    icon,
    attributes,
    level,
    stages,
    mpCost,
    isSelected,
    onClick
}: SpellCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [ currentStage, setCurrentStage ] = useState(0)
    // Verificar se há múltiplos estágios válidos (não vazios)
    const hasMultipleStages = stages && stages.length > 1 && stages.some((stage, index) => index > 0 && stage && stage.trim() !== '')
    const currentDescription = stages?.[currentStage] ?? description
    
    // Custo de MP dinâmico baseado no estágio
    const extraCost = calculateExtraManaCost(Number(level) || 1, currentStage)
    const baseMpCost = Number(mpCost) || 0
    const totalMpCost = baseMpCost + extraCost
    
    // Atributos com custo atualizado
    const dynamicAttributes = useMemo(() => {
        if (!attributes) return undefined
        return attributes.map(attr => {
            if (attr.label === 'Custo' && mpCost !== undefined) {
                return { ...attr, value: `${totalMpCost} MP${extraCost > 0 ? ` (+${extraCost})` : ''}` }
            }
            return attr
        })
    }, [ attributes, mpCost, totalMpCost, extraCost ])
    const elementKey = element?.toUpperCase() ?? 'NÃO-ELEMENTAL'
    const color = useMemo(() => spellElementColor[elementKey] ?? '#b388ff', [ elementKey ])
    const isMaxLevel = Number(level) === 4
    const goldAccent = '#ffd700'

    const onMove: React.MouseEventHandler<HTMLDivElement> = e => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        el.style.setProperty('--mx', `${x}px`)
        el.style.setProperty('--my', `${y}px`)
        const rx = -((y - rect.height / 2) / rect.height) * 12
        const ry = ((x - rect.width / 2) / rect.width) * 12
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`
    }

    const onLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        const el = ref.current
        if (!el) return
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'
    }

    return (
        <Card
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={onClick}
            sx={{
                position: 'relative',
                overflow: 'visible',
                width: { xs: 280, sm: 300, md: 330 },
                height: { xs: 440, sm: 470, md: 500 },
                borderRadius: '20px',
                border: isSelected ? `3px solid ${color}` : (isMaxLevel ? `2px solid ${goldAccent}` : `1px solid ${color}`),
                background: isMaxLevel 
                    ? `linear-gradient(135deg, 
                        rgba(30,20,0,0.98) 0%, 
                        rgba(20,15,5,0.98) 50%,
                        rgba(30,20,0,0.98) 100%
                    )`
                    : `linear-gradient(135deg, 
                        rgba(0,0,0,0.95) 0%, 
                        rgba(20,10,30,0.98) 50%,
                        rgba(0,0,0,0.95) 100%
                    )`,
                boxShadow: isMaxLevel
                    ? `
                        0 0 80px ${goldAccent}44,
                        0 0 40px ${color}33,
                        0 20px 40px rgba(0,0,0,0.5),
                        inset 0 0 60px ${goldAccent}15
                    `
                    : `
                        0 0 60px ${color}33,
                        0 20px 40px rgba(0,0,0,0.5),
                        inset 0 0 80px ${color}15
                    `,
                transition: 'transform 150ms ease-out, box-shadow 300ms ease',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: isMaxLevel
                        ? `
                            0 0 120px ${goldAccent}77,
                            0 0 80px ${color}55,
                            0 30px 60px rgba(0,0,0,0.7),
                            inset 0 0 100px ${goldAccent}30
                        `
                        : `
                            0 0 80px ${color}55,
                            0 25px 50px rgba(0,0,0,0.6),
                            inset 0 0 100px ${color}25
                        `
                },
                ...(isSelected && {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 40px 15px ${color}80, 0 0 80px 30px ${color}40`,
                    border: `3px solid ${color}`,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 'inherit',
                        background: `linear-gradient(45deg, ${color}40, transparent, ${color}40)`,
                        zIndex: -1
                    }
                }),
              
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    background: `
                        radial-gradient(circle at 30% 20%, ${color}15 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, ${color}10 0%, transparent 40%)
                    `,
                    pointerEvents: 'none'
                }
            }}
        >
            {/* Runas decorativas nos cantos */}
            <Box sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontSize: '1.5rem',
                opacity: isMaxLevel ? 0.6 : 0.3,
                color: isMaxLevel ? goldAccent : color,
                fontFamily: 'serif',
                textShadow: isMaxLevel ? `0 0 10px ${goldAccent}` : 'none'
            }}>
                ◈
            </Box>
            <Box sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontSize: '1.5rem',
                opacity: isMaxLevel ? 0.6 : 0.3,
                color: isMaxLevel ? goldAccent : color,
                fontFamily: 'serif',
                textShadow: isMaxLevel ? `0 0 10px ${goldAccent}` : 'none'
            }}>
                ◈
            </Box>
            <Box sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                fontSize: '1.5rem',
                opacity: isMaxLevel ? 0.6 : 0.3,
                color: isMaxLevel ? goldAccent : color,
                fontFamily: 'serif',
                transform: 'rotate(180deg)',
                textShadow: isMaxLevel ? `0 0 10px ${goldAccent}` : 'none'
            }}>
                ◈
            </Box>
            <Box sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                fontSize: '1.5rem',
                opacity: isMaxLevel ? 0.6 : 0.3,
                color: isMaxLevel ? goldAccent : color,
                fontFamily: 'serif',
                transform: 'rotate(180deg)',
                textShadow: isMaxLevel ? `0 0 10px ${goldAccent}` : 'none'
            }}>
                ◈
            </Box>

            {/* Efeito de brilho que segue o mouse */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    pointerEvents: 'none',
                    background: `radial-gradient(
                        400px circle at var(--mx, 50%) var(--my, 50%), 
                        ${color}30, 
                        transparent 50%
                    )`,
                    transition: 'background 100ms ease-out'
                }}
            />

            {/* Badge de Nível Máximo */}
            {isMaxLevel && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: -16,
                        right: -8,
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        background: `linear-gradient(135deg, ${goldAccent}, #ffaa00)`,
                        borderRadius: '12px',
                        boxShadow: `0 4px 20px ${goldAccent}88`,
                        animation: `${starPulseAnimation} 1.5s ease-in-out infinite`
                    }}
                >
                    <Stars sx={{ fontSize: 16, color: '#000' }} />
                    <Typography
                        sx={{
                            color: '#000',
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            letterSpacing: 1
                        }}
                    >
                        MÁX
                    </Typography>
                </Box>
            )}

            {/* Banner do elemento no topo */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        px: 3,
                        py: 1,
                        background: isMaxLevel 
                            ? `linear-gradient(135deg, ${goldAccent}dd, ${color})` 
                            : `linear-gradient(135deg, ${color}dd, ${color})`,
                        borderRadius: '16px',
                        boxShadow: isMaxLevel 
                            ? `0 4px 20px ${goldAccent}88`
                            : `0 4px 20px ${color}66`,
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: -12,
                            width: 12,
                            height: '100%',
                            background: `linear-gradient(to right, transparent, ${color}88)`,
                            borderRadius: '0 0 0 8px'
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: -12,
                            width: 12,
                            height: '100%',
                            background: `linear-gradient(to left, transparent, ${color}88)`,
                            borderRadius: '0 0 8px 0'
                        }
                    }}
                >
                    <Typography
                        sx={{
                            color: '#000',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            textShadow: '0 1px 2px rgba(255,255,255,0.3)'
                        }}
                    >
                        {elementKey}
                    </Typography>
                </Box>
            </Box>

            <CardContent
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 5,
                    px: 2
                }}
            >
                {/* Ícone central mágico */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                            border: `2px solid ${color}66`,
                            boxShadow: `0 0 30px ${color}44`,
                            color,
                            '& svg': { fontSize: 32 }
                        }}
                    >
                        {elementIcons[elementKey] ?? icon ?? <AutoAwesome />}
                    </Box>
                </Box>

                {/* Título da magia */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        color: '#fff',
                        textAlign: 'center',
                        textShadow: `0 0 20px ${color}88, 0 2px 4px rgba(0,0,0,0.5)`,
                        letterSpacing: 0.5
                    }}
                >
                    {title}
                </Typography>

                {/* Info da magia */}
                <Box display='flex' gap={1} mt={1} mb={1.5} alignItems='center' justifyContent='center'>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                borderRadius: '12px',
                                border: `1px solid ${color}44`,
                                background: `${color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <Typography
                                sx={{
                                    color,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase'
                                }}
                            >
                                ✧ MAGIA ✧
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                borderRadius: '12px',
                                border: `1px solid ${color}44`,
                                background: `${color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <Typography
                                sx={{
                                    color,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase'
                                }}
                            >
                                ✧ Nível {level} ✧
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Linha decorativa */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 2
                    }}
                >
                    <Box sx={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${color}66)` }} />
                    <Box sx={{ color, opacity: 0.6, fontSize: '0.7rem' }}>✦</Box>
                    <Box sx={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${color}66)` }} />
                </Box>

                {/* Indicadores de Estágio */}
                {hasMultipleStages && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 1
                        }}
                    >
                        {stages?.map((stage, index) => {
                            // Sempre mostrar o estágio 1 (índice 0), mas só mostrar outros se forem válidos
                            if (index > 0 && (!stage || stage.trim() === '')) return null
                            return (
                                <Box
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setCurrentStage(index)
                                    }}
                                    sx={{
                                        width: currentStage === index ? 24 : 8,
                                        height: 8,
                                        borderRadius: 4,
                                        background: currentStage === index ? color : `${color}44`,
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease',
                                        '&:hover': {
                                            background: currentStage === index ? color : `${color}77`
                                        }
                                    }}
                                />
                            )
                        })}
                        <Typography
                            sx={{
                                ml: 1,
                                color: `${color}aa`,
                                fontSize: '0.65rem',
                                fontWeight: 600
                            }}
                        >
                            Estágio {currentStage + 1}/{stages.length}
                        </Typography>
                    </Box>
                )}

                {/* Descrição */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        px: 1.5,
                        py: 1.5,
                        mb: 2,
                        mx: -0.5,
                        borderRadius: 2,
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '&::-webkit-scrollbar': { width: 4 },
                        '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)', borderRadius: 2 },
                        '&::-webkit-scrollbar-thumb': { background: `${color}66`, borderRadius: 2 }
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#ffffff',
                            lineHeight: 1.7,
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                    >
                        {currentDescription}
                    </Typography>
                </Box>

                {/* Grid de atributos */}
                {dynamicAttributes && dynamicAttributes.length > 0 && (
                    <Grid container spacing={1}>
                        {dynamicAttributes.map((attr, i) => (
                            <Grid key={i} item xs={4}>
                                <Box
                                    sx={{
                                        py: 1,
                                        px: 0.5,
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, ${color}15 0%, transparent 100%)`,
                                        borderTop: `2px solid ${color}55`,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color,
                                            fontWeight: 700,
                                            fontSize: '0.6rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            display: 'block'
                                        }}
                                    >
                                        {attr.label}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {attr.value}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </CardContent>
        </Card>
    )
}

export default SpellCard
