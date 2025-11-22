/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'

import { useCampaignContext } from '@contexts';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import {
    People,
    SupervisorAccount
} from '@mui/icons-material';
import {
    Box,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { blue, green, orange, purple } from '@mui/material/colors';
import { type ReactElement, useMemo } from 'react';
import PlayerCard from './PlayerCard';

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
    const { users, charsheets } = useCampaignContext()
    
    const theme = useTheme();
    
    // const queryClient = useQueryClient()

    const { data: playerCharsheets, loading: isPlayerCharsheetsPending } = useFirestoreRealtime('charsheet', {
        filters: [
            { field: 'id', operator: 'in', value: charsheets.map(f => f.id) }
        ],
        enabled: charsheets.length > 0
    })

    const players = useMemo(() => {
        return users.players?.map(player => {
            const playerCharsheet = playerCharsheets?.find(f => f.userId === player.id)
    
            return {
                id: player.id,
                name: player.name,
                avatar: player.image ?? '/assets/default-avatar.jpg',
                status: [],
                charsheet: playerCharsheet
            }
        })
    }, [ users, playerCharsheets ])

    const campaignStats = useMemo(() => {
        const totalPlayers = players?.length ?? 0;
        const activePlayers = players?.filter(p => p.charsheet).length ?? 0;
        const averageLevel = playerCharsheets?.length 
            ? Math.round(playerCharsheets.reduce((sum, f) => sum + f.level, 0) / playerCharsheets.length)
            : 0;
        const highestLevel = playerCharsheets?.length 
            ? Math.max(...playerCharsheets.map(f => f.level))
            : 0;
        
        return {
            totalPlayers,
            activePlayers,
            averageLevel,
            highestLevel
        };
    }, [ players, playerCharsheets ]);

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
                        {isPlayerCharsheetsPending ? (
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
                                {playerCharsheets?.length || 0} ficha{(playerCharsheets?.length || 0) !== 1 ? 's' : ''} ativa{(playerCharsheets?.length || 0) !== 1 ? 's' : ''}
                            </Typography>
                            
                            {isPlayerCharsheetsPending ? (
                                <Stack spacing={2}>
                                    <Skeleton variant="rounded" height={140} />
                                    <Skeleton variant="rounded" height={140} />
                                    <Skeleton variant="rounded" height={140} />
                                </Stack>
                            ) : (!playerCharsheets || playerCharsheets.length === 0) ? (
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
                                    {playerCharsheets.map(charsheet => (
                                        <PlayerCard
                                            key={charsheet.id}
                                            charsheet={charsheet}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Section>

                    {/* teste */}
                    {/* <PerkCards /> */}
                </Stack>
            </Box>
            <Snackbar />
        </Box>
    )
}
