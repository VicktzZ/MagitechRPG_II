/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { CharsheetCard } from '@components/charsheet';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import { Add } from '@mui/icons-material';
import { Avatar, Box, Card, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { QueryBuilder } from '@utils/queryBuilder';
import { color } from '@themes/tokens';
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
                                bgcolor: 'background.paper',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'border-color 120ms, background-color 120ms',
                                '&:hover': {
                                    bgcolor: 'background.raised',
                                    borderColor: color.borderStrong
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
                                        bgcolor: 'primary.main'
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
