/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'

import { useCampaignContext } from '@contexts';
import {
    Box,
    Paper,
    Snackbar,
    Typography,
    Stack,
    useTheme,
    Skeleton
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import {
    People,
    SupervisorAccount
} from '@mui/icons-material'
import { campaignService } from '@services'
import { type ReactElement, useMemo } from 'react'
import PlayerCard from './PlayerCard'
import type { Ficha } from '@types'
import { useRealtimeDatabase } from '@hooks';
import { blue, green, orange, purple } from '@mui/material/colors';

// Componente Section reutilizável
interface SectionProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
    sx?: any;
}

function Section({ title, icon, children, sx }: SectionProps) {
    const theme = useTheme();
    
    return (
        <Paper 
            elevation={2}
            sx={{ 
                p: 3, 
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                },
                ...sx
            }}
        >
            <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    {icon}
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 700,
                            color: 'primary.main'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                {children}
            </Stack>
        </Paper>
    );
}

export default function CampaignGMDashboard(): ReactElement | null {
    const { users, fichas, code } = useCampaignContext()
    
    const theme = useTheme();
    
    const queryClient = useQueryClient()

    const { data: playerFichas, query: { isPending: isPlayerFichasPending  } } = useRealtimeDatabase({
        collectionName: 'fichas',
        pipeline: [
            {
                $match: {
                    _id: { $in: fichas.map(f => f._id) }
                }
            }
        ],
        onChange: async () => {
            // Invalida o cache para forçar refetch dos dados
            console.log('[GM Dashboard] Invalidando cache e forçando refetch')
            await queryClient.invalidateQueries({ queryKey: [ 'playerFichas', fichas.map(f => f._id) ] })
            await queryClient.refetchQueries({ queryKey: [ 'playerFichas', fichas.map(f => f._id) ] })
        }
    },
    {
        queryKey: [ 'playerFichas', fichas.map(f => f._id) ],
        queryFn: async () => await campaignService.getFichas(code),
        staleTime: 0,
        gcTime: 0
    })

    const players = useMemo(() => {
        return users.player.map(player => {
            const playerFicha = playerFichas?.find(f => f.userId === player._id)
    
            return {
                id: player._id,
                name: player.name,
                avatar: player.image ?? '/assets/default-avatar.jpg',
                status: [],
                ficha: playerFicha
            }
        })
    }, [ users, playerFichas ])

    // Estatísticas da campanha
    const campaignStats = useMemo(() => {
        const totalPlayers = players.length;
        const activePlayers = players.filter(p => p.ficha).length;
        const averageLevel = playerFichas?.length 
            ? Math.round(playerFichas.reduce((sum, f) => sum + f.level, 0) / playerFichas.length)
            : 0;
        const highestLevel = playerFichas?.length 
            ? Math.max(...playerFichas.map(f => f.level))
            : 0;
        
        return {
            totalPlayers,
            activePlayers,
            averageLevel,
            highestLevel
        };
    }, [ players, playerFichas ]);

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                <Stack spacing={4}>
                    {/* Estatísticas da Campanha */}
                    <Section 
                        title="Estatísticas da Campanha" 
                        icon={
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: blue[100],
                                    border: '2px solid',
                                    borderColor: blue[200]
                                }}
                            >
                                <SupervisorAccount sx={{ color: blue[700], fontSize: '2rem' }} />
                            </Box>
                        }
                    >
                        {isPlayerFichasPending ? (
                            <Box sx={{ p: 2 }}>
                                <Skeleton variant="rounded" height={80} />
                            </Box>
                        ) : (
                            <Box 
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    p: 2,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: blue[600], fontWeight: 700 }}>
                                        {campaignStats.totalPlayers}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Jogadores Total
                                    </Typography>
                                </Stack>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: green[600], fontWeight: 700 }}>
                                        {campaignStats.activePlayers}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Fichas Ativas
                                    </Typography>
                                </Stack>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: orange[600], fontWeight: 700 }}>
                                        {campaignStats.averageLevel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Nível Médio
                                    </Typography>
                                </Stack>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: purple[600], fontWeight: 700 }}>
                                        {campaignStats.highestLevel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Maior Nível
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </Section>

                    {/* Lista de Jogadores */}
                    <Section 
                        title="Jogadores da Campanha" 
                        icon={
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: green[100],
                                    border: '2px solid',
                                    borderColor: green[200]
                                }}
                            >
                                <People sx={{ color: green[700], fontSize: '2rem' }} />
                            </Box>
                        }
                    >
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {playerFichas?.length || 0} ficha{(playerFichas?.length || 0) !== 1 ? 's' : ''} ativa{(playerFichas?.length || 0) !== 1 ? 's' : ''}
                            </Typography>
                            
                            {isPlayerFichasPending ? (
                                <Stack spacing={2}>
                                    <Skeleton variant="rounded" height={140} />
                                    <Skeleton variant="rounded" height={140} />
                                    <Skeleton variant="rounded" height={140} />
                                </Stack>
                            ) : (!playerFichas || playerFichas.length === 0) ? (
                                <Paper 
                                    sx={{ 
                                        p: 4, 
                                        textAlign: 'center',
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        bgcolor: 'transparent'
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                        Nenhum jogador encontrado
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Os jogadores da campanha aparecerão aqui quando se juntarem.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Box 
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                            lg: 'repeat(3, 1fr)'
                                        },
                                        gap: 3
                                    }}
                                >
                                    {playerFichas.map(ficha => (
                                        <PlayerCard
                                            key={ficha._id}
                                            ficha={ficha as Required<Ficha>}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Section>
                </Stack>
            </Box>

            <Snackbar />
        </Box>
    )
}
