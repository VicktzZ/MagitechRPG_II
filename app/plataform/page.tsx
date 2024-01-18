/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, type ReactElement, useState } from 'react';
import { Box, Card, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Add, ArrowRight } from '@mui/icons-material';
import { CustomIconButton } from '@layout';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Ficha } from '@types';
import { FichaCard } from '@components/ficha';

export default function Plataform(): ReactElement {
    const router = useRouter()
    const { data: session }: any = useSession()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ fichas, setFichas ] = useState<Ficha[]>([])

    const fetchFichas = async (): Promise<Ficha[]> => {
        setIsLoading(true)
        const response = await fetch(`/api/ficha?user=${session?.user?._id}`).then(async r => await r.json())
        setIsLoading(false)

        return response
    }

    useEffect(() => {
        (async () => {
            const fichasData = await fetchFichas()
            setFichas(fichasData)
            console.log(fichasData)
        })()
    }, [])

    return (
        <Box display='flex' height='100vh' alignItems='center' pt={3} justifyContent='center'>
            <Box display='flex' height='100%' width='100%' p={3}>
                <Grid justifyContent={!matches ? 'inherit' : 'center'} container spacing={2} gap={!matches ? 2 : 0}>
                    {isLoading ? [ 0, 1, 2 ].map(() => (
                        <Skeleton 
                            variant='rectangular' key={Math.random()} width='20rem' height='15rem' 
                        />
                    )) : fichas.map((ficha) => (
                        <FichaCard 
                            key={ficha._id}
                            ficha={ficha}
                        />
                    ))}  
                    <Card
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
                        onClick={() => { router.push('/plataform/ficha/create') }}
                    >
                        <Box alignItems='center' justifyContent='center' width='100%' display='flex' gap={2}>
                            <Typography variant='h6'>Criar Ficha</Typography>
                            <CustomIconButton>
                                <Add />
                            </CustomIconButton>
                        </Box>
                    </Card>
                </Grid>
            </Box>
        </Box>
    )
}
