import { Box, Grid, Typography } from '@mui/material'
import type { SpellAttributesProps } from './types'
import { getAttributeBoxSx, getAttributeLabelSx, attributeValueSx } from './styles'

export function SpellAttributes({ attributes, borderColor }: SpellAttributesProps) {
    const boxSx = getAttributeBoxSx(borderColor)
    const labelSx = getAttributeLabelSx(borderColor)

    const findAttr = (label: string) => {
        return attributes?.find(
            attr => attr.label.toLowerCase() === label.toLowerCase()
        )?.value ?? '-'
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Grid container spacing={0.5} columns={{ xs: 8, sm: 12 }}>
                {/* Tipo */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Tipo</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {findAttr('Tipo')}
                        </Typography>
                    </Box>
                </Grid>

                {/* Alcance */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Alcance</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {findAttr('Alcance')}
                        </Typography>
                    </Box>
                </Grid>

                {/* Execução */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={boxSx}>
                        <Typography variant="caption" sx={labelSx}>Execução</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {findAttr('Execução')}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
