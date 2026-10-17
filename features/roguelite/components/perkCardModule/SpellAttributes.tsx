import { Box, Grid, Typography } from '@mui/material'
import type { SpellAttributesProps } from './types'
import { attributeBoxSx, attributeLabelSx, attributeValueSx } from './styles'

export function SpellAttributes({ attributes }: SpellAttributesProps) {
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
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Tipo</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {findAttr('Tipo')}
                        </Typography>
                    </Box>
                </Grid>

                {/* Alcance */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Alcance</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {findAttr('Alcance')}
                        </Typography>
                    </Box>
                </Grid>

                {/* Execução */}
                <Grid item xs={4} sm={4} md={4}>
                    <Box sx={attributeBoxSx}>
                        <Typography variant="caption" sx={attributeLabelSx}>Execução</Typography>
                        <Typography variant="body2" sx={attributeValueSx}>
                            {findAttr('Execução')}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
