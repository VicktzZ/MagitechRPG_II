import React, { useMemo, useRef } from 'react'
import { Box, Card, CardContent, Chip, Divider, Typography, Grid } from '@mui/material'
import { Parallax } from 'react-parallax'
import { rarityColor } from '@/constants'
import type { Element } from '@models/types/string'
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { Weapon } from '@models/Weapon'
import type { Armor } from '@models/Armor'

type Rarity = keyof typeof rarityColor

export interface PerkCardProps {
    title: string
    subtitle?: string
    description: string
    rarity: Rarity
    perkType?: PerkTypeEnum
    element?: Element
    icon?: React.ReactNode
    bgImage?: string
    // Opções de dados específicos por tipo
    weapon?: Partial<Weapon>
    armor?: Partial<Armor>
    // Fallback genérico (mantido para outros tipos de perk)
    attributes?: Array<{ label: string; value: string | number }>
}

function Ornament({ color }: { color: string }) {
    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    borderColor: color,
                    borderStyle: 'solid',
                    opacity: 0.8
                },
                '&:before': { top: 10, left: 10, borderWidth: '2px 0 0 2px', borderRadius: '6px 0 0 0' },
                '&:after': { bottom: 10, right: 10, borderWidth: '0 2px 2px 0', borderRadius: '0 0 6px 0' },
                '& .orn2, & .orn3': {
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    borderColor: color,
                    borderStyle: 'solid',
                    opacity: 0.8
                },
                '& .orn2': { top: 10, right: 10, borderWidth: '2px 2px 0 0', borderRadius: '0 6px 0 0' },
                '& .orn3': { bottom: 10, left: 10, borderWidth: '0 0 2px 2px', borderRadius: '0 0 0 6px' },
                '&:hover': {
                    scale: '1.1',
                    transform: 'perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1.1)',
                    zIndex: 10                        // Fica sobre outros cards
                }
            }}
        >
            <Box className="orn2" />
            <Box className="orn3" />
        </Box>
    )
}

function Shine() {
    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                    'radial-gradient(600px circle at var(--mx) var(--my), rgba(255,255,255,0.15), transparent 40%)',
                transition: 'background 120ms ease-out',
                borderRadius: 3
            }}
        />
    )
}

export function PerkCard({
    title,
    subtitle,
    description,
    rarity,
    perkType,
    element,
    icon,
    weapon,
    armor,
    attributes
}: PerkCardProps) {
    const borderColor = useMemo(() => rarityColor[rarity], [rarity])
    const ref = useRef<HTMLDivElement>(null)

    const onMove: React.MouseEventHandler<HTMLDivElement> = e => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        el.style.setProperty('--mx', `${x}px`)
        el.style.setProperty('--my', `${y}px`)
        const rx = -((y - rect.height / 2) / rect.height) * 24
        const ry = ((x - rect.width / 2) / rect.width) * 24
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
    }
    const onLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        const el = ref.current
        if (!el) return
        el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)'
    }

    return (
        <Card
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                width: { xs: 280, sm: 300, md: 330 },
                height: { xs: 420, sm: 450, md: 480 },
                borderRadius: 3,
                border: `2px solid ${borderColor}`,
                boxShadow: `0 10px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 24px ${borderColor}33 inset`,
                transition: 'transform 120ms ease-out, box-shadow 200ms ease, scale 150ms ease-out',
                cursor: 'pointer',
                bgcolor: 'rgba(10,10,14,0.9)',
                '&:hover': {
                    scale: '1.1',
                    boxShadow: `0 15px 35px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 30px ${borderColor}44 inset`,
                    transform: 'perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1.1)',
                    zIndex: 10
                }
            }}
        >
            {/* Camadas de fundo */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Parallax strength={80} bgImageStyle={{ objectFit: 'cover' }}>
                    <Box
                        sx={{ height: '100%', width: '100%', filter: 'grayscale(10%) contrast(105%) brightness(0.7)' }}
                    />
                </Parallax>
                {/* Gradiente vertical sutil */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(180deg, ${borderColor}18, transparent 18%, transparent 72%, ${borderColor}28)`
                    }}
                />
                {/* Vinheta superior */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.06), transparent 40%)'
                    }}
                />
                {/* Textura leve (ruído) */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.08,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '3px 3px'
                    }}
                />
            </Box>

            {/* Moldura dupla: brilho externo + borda interna */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    boxShadow: `0 0 0 2px ${borderColor} inset, 0 0 36px ${borderColor}55 inset`
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 6,
                    borderRadius: 2,
                    border: `1px solid ${borderColor}66`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5) inset'
                }}
            />

            <Ornament color={borderColor} />
            <Shine />

            <CardContent
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        size="small"
                        label={rarity}
                        sx={{
                            bgcolor: `${borderColor}26`,
                            color: borderColor,
                            border: `1px solid ${borderColor}66`,
                            textTransform: 'uppercase',
                            fontWeight: 800,
                            letterSpacing: 1,
                            backdropFilter: 'blur(6px)'
                        }}
                    />
                    {icon && <Box sx={{ color: borderColor, '& svg': { fontSize: 28 } }}>{icon}</Box>}
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 900,
                        color: '#fafafa',
                        textShadow: '0 2px 6px rgba(0,0,0,0.45)',
                        letterSpacing: 0.2
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="subtitle2" sx={{ color: '#e0e0e0', opacity: 0.9 }}>
                        {subtitle}
                    </Typography>
                )}

                <Divider sx={{ my: 1, borderColor: `${borderColor}66` }} />

                <Typography
                    variant="body2"
                    sx={{
                        color: '#d9d9d9',
                        flexGrow: 1,
                        lineHeight: 1.35,
                        overflow: 'auto',
                        maxHeight: { xs: 120, sm: 140, md: 160 },
                        pr: 1,
                        '&::-webkit-scrollbar': {
                            width: '4px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: `${borderColor}66`,
                            borderRadius: '2px',
                            '&:hover': {
                                background: `${borderColor}99`
                            }
                        }
                    }}
                >
                    {description}
                </Typography>

                {/* Rodapé: tags */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {perkType && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={
                                    perkType === PerkTypeEnum.WEAPON
                                        ? 'Arma'
                                        : perkType === PerkTypeEnum.ARMOR
                                            ? 'Armadura'
                                            : perkType === PerkTypeEnum.ITEM
                                                ? 'Item'
                                                : perkType === PerkTypeEnum.SKILL
                                                    ? 'Habilidade'
                                                    : perkType === PerkTypeEnum.EXPERTISE
                                                        ? 'Perícia'
                                                        : perkType
                                }
                                sx={{
                                    borderColor: `${borderColor}99`,
                                    color: borderColor,
                                    bgcolor: `${borderColor}14`,
                                    fontSize: '0.7rem',
                                    height: 24
                                }}
                            />
                        )}
                        {element && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={element}
                                sx={{
                                    borderColor: `${borderColor}99`,
                                    color: borderColor,
                                    bgcolor: `${borderColor}14`,
                                    fontSize: '0.7rem',
                                    height: 24
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Atributos específicos por tipo */}
                {perkType === PerkTypeEnum.WEAPON && weapon && (
                    <Box sx={{ mt: 1 }}>
                        <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                            {/* Dano */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Dano
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 700, fontSize: '0.8rem' }}
                                    >
                                        {(weapon.effect as any)?.originalValue || weapon.effect?.value || '-'}
                                        {(weapon.effect as any)?.damageBonus &&
                                            (weapon.effect as any).damageBonus > 0 && (
                                                <Typography
                                                    component="span"
                                                    sx={{
                                                        color: '#4ade80',
                                                        fontSize: '0.75rem',
                                                        ml: 0.5,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    (+{(weapon.effect as any).damageBonus})
                                                </Typography>
                                            )}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Crítico */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Crítico
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 700, fontSize: '0.8rem' }}
                                    >
                                        {weapon.effect?.critValue ?? '-'}
                                        {(weapon.effect as any)?.critBonus && (weapon.effect as any).critBonus > 0 && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: '#f59e0b',
                                                    fontSize: '0.75rem',
                                                    ml: 0.5,
                                                    fontWeight: 600
                                                }}
                                            >
                                                (+{(weapon.effect as any).critBonus})
                                            </Typography>
                                        )}
                                        {weapon.effect?.critChance != null ? ` (${weapon.effect.critChance})` : ''}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Tipo */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Tipo
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {weapon.kind ?? '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Categoria */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Categoria
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {String(weapon.categ ?? '-')}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Alcance */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Alcance
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {weapon.range ?? '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Peso */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Peso
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {weapon.weight != null ? `${weapon.weight} kg` : '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {perkType === PerkTypeEnum.ARMOR && armor && (
                    <Box sx={{ mt: 1 }}>
                        <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                            {/* Defesa */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Defesa
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 700, fontSize: '0.8rem' }}
                                    >
                                        +{(armor as any)?.originalValue ?? armor.value ?? 0} AP
                                        {(armor as any)?.defenseBonus && (armor as any).defenseBonus > 0 && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: '#60a5fa',
                                                    fontSize: '0.75rem',
                                                    ml: 0.5,
                                                    fontWeight: 600
                                                }}
                                            >
                                                (+{(armor as any).defenseBonus})
                                            </Typography>
                                        )}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Tipo */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Tipo
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {armor.kind ?? '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Categoria */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Categoria
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {armor.categ ?? '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Penalidade */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Penalidade
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {armor.displacementPenalty != null ? `${armor.displacementPenalty}m` : '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                            {/* Peso */}
                            <Grid item xs={4} sm={4} md={4}>
                                <Box
                                    sx={{
                                        px: 0.75,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: `1px solid ${borderColor}55`,
                                        bgcolor: `${borderColor}12`
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            letterSpacing: 0.3,
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        Peso
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#e8e8e8', fontWeight: 600, fontSize: '0.8rem' }}
                                    >
                                        {armor.weight != null ? `${armor.weight} kg` : '-'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Fallback para atributos genéricos quando fornecidos */}
                {perkType !== PerkTypeEnum.WEAPON &&
                    perkType !== PerkTypeEnum.ARMOR &&
                    attributes &&
                    attributes.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            {/* Seção especial para cards de perícia com bônus */}
                            {(attributes as any).some((attr: any) => attr.label === 'Bônus') && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: borderColor,
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            mb: 0.5
                                        }}
                                    >
                                        Bônus de Perícia
                                    </Typography>
                                    <Box
                                        sx={{
                                            px: 1,
                                            py: 0.75,
                                            borderRadius: 1,
                                            border: `2px solid ${borderColor}`,
                                            bgcolor: `${borderColor}15`,
                                            textAlign: 'center',
                                            mb: 1
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: '#ffffff',
                                                fontWeight: 800,
                                                fontSize: '1.1rem',
                                                textShadow: `0 0 10px ${borderColor}`
                                            }}
                                        >
                                            {(attributes as any).find((attr: any) => attr.label === 'Bônus')?.value}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#e0e0e0',
                                                fontSize: '0.65rem',
                                                mt: 0.25
                                            }}
                                        >
                                            Adicionado a uma perícia aleatória
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                                {attributes
                                    .filter(attr => attr.label !== 'Bônus') // Remove bônus da lista geral
                                    .map((attr, i) => (
                                        <Grid key={i} item xs={4} sm={4} md={4}>
                                            <Box
                                                sx={{
                                                    px: 0.75,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    border: `1px solid ${borderColor}55`,
                                                    bgcolor: `${borderColor}12`
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: borderColor,
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {attr.label}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#e8e8e8',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {attr.value}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                            </Grid>
                        </Box>
                    )}
            </CardContent>
        </Card>
    )
}

export default PerkCard
