import { Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material'
import { rarityColor } from '@/constants'
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import ElementIcon from '@components/misc/ElementIcon'
import type { PerkCardProps } from './types'
import { getCardSx, chipSx, getRarityChipSx, descriptionSx, titleSx, subtitleSx } from './styles'
import { Ornament } from './Ornament'
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
    // Magia: o elemento aparece no lugar da raridade, como glifo colorido e texto; o cartão fica neutro.
    // Demais perks: a cor da raridade vai na borda e no nome da raridade.
    const spellElement = perkType === PerkTypeEnum.SPELL ? element : undefined
    const borderColor = spellElement ? 'divider' : rarityColor[rarity]
    const markColor = spellElement ? 'text.secondary' : rarityColor[rarity]
    const displayRarity = spellElement ? spellElement.toUpperCase() : rarity

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
            onClick={onClick}
            sx={{
                ...getCardSx(borderColor, !!onClick),
                cursor: onClick ? 'pointer' : 'default',
                ...(isSelected && {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px'
                })
            }}
        >
            <Ornament color={borderColor} />

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {spellElement && <ElementIcon element={spellElement} colored fontSize="small" />}
                        <Chip
                            size="small"
                            label={displayRarity}
                            sx={getRarityChipSx(markColor)}
                        />
                    </Box>
                    {icon && (
                        <Box sx={{ color: markColor, '& svg': { fontSize: 28 } }}>
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

                <Divider sx={{ my: 1 }} />

                {/* Description */}
                <Typography variant="body2" sx={descriptionSx}>
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
                                sx={chipSx}
                            />
                        )}
                        {element && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={element}
                                sx={chipSx}
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
