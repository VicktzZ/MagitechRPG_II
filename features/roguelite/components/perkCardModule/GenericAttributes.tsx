import { Box, Grid, Typography } from '@mui/material'
import type { GenericAttributesProps } from './types'
import { attributeBoxSx, attributeLabelSx, attributeValueSx } from './styles'

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
                    border: '1px solid',
                    borderColor,
                    bgcolor: 'background.paper',
                    textAlign: 'center',
                    mb: 1
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 900,
                        fontSize: '2rem',
                        letterSpacing: 1
                    }}
                >
                    {bonusValue}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
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
                            <Box sx={attributeBoxSx}>
                                <Typography variant="caption" sx={attributeLabelSx}>
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
