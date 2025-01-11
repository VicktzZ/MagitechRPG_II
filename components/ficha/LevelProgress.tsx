import { Box, Typography, useTheme } from '@mui/material'
import { amber } from '@node_modules/@mui/material/colors'
import React, { useState } from 'react'

type Props = {
    title: string,
    level: number,
    amount: number,
    barWidth?: number | string
}

export default function LevelProgress({ title, level, amount, barWidth }: Props) {
    const theme = useTheme()

    function Bar({ id }: { id: number }) {
        const [ filled ] = useState<boolean>(amount >= 10 ? level / 2 > id : level > id)

        return <Box sx={{
            width: barWidth || '2.5rem',
            height: '0.75rem',
            border: `1px solid`,
            borderColor: theme.palette.primary.main,
            bgcolor: filled ? amber[700] : 'transparent',
            borderRadius: 1
        }} />
    }

    const generateBars = () => {
        return Array.from({ length: amount }, (_, index) => <Bar key={index} id={index} />)
    }

    return (
        <Box width='100%' display='flex' flexDirection='column' gap={1.5}>
            <Box>
                <Typography>{title + ` (${level})`}:</Typography>
            </Box>
            <Box width='100%' justifyContent='center' display='flex' alignItems='center' gap={0.5}>
                {generateBars()}
            </Box>
        </Box>
    )
}