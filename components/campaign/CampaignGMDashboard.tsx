'use client';

import {
    Box,
    Grid,
    Paper,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Menu,
    MenuItem,
    CircularProgress,
    TextField,
    Snackbar,
    Typography
} from '@mui/material'
import { useCampaignContext } from '@contexts/campaignContext'
import { useGameMasterContext } from '@contexts/gameMasterContext'
import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import BoltIcon from '@mui/icons-material/Bolt'
import ShieldIcon from '@mui/icons-material/Shield'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import type { Status } from '@types'
import { useSnackbar } from 'notistack'
import { type ReactElement, useState } from 'react';
import { fichaService } from '@services';

export default function CampaignGMDashboard(): ReactElement | null {
    const { campUsers, playerFichas } = useCampaignContext()
    const { isUserGM } = useGameMasterContext()
    const [ levelUpDialogOpen, setLevelUpDialogOpen ] = useState(false)
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([])
    const [ playerAnchorEl, setPlayerAnchorEl ] = useState<null | HTMLElement>(null)
    const [ statusAnchorEl, setStatusAnchorEl ] = useState<null | HTMLElement>(null)
    const [ isLevelingUp, setIsLevelingUp ] = useState(false)
    const [ levelsToAdd, setLevelsToAdd ] = useState<number>(1)
    const { enqueueSnackbar } = useSnackbar()

    // Se não for GM, não renderiza nada
    if (!isUserGM) return null

    const players = campUsers.player.map(player => {
        const playerFicha = playerFichas.find(f => f.userId === player._id)

        return {
            id: player._id,
            name: player.name,
            avatar: player.image ?? '/assets/default-avatar.jpg',
            initiative: 0,
            status: [],
            ficha: playerFicha!
        }
    })

    const handleLevelUp = async () => {
        try {
            setIsLevelingUp(true)

            // Processa cada jogador individualmente para poder mostrar mensagens específicas
            await Promise.all(
                selectedPlayers.map(async (playerId) => {
                    const player = players.find(p => p.id === playerId)
                    if (player?.ficha._id) {
                        try {
                            const updatedFicha = await fichaService.increaseLevel(player.ficha._id, levelsToAdd)
                            enqueueSnackbar(
                                `Ficha ${player.ficha.name} foi para o nível ${updatedFicha.level}!`, 
                                { variant: 'success' }
                            )
                        } catch (error) {
                            console.error(`Erro ao evoluir ficha ${player.ficha.name}:`, error)
                            enqueueSnackbar(
                                `Não foi possível evoluir a ficha ${player.ficha.name}!`,
                                { variant: 'error' }
                            )
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

    const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
        setStatusAnchorEl(event.currentTarget)
    }

    const handleAddStatus = (status: Status) => {
        setStatusAnchorEl(null)
    }

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'background.paper2' }}>
                        <Typography variant="h6" gutterBottom>
                            Jogadores
                        </Typography>
                        <Grid container spacing={2}>
                            {playerFichas.map((ficha, index) => (
                                <Grid item xs={12} md={6} key={ficha._id}>
                                    <Paper 
                                        sx={{ 
                                            p: 2,
                                            bgcolor: 'background.paper',
                                            borderRadius: 1,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {/* Nome e Informações do Personagem */}
                                        <Box textAlign="center" mb={2}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {ficha.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Nv. {ficha.level} • {ficha.class as string} • {ficha.lineage as unknown as string}
                                            </Typography>
                                        </Box>

                                        {/* Status com Ícones */}
                                        <Box 
                                            display="flex" 
                                            gap={2}
                                            flexWrap="wrap"
                                            justifyContent="center"
                                            sx={{
                                                '& .stat': {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    minWidth: '80px',
                                                    justifyContent: 'center'
                                                }
                                            }}
                                        >
                                            <Box className="stat">
                                                <FavoriteIcon color="error" sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    {ficha.attributes.lp}/{ficha.maxLp}
                                                </Typography>
                                            </Box>

                                            <Box className="stat">
                                                <BoltIcon color="info" sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    {ficha.attributes.mp}/{ficha.maxMp}
                                                </Typography>
                                            </Box>

                                            <Box className="stat">
                                                <ShieldIcon color="success" sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    {ficha.attributes.ap}/{ficha.maxAp}
                                                </Typography>
                                            </Box>

                                            <Box className="stat">
                                                <MonetizationOnIcon sx={{ fontSize: 16, color: 'gold' }} />
                                                <Typography variant="body2">
                                                    {ficha.inventory.money}
                                                </Typography>
                                            </Box>

                                            <Box className="stat">
                                                <LocalPoliceIcon sx={{ fontSize: 16, color: 'orange' }} />
                                                <Typography variant="body2">
                                                    {ficha.ammoCounter.current}/{ficha.ammoCounter.max}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
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
                                    const newSelected = selectedPlayers.includes(player.id!)
                                        ? selectedPlayers.filter(id => id !== player.id)
                                        : [ ...selectedPlayers, player.id ]
                                    setSelectedPlayers(newSelected as string[])
                                }}
                                selected={selectedPlayers.includes(player.id!)}
                                disabled={isLevelingUp}
                            >
                                <ListItemAvatar>
                                    <Avatar src={player.avatar} />
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={player.ficha.name}
                                    secondary={`Nível Atual: ${player.ficha.level ?? 'N/A'}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Quantidade de Níveis"
                            type="number"
                            value={levelsToAdd}
                            onChange={(e) => {
                                const value = parseInt(e.target.value)
                                if (value > 0) {
                                    setLevelsToAdd(value)
                                }
                            }}
                            inputProps={{ min: 1 }}
                            fullWidth
                        />
                    </Box>
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
            <Snackbar />
        </Box>
    )
}