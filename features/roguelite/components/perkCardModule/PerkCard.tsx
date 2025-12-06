import React, { useMemo, useRef } from 'react'
import { Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material'
import { rarityColor, spellElementColor } from '@/constants'
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { PerkCardProps } from './types'
import { getCardSx, getChipSx, getRarityChipSx, descriptionSx, titleSx, subtitleSx } from './styles'
import { Ornament } from './Ornament'
import { Shine } from './Shine'
import { CardBackground, CardFrame } from './CardBackground'
import { WeaponAttributes } from './WeaponAttributes'
import { ArmorAttributes } from './ArmorAttributes'
import { SpellAttributes } from './SpellAttributes'
import { GenericAttributes } from './GenericAttributes'

function getPerkTypeLabel(perkType: PerkTypeEnum): string {
    const labels: Record<string, string> = {
        [PerkTypeEnum.WEAPON]: 'Arma',
        [PerkTypeEnum.ARMOR]: 'Armadura',
        [PerkTypeEnum.ITEM]: 'Item',
        [PerkTypeEnum.SKILL]: 'Habilidade',
        [PerkTypeEnum.EXPERTISE]: 'Perícia'
    }
    return labels[perkType] ?? perkType
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
    attributes,
    isSelected,
    onClick
}: PerkCardProps) {
    // Para SPELLs, usar cor vibrante do elemento; caso contrário, usar cor da raridade
    const borderColor = useMemo(() => {
        if (perkType === PerkTypeEnum.SPELL && element) {
            const elementKey = element.toUpperCase()
            return spellElementColor[elementKey] ?? rarityColor[rarity]
        }
        return rarityColor[rarity]
    }, [perkType, element, rarity])
    
    // Para SPELLs, mostrar elemento no lugar da raridade
    const displayRarity = useMemo(() => {
        if (perkType === PerkTypeEnum.SPELL && element) {
            return element.toUpperCase()
        }
        return rarity
    }, [perkType, element, rarity])
    
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

    const renderAttributes = () => {
        if (perkType === PerkTypeEnum.WEAPON && weapon) {
            return <WeaponAttributes weapon={weapon} borderColor={borderColor} />
        }
        if (perkType === PerkTypeEnum.ARMOR && armor) {
            return <ArmorAttributes armor={armor} borderColor={borderColor} />
        }
        if (perkType === PerkTypeEnum.SPELL) {
            return <SpellAttributes attributes={attributes} borderColor={borderColor} />
        }
        if (attributes && attributes.length > 0 && 
            perkType !== PerkTypeEnum.WEAPON && 
            perkType !== PerkTypeEnum.ARMOR) {
            return <GenericAttributes attributes={attributes} borderColor={borderColor} />
        }
        return null
    }

    return (
        <Card
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={onClick}
            sx={{
                ...getCardSx(borderColor),
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                ...(isSelected && {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 30px 10px ${borderColor}80, 0 0 60px 20px ${borderColor}40`,
                    border: `3px solid ${borderColor}`,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 'inherit',
                        background: `linear-gradient(45deg, ${borderColor}40, transparent, ${borderColor}40)`,
                        zIndex: -1
                    }
                })
            }}
        >
            <CardBackground borderColor={borderColor} />
            <CardFrame borderColor={borderColor} />
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
                {/* Header: Rarity + Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        size="small"
                        label={displayRarity}
                        sx={getRarityChipSx(borderColor)}
                    />
                    {icon && (
                        <Box sx={{ color: borderColor, '& svg': { fontSize: 28 } }}>
                            {icon}
                        </Box>
                    )}
                </Box>

                {/* Title */}
                <Typography variant="h5" sx={titleSx}>
                    {title}
                </Typography>

                {/* Subtitle */}
                {subtitle && (
                    <Typography variant="subtitle2" sx={subtitleSx}>
                        {subtitle}
                    </Typography>
                )}

                <Divider sx={{ my: 1, borderColor: `${borderColor}66` }} />

                {/* Description */}
                <Typography variant="body2" sx={descriptionSx(borderColor)}>
                    {description}
                </Typography>

                {/* Footer: Tags */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {perkType && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={getPerkTypeLabel(perkType)}
                                sx={getChipSx(borderColor)}
                            />
                        )}
                        {element && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={element}
                                sx={getChipSx(borderColor)}
                            />
                        )}
                    </Box>
                </Box>

                {/* Attributes Section */}
                {renderAttributes()}
            </CardContent>
        </Card>
    )
}

export default PerkCard
