/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { CharsheetCard } from '@components/charsheet';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import { Add } from '@mui/icons-material';
import { Avatar, Box, Card, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { QueryBuilder } from '@utils/queryBuilder';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';

export default function App(): ReactElement {
    const router = useRouter()
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const { data: session } = useSession()

    const { data: charsheets, loading } = useFirestoreRealtime('charsheet', {
        filters: [
            QueryBuilder.equals('userId', session?.user?.id ?? '')
        ],
        orderBy: [
            QueryBuilder.asc('name')
        ]
    })

    return (
        <Box display='flex' height='100vh' alignItems='center' pt={3} justifyContent='center'>
            <Box display='flex' height='100%' width='100%' p={3}>
                <Grid justifyContent={!matches ? 'inherit' : 'center'} container spacing={2} gap={!matches ? 2 : 0}>
                    {loading ? [ 0, 1, 2 ].map(() => (
                        <Skeleton 
                            variant='rectangular' 
                            key={Math.random()} 
                            sx={{
                                borderRadius: 3,
                                height: !matches ? 290 : 320,
                                width: !matches ? 320 : '100%',
                                maxWidth: 360
                            }}
                        />
                    )) : charsheets?.map((charsheet) => (
                        <motion.div 
                            key={charsheet.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                        >
                            <CharsheetCard 
                                key={charsheet.id}
                                charsheet={charsheet}
                            />
                        </motion.div>
                    ))}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card
                            sx={{
                                p: 4,
                                height: !matches ? 290 : 320,
                                width: !matches ? 320 : '100%',
                                maxWidth: 360,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)'
                                    : 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 8px 16px rgba(0,0,0,0.3)'
                                    : '0 8px 16px rgba(0,0,0,0.08)',
                                transition: 'all 0.2s ease',
                                overflow: 'hidden',
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 12px 20px rgba(0,0,0,0.4)'
                                        : '0 12px 20px rgba(0,0,0,0.12)',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                                },
                                '&:before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 3,
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                                    opacity: 0.9
                                }
                            }}
                            onClick={() => { router.push('/app/charsheet/create') }}
                        >
                            <Box 
                                display='flex' 
                                flexDirection='column'
                                alignItems='center' 
                                justifyContent='center' 
                                gap={2}
                            >
                                <Avatar 
                                    sx={{
                                        width: 56, 
                                        height: 56, 
                                        bgcolor: 'primary.main',
                                        boxShadow: 1
                                    }}
                                >
                                    <Add />
                                </Avatar>
                                <Typography 
                                    variant='h6' 
                                    sx={{ 
                                        fontWeight: 500,
                                        color: theme.palette.text.primary
                                    }}
                                >
                                    Criar Ficha
                                </Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>
            </Box>
        </Box>
    )
}
