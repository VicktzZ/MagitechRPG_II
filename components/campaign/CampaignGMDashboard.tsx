'use client'

import { useState, type ReactElement } from 'react'
import {
    Box,
    Grid,
    Paper,
    Typography,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Menu,
    MenuItem,
    CircularProgress
} from '@mui/material'
import { useCampaignContext } from '@contexts/campaignContext'
import { useGameMasterContext } from '@contexts/gameMasterContext'
import { fichaService } from '@services'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import type { Status } from '@types'

export default function CampaignGMDashboard(): ReactElement | null {
    const { campaign, campUsers } = useCampaignContext()
    const { isUserGM } = useGameMasterContext()
    const [ levelUpDialogOpen, setLevelUpDialogOpen ] = useState(false)
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([])
    const [ playerAnchorEl, setPlayerAnchorEl ] = useState<null | HTMLElement>(null)
    const [ statusAnchorEl, setStatusAnchorEl ] = useState<null | HTMLElement>(null)
    const [ isLevelingUp, setIsLevelingUp ] = useState(false)

    // Se não for GM, não renderiza nada
    if (!isUserGM) return null

    const players = campUsers.player.map(player => ({
        id: player._id,
        name: player.name,
        avatar: player.image ?? '/assets/default-avatar.jpg',
        initiative: 0, // Valor inicial
        status: [], // Array de status
        ficha: campaign.players.find(p => p.userId === player._id)?.fichaId
    }))

    const handleLevelUp = async () => {
        try {
            setIsLevelingUp(true)

            // Evolui cada jogador selecionado
            await Promise.all(
                selectedPlayers.map(async (playerId) => {
                    const player = players.find(p => p.id === playerId)
                    if (player?.ficha) {
                        await fichaService.levelUp(player.ficha._id)
                    }
                })
            )

            setLevelUpDialogOpen(false)
            setSelectedPlayers([])
        } catch (error) {
            console.error('Erro ao evoluir jogadores:', error)
        } finally {
            setIsLevelingUp(false)
        }
    }

    const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
        setStatusAnchorEl(event.currentTarget)
    }

    const handleAddStatus = (status: Status) => {
        setStatusAnchorEl(null)
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
                {/* Painel de Iniciativa e Status */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Ordem de Iniciativa
                        </Typography>
                        <List>
                            {players
                                .sort((a, b) => b.initiative - a.initiative)
                                .map((player) => (
                                    <ListItem
                                        key={player.id}
                                        sx={{
                                            mb: 1,
                                            bgcolor: 'background.paper',
                                            borderRadius: 1
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={player.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={player.name}
                                            secondary={
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {/* Status chips */}
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Botão de Level Up */}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setLevelUpDialogOpen(true)}
                    >
                        Aumentar Nível
                    </Button>
                </Grid>
            </Grid>

            {/* Dialog de Level Up */}
            <Dialog open={levelUpDialogOpen} onClose={() => !isLevelingUp && setLevelUpDialogOpen(false)}>
                <DialogTitle>Selecione os jogadores para evoluir</DialogTitle>
                <DialogContent>
                    <List>
                        {players.map((player) => (
                            <ListItem
                                key={player.id}
                                button
                                onClick={() => {
                                    if (isLevelingUp) return
                                    const newSelected = selectedPlayers.includes(player.id)
                                        ? selectedPlayers.filter(id => id !== player.id)
                                        : [...selectedPlayers, player.id]
                                    setSelectedPlayers(newSelected)
                                }}
                                selected={selectedPlayers.includes(player.id)}
                                disabled={isLevelingUp}
                            >
                                <ListItemAvatar>
                                    <Avatar src={player.avatar} />
                                </ListItemAvatar>
                                <ListItemText primary={player.name} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setLevelUpDialogOpen(false)}
                        disabled={isLevelingUp}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleLevelUp} 
                        variant="contained" 
                        color="primary"
                        disabled={selectedPlayers.length === 0 || isLevelingUp}
                        startIcon={isLevelingUp ? <CircularProgress size={20} /> : null}
                    >
                        {isLevelingUp ? 'Evoluindo...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Menu de Ações do Jogador */}
            <Menu
                anchorEl={playerAnchorEl}
                open={Boolean(playerAnchorEl)}
                onClose={() => setPlayerAnchorEl(null)}
            >
                <MenuItem onClick={handleStatusClick}>
                    Adicionar Status
                </MenuItem>
                <MenuItem onClick={() => {
                    setPlayerAnchorEl(null)
                }}>
                    Ver Detalhes
                </MenuItem>
            </Menu>

            {/* Menu de Status */}
            <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={() => setStatusAnchorEl(null)}
            >
                <MenuItem onClick={() => handleAddStatus({ name: 'Congelado', type: 'debuff' })}>
                    Congelado
                </MenuItem>
                <MenuItem onClick={() => handleAddStatus({ name: 'Queimando', type: 'debuff' })}>
                    Queimando
                </MenuItem>
                <MenuItem onClick={() => handleAddStatus({ name: 'Doente', type: 'debuff' })}>
                    Doente
                </MenuItem>
                <MenuItem onClick={() => handleAddStatus({ name: 'Fortalecido', type: 'buff' })}>
                    Fortalecido
                </MenuItem>
            </Menu>
        </Box>
    )
}