'use client';

import { CustomIconButton } from '@layout'
import { ArrowRight } from '@mui/icons-material'
import { Box, Card, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Ficha } from '@types'
import { useRouter } from 'next/navigation'
import type { ReactElement } from 'react'

export default function FichaCard({ ficha }: { ficha: Ficha }): ReactElement {
    const theme = useTheme()
    const router = useRouter()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <Card
            onClick={() => { router.push(`/plataform/ficha/${ficha._id}`) }}
            key={ficha._id}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: !matches ? '15rem' : '20rem',
                width: !matches ? '20rem' : '25rem',
                backgroundColor: 'background.paper3',
                cursor: 'pointer',
                transition: '.3s ease-in-out',
                ':hover': {
                    transform: 'scale(1.05)'
                }
            }}
        >
            <Box alignItems='center' justifyContent='center' width='100%' display='flex' gap={2}>
                <Box display='flex' width='50%' flexDirection='column'>
                    <Typography variant='h6'>{ficha.name}</Typography>
                    <Box display='flex' width='100%' gap={1} flexDirection='column'>
                        <Box display='flex' width='100%' flexDirection='column'>
                            <Typography variant='caption'>{ficha.gender}</Typography>
                            <Typography variant='caption'>Nível: {ficha.level}</Typography>
                        </Box>
                        <Box display='flex' flexDirection='column'>
                            <Typography variant='caption'>{ficha.class as string}</Typography>
                            <Typography variant='caption'>{ficha.lineage as unknown as string}</Typography>
                            <Typography variant='caption'>{ficha.race as string}</Typography>
                            <Typography variant='caption'>¥{ficha.inventory.money}</Typography>
                        </Box>
                    </Box>
                </Box>
                <CustomIconButton>
                    <ArrowRight />
                </CustomIconButton>
            </Box>
        </Card>
    )
}