import { Box, Typography } from '@mui/material'
import type { AttributeBoxProps } from './types'
import { getAttributeBoxSx, getAttributeLabelSx, attributeValueSx } from './styles'

export function AttributeBox({ label, value, borderColor }: AttributeBoxProps) {
    return (
        <Box sx={getAttributeBoxSx(borderColor)}>
            <Typography variant="caption" sx={getAttributeLabelSx(borderColor)}>
                {label}
            </Typography>
            <Typography variant="body2" sx={attributeValueSx}>
                {value}
            </Typography>
        </Box>
    )
}
