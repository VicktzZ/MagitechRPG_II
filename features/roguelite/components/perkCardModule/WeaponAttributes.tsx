import { Box, Grid, Typography } from '@mui/material'
import type { WeaponAttributesProps } from './types'
import { getAttributeBoxSx, getAttributeLabelSx, attributeValueSx, attributeValueBoldSx } from './styles'

export function WeaponAttributes({ weapon, borderColor }: WeaponAttributesProps) {
    const boxSx = getAttributeBoxSx(borderColor)
    const labelSx = getAttributeLabelSx(borderColor)

    const renderDamageValue = () => {
        const effect = weapon.effect as any
        if (effect?.displayValue) {
            return <span dangerouslySetInnerHTML={{ __html: effect.displayValue }} />
        }
        return effect?.originalValue || effect?.value || '-'
    }

    const renderCritValue = () => {
        const effect = weapon.effect as any
        const critDisplay = effect?.displayCritValue
            ? <span dangerouslySetInnerHTML={{ __html: effect.displayCritValue }} />
            : weapon.effect?.critValue ?? '-'
        const critChance = weapon.effect?.critChance != null ? ` (${weapon.effect.critChance})` : ''
        return <>{critDisplay}{critChance}</>
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                {/* Dano */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Dano</Typography>
                        <Typography variant="body2" sx={attributeValueBoldSx}>
                            {renderDamageValue()}
                        </Typography>
                    </Box>
                </Grid>

                {/* Crítico */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Crítico</Typography>
                        <Typography variant="body2" sx={attributeValueBoldSx}>
                            {renderCritValue()}
                        </Typography>
                    </Box>
                </Grid>

                {/* Tipo */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Tipo</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {weapon.kind ?? '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Categoria */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Categoria</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {String(weapon.categ ?? '-')}
                        </Typography>
                    </Box>
                </Grid>

                {/* Alcance */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Alcance</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {weapon.range ?? '-'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Peso */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Peso</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {weapon.weight != null ? `${weapon.weight} kg` : '-'}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
