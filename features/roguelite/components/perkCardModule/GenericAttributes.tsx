import { Box, Grid, Typography } from '@mui/material'
import type { GenericAttributesProps } from './types'
import { getAttributeBoxSx, getAttributeLabelSx, attributeValueSx } from './styles'

interface ExpertiseBonusSectionProps {
    borderColor: string
    bonusValue: string | number
}

function ExpertiseBonusSection({ borderColor, bonusValue }: ExpertiseBonusSectionProps) {
    return (
        <Box sx={{ mb: 1.5 }}>
            <Typography
                variant="caption"
                sx={{
                    color: borderColor,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    mb: 0.5,
                    display: 'block'
                }}
            >
                ⭐ Bônus de Perícia
            </Typography>
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: `3px solid ${borderColor}`,
                    bgcolor: `${borderColor}20`,
                    textAlign: 'center',
                    mb: 1,
                    boxShadow: `0 0 20px ${borderColor}40, inset 0 0 20px ${borderColor}15`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
                        animation: 'shine 2s infinite'
                    },
                    '@keyframes shine': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' }
                    }
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '2rem',
                        textShadow: `0 0 20px ${borderColor}, 0 0 40px ${borderColor}80`,
                        letterSpacing: 1
                    }}
                >
                    {bonusValue}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: '#e0e0e0',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        mt: 0.5,
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                    }}
                >
                    Pontos Adicionados
                </Typography>
            </Box>
        </Box>
    )
}

export function GenericAttributes({ attributes, borderColor }: GenericAttributesProps) {
    const boxSx = getAttributeBoxSx(borderColor)
    const labelSx = getAttributeLabelSx(borderColor)

    const bonusAttr = attributes.find(attr => attr.label === 'Bônus')
    const otherAttrs = attributes.filter(attr => attr.label !== 'Bônus')

    return (
        <Box sx={{ mt: 1 }}>
            {/* Seção especial para cards de perícia com bônus */}
            {bonusAttr && (
                <ExpertiseBonusSection borderColor={borderColor} bonusValue={bonusAttr.value} />
            )}

            {otherAttrs.length > 0 && (
                <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                    {otherAttrs.map((attr, i) => (
                        <Grid key={i} item xs={4} sm={4} md={4}>
                            <Box sx={boxSx}>
                                <Typography variant="caption" sx={labelSx}>
                                    {attr.label}
                                </Typography>
                                <Typography variant="body2" sx={attributeValueSx}>
                                    {attr.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )
}
