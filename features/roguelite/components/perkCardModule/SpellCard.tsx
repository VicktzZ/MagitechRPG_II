import React, { useMemo, useState } from 'react'
import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
import { Star } from '@mui/icons-material'
import { elementColor } from '@/constants'
import { color } from '@themes/tokens'
import ElementIcon from '@components/misc/ElementIcon'
import { calculateExtraManaCost } from '@utils/roguelite'
import type { PerkAttribute } from './types'

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

export function SpellCard({
    title,
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
    const isMaxLevel = Number(level) === 4

    return (
        <Card
            onClick={onClick}
            sx={{
                position: 'relative',
                overflow: 'visible',
                width: { xs: 280, sm: 300, md: 330 },
                height: { xs: 440, sm: 470, md: 500 },
                borderRadius: 2,
                border: '1px solid',
                // Elemento é marca (só o glifo); o nível máximo é o único destaque de borda
                borderColor: isMaxLevel ? color.amberLine : 'divider',
                bgcolor: 'background.raised',
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'border-color 120ms, background-color 120ms',
                '&:hover': {
                    borderColor: isMaxLevel ? color.amber : color.borderStrong
                },
                ...(isSelected && {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px'
                })
            }}
        >
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
                        bgcolor: color.amberSubtle,
                        border: '1px solid',
                        borderColor: color.amberLine,
                        borderRadius: 3
                    }}
                >
                    <Star sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography
                        sx={{
                            color: 'primary.main',
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            letterSpacing: 1
                        }}
                    >
                        MÁX
                    </Typography>
                </Box>
            )}

            {/* Rótulo do elemento no topo */}
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
                        px: 3,
                        py: 1,
                        bgcolor: 'background.raised',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3
                    }}
                >
                    <Typography
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            letterSpacing: 2,
                            textTransform: 'uppercase'
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
                {/* Glifo do elemento */}
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
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '& svg': { fontSize: 32 }
                        }}
                    >
                        {elementKey in elementColor
                            ? <ElementIcon element={elementKey} colored />
                            : icon ?? <ElementIcon element={elementKey} />}
                    </Box>
                </Box>

                {/* Título da magia */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        textAlign: 'center',
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
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase'
                                }}
                            >
                                MAGIA
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase'
                                }}
                            >
                                Nível {level}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Linha separadora */}
                <Box sx={{ width: 96, height: 1, bgcolor: 'divider', alignSelf: 'center', mb: 2 }} />

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
                            const isActive = currentStage === index
                            return (
                                <Box
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setCurrentStage(index)
                                    }}
                                    sx={{
                                        boxSizing: 'border-box',
                                        width: isActive ? 24 : 8,
                                        height: 8,
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: isActive ? color.amberLine : 'transparent',
                                        bgcolor: isActive ? color.amberSubtle : color.borderStrong,
                                        cursor: 'pointer',
                                        transition: 'width 200ms ease, background-color 120ms, border-color 120ms',
                                        '&:hover': {
                                            bgcolor: isActive ? color.amberSubtle : color.borderControl
                                        }
                                    }}
                                />
                            )
                        })}
                        <Typography
                            sx={{
                                ml: 1,
                                color: 'primary.main',
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
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&::-webkit-scrollbar': { width: 4 },
                        '&::-webkit-scrollbar-track': { bgcolor: 'transparent', borderRadius: 2 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: color.borderStrong, borderRadius: 2 }
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.primary',
                            lineHeight: 1.7,
                            fontSize: '0.85rem',
                            textAlign: 'left'
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
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
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
                                            color: 'text.primary',
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
