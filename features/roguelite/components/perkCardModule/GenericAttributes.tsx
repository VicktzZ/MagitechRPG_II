import { Box, Grid, Typography } from '@mui/material'
import type { GenericAttributesProps } from './types'
import { getAttributeBoxSx, getAttributeLabelSx, attributeValueSx } from './styles'

interface ExpertiseBonusSectionProps {
    borderColor: string
    bonusValue: string | number
}

function ExpertiseBonusSection({ borderColor, bonusValue }: ExpertiseBonusSectionProps) {
    return (
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
                    {bonusValue}
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
