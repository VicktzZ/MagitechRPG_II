import { Box, Typography } from '@mui/material'
import { type ReactElement } from 'react'

export default function Message({ message }: { message: string }): ReactElement {
    return (
        <Box maxWidth='60%' display='flex' p={1.5} borderRadius={2} bgcolor='background.paper'>
            <Typography>{message}</Typography>
        </Box>
    )
}