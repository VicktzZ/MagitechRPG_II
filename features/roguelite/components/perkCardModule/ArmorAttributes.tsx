import { Box, Grid, Typography } from '@mui/material'
import type { ArmorAttributesProps } from './types'
import { getAttributeBoxSx, getAttributeLabelSx, attributeValueSx, attributeValueBoldSx } from './styles'

export function ArmorAttributes({ armor, borderColor }: ArmorAttributesProps) {
    const boxSx = getAttributeBoxSx(borderColor)
    const labelSx = getAttributeLabelSx(borderColor)
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
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Defesa</Typography>
                        <Typography variant="body2" sx={attributeValueBoldSx}>
                            {renderDefenseValue()}
                        </Typography>
                    </Box>
                </Grid>

                {/* Tipo */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Tipo</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.kind ?? '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Categoria */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Categoria</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.categ ?? '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Penalidade */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Penalidade</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.displacementPenalty != null ? `${armor.displacementPenalty}m` : '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Peso */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Peso</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {armor.weight != null ? `${armor.weight} kg` : '-'}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
