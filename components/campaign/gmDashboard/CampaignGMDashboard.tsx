/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'

import { useCampaignContext } from '@contexts';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Snackbar,
    TextField,
    Typography,
    Stack,
    Chip,
    Tooltip,
    useTheme,
    Backdrop,
    Divider
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import {
    Shield,
    People,
    TrendingUp,
    SupervisorAccount,
    EmojiEvents
} from '@mui/icons-material'
import { campaignService, fichaService } from '@services'
import { useSnackbar } from 'notistack'
import { type ReactElement, useMemo, useState } from 'react'
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
    const { enqueueSnackbar } = useSnackbar()
    const theme = useTheme();
    
    const [ levelUpDialogOpen, setLevelUpDialogOpen ] = useState(false)
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([])
    const [ isLevelingUp, setIsLevelingUp ] = useState(false)
    const [ levelsToAdd, setLevelsToAdd ] = useState<number>(1)

    const queryClient = useQueryClient()

    const { data: playerFichas } = useRealtimeDatabase({
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

    const handleLevelUp = async () => {
        try {
            setIsLevelingUp(true)

            // Processa cada jogador individualmente para poder mostrar mensagens específicas
            await Promise.all(
                selectedPlayers.map(async playerId => {
                    const player = players.find(p => p.id === playerId)
                    if (player?.ficha?._id) {
                        try {
                            const updatedFicha = await fichaService.increaseLevel(player.ficha._id, levelsToAdd)
                            enqueueSnackbar(`Ficha ${player.ficha.name} foi para o nível ${updatedFicha.level}!`, {
                                variant: 'success'
                            })
                        } catch (error) {
                            console.error(`Erro ao evoluir ficha ${player.ficha.name}:`, error)
                            enqueueSnackbar(`Não foi possível evoluir a ficha ${player.ficha.name}!`, {
                                variant: 'error'
                            })
                        }
                    }
                })
            )

            setLevelUpDialogOpen(false)
            setLevelsToAdd(1)
            setSelectedPlayers([])
        } catch (error) {
            console.error('Erro ao aumentar nível:', error)
        } finally {
            setIsLevelingUp(false)
        }
    }

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            {isLevelingUp && (
                <Backdrop 
                    open={true} 
                    sx={{ 
                        zIndex: theme.zIndex.drawer + 1,
                        backdropFilter: 'blur(4px)',
                        bgcolor: 'rgba(0,0,0,0.7)'
                    }}
                >
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="h6" color="white">
                            Evoluindo personagens...
                        </Typography>
                    </Stack>
                </Backdrop>
            )}
            
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
                    </Section>

                    {/* Ações Rápidas */}
                    <Section 
                        title="Ações do Game Master" 
                        icon={
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: purple[100],
                                    border: '2px solid',
                                    borderColor: purple[200]
                                }}
                            >
                                <Shield sx={{ color: purple[700], fontSize: '2rem' }} />
                            </Box>
                        }
                    >
                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Tooltip title="Evoluir jogadores selecionados">
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<TrendingUp />}
                                    onClick={() => setLevelUpDialogOpen(true)}
                                    sx={{
                                        bgcolor: green[600],
                                        '&:hover': {
                                            bgcolor: green[700],
                                            transform: 'translateY(-2px)',
                                            boxShadow: 4
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Aumentar Nível
                                </Button>
                            </Tooltip>
                        </Box>
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
                            
                            {!playerFichas || playerFichas.length === 0 ? (
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

            {/* Dialog de Level Up Aprimorado */}
            <Dialog 
                open={levelUpDialogOpen} 
                onClose={() => !isLevelingUp && setLevelUpDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                            : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)'
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <EmojiEvents />
                    Evolução de Personagens
                </DialogTitle>
                
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Typography variant="body1" color="text.secondary">
                            Selecione os jogadores que deseja evoluir e defina quantos níveis adicionar:
                        </Typography>
                        
                        {/* Campo de Níveis */}
                        <Paper 
                            elevation={1}
                            sx={{ 
                                p: 2, 
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                borderRadius: 2
                            }}
                        >
                            <TextField
                                label="Quantidade de Níveis"
                                type="number"
                                value={levelsToAdd}
                                onChange={e => {
                                    const value = parseInt(e.target.value)
                                    if (value > 0) {
                                        setLevelsToAdd(value)
                                    }
                                }}
                                inputProps={{ min: 1, max: 10 }}
                                fullWidth
                                disabled={isLevelingUp}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: green[300]
                                        },
                                        '&:hover fieldset': {
                                            borderColor: green[500]
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: green[600]
                                        }
                                    }
                                }}
                            />
                        </Paper>
                        
                        {/* Lista de Jogadores */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                                Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                            </Typography>
                            
                            <Paper 
                                elevation={1}
                                sx={{ 
                                    maxHeight: 400, 
                                    overflow: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <List>
                                    {players.map((player, index) => (
                                        <Box key={player.id}>
                                            <ListItem
                                                button
                                                onClick={() => {
                                                    if (isLevelingUp) return
                                                    const newSelected = selectedPlayers.includes(player.id!)
                                                        ? selectedPlayers.filter(id => id !== player.id)
                                                        : [ ...selectedPlayers, player.id ]
                                                    setSelectedPlayers(newSelected as string[])
                                                }}
                                                selected={selectedPlayers.includes(player.id!)}
                                                disabled={isLevelingUp}
                                                sx={{
                                                    borderRadius: 1,
                                                    mx: 1,
                                                    my: 0.5,
                                                    '&.Mui-selected': {
                                                        bgcolor: green[100] + '60',
                                                        '&:hover': {
                                                            bgcolor: green[100] + '80'
                                                        }
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar 
                                                        src={player.avatar}
                                                        sx={{
                                                            border: selectedPlayers.includes(player.id!) 
                                                                ? `2px solid ${green[500]}` 
                                                                : '2px solid transparent'
                                                        }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {player.ficha?.name || 'Sem ficha'}
                                                            </Typography>
                                                            {selectedPlayers.includes(player.id!) && (
                                                                <Chip 
                                                                    label="Selecionado" 
                                                                    size="small" 
                                                                    color="success"
                                                                    sx={{ fontWeight: 600 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                            <Chip 
                                                                label={`Nível ${player.ficha?.level ?? 'N/A'}`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: blue[100],
                                                                    color: blue[800],
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                            {selectedPlayers.includes(player.id!) && (
                                                                <Chip 
                                                                    label={`→ Nível ${(player.ficha?.level || 0) + levelsToAdd}`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: green[100],
                                                                        color: green[800],
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < players.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={() => setLevelUpDialogOpen(false)} 
                        disabled={isLevelingUp}
                        variant="outlined"
                        size="large"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleLevelUp}
                        variant="contained"
                        size="large"
                        disabled={selectedPlayers.length === 0 || isLevelingUp}
                        startIcon={isLevelingUp ? <CircularProgress size={20} /> : <TrendingUp />}
                        sx={{
                            bgcolor: green[600],
                            '&:hover': {
                                bgcolor: green[700]
                            }
                        }}
                    >
                        {isLevelingUp ? 'Evoluindo...' : `Evoluir ${selectedPlayers.length} Jogador${selectedPlayers.length !== 1 ? 'es' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar />
        </Box>
    )
}
