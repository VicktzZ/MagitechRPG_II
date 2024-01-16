'use client'

import { type ReactElement } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { CustomIconButton } from '@layout';
import { useRouter } from 'next/navigation';

export default function Plataform(): ReactElement {
    const router = useRouter()

    return (
        <Box display='flex' height='100vh' alignItems='center' justifyContent='center'>
            <Box display='flex' height='100%' width='80%' p={3}>
                <Card
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '15rem',
                        width: '20rem',
                        backgroundColor: 'background.paper3',
                        cursor: 'pointer',
                        transition: '.3s ease-in-out',
                        ':hover': {
                            transform: 'scale(1.05)'
                        }
                    }}
                    onClick={() => { router.push('/plataform/ficha/create') }}
                >
                    <Box alignItems='center' display='flex' gap={2}>
                        <Typography variant='h6'>Criar Ficha</Typography>
                        <CustomIconButton>
                            <Add />
                        </CustomIconButton>
                    </Box>
                </Card>
            </Box>
        </Box>
    )
}
