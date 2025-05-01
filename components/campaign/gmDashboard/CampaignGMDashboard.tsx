/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useCampaignContext } from '@contexts/campaignContext'
import { useGameMasterContext } from '@contexts/gameMasterContext'
import AddIcon from '@mui/icons-material/Add'
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@mui/material'
import { fichaService } from '@services'
import { useSnackbar } from 'notistack'
import { type ReactElement, useEffect, useState } from 'react'
import PlayerCard from './PlayerCard'
import type { Ficha } from '@types'
import { useChannel } from '@contexts/channelContext'
import { PusherEvent } from '@enums'

export default function CampaignGMDashboard(): ReactElement | null {
    const { campUsers, playerFichas, setPlayerFichas } = useCampaignContext()
    const { channel } = useChannel()
    const { isUserGM } = useGameMasterContext()
    const { enqueueSnackbar } = useSnackbar()
    
    const [ levelUpDialogOpen, setLevelUpDialogOpen ] = useState(false)
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([])
    const [ isLevelingUp, setIsLevelingUp ] = useState(false)
    const [ levelsToAdd, setLevelsToAdd ] = useState<number>(1)

    if (!isUserGM) return null

    useEffect(() => {
        channel.bind(PusherEvent.FICHA_UPDATED, (ficha: Ficha) => {
            setPlayerFichas(prev => {
                return prev.map(f => f._id === ficha._id ? ficha : f)
            })
        })        
    }, [ channel ])

    const players = campUsers.player.map(player => {
        const playerFicha = playerFichas.find(f => f.userId === player._id)

        return {
            id: player._id,
            name: player.name,
            avatar: player.image ?? '/assets/default-avatar.jpg',
            status: [],
            ficha: playerFicha!
        }
    })

    const handleLevelUp = async () => {
        try {
            setIsLevelingUp(true)

            // Processa cada jogador individualmente para poder mostrar mensagens específicas
            await Promise.all(
                selectedPlayers.map(async playerId => {
                    const player = players.find(p => p.id === playerId)
                    if (player?.ficha._id) {
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
        <Box>
            <Grid container spacing={2}>
                {/* Jogadores section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'background.paper2' }}>
                        <Typography variant="h6" gutterBottom>
                            Jogadores
                        </Typography>
                        <Grid container spacing={2}>
                            {playerFichas.map(ficha => (
                                <PlayerCard
                                    key={ficha._id}
                                    ficha={ficha as Required<Ficha>}
                                />
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
                        {players.map(player => (
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
                            onChange={e => {
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
                    <Button onClick={() => setLevelUpDialogOpen(false)} disabled={isLevelingUp}>
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

            <Snackbar />
        </Box>
    )
}
