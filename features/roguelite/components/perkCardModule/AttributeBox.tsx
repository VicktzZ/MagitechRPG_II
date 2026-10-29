import { Box, Typography } from '@mui/material'
import type { AttributeBoxProps } from './types'
import { attributeBoxSx, attributeLabelSx, attributeValueSx } from './styles'

export function AttributeBox({ label, value }: AttributeBoxProps) {
    return (
        <Box sx={attributeBoxSx}>
            <Typography variant="caption" sx={attributeLabelSx}>
                {label}
            </Typography>
            <Typography variant="body2" sx={attributeValueSx}>
                {value}
            </Typography>
        </Box>
    )
}
