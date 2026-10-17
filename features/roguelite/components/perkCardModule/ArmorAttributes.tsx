import { Box, Grid, Typography } from '@mui/material'
import type { ArmorAttributesProps } from './types'
import { attributeBoxSx, attributeLabelSx, attributeValueSx, attributeValueBoldSx } from './styles'

export function ArmorAttributes({ armor }: ArmorAttributesProps) {
    const armorData = armor as any

    const renderDefenseValue = () => {
        const baseValue = armorData?.originalValue ?? armorData?.ap ?? armor.value ?? armor.ap ?? 0
        const bonus = armorData?.defenseBonus

        return (
            <>
                +{baseValue} AP
                {bonus && bonus > 0 && (
                    <Typography
                        component="span"
                        sx={{
                            color: '#60a5fa',
                            fontSize: '0.75rem',
                            ml: 0.5,
                            fontWeight: 600
                        }}
                    >
                        (+{bonus})
                    </Typography>
                )}
            </>
        )
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                {/* Defesa */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Defesa</Typography>
                        <Typography variant="body2" sx={attributeValueBoldSx}>
                            {renderDefenseValue()}
                        </Typography>
                    </Box>
                </Grid>

                {/* Tipo */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Tipo</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.kind ?? '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Categoria */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Categoria</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.categ ?? '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Penalidade */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Penalidade</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.displacementPenalty != null ? `${armor.displacementPenalty}m` : '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Peso */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Peso</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.weight != null ? `${armor.weight} kg` : '-'}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
