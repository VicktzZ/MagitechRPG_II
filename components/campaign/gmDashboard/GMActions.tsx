'use client';

import { useCampaignContext } from '@contexts';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    ListItemIcon,
    ListItemText as MenuItemText,
    Menu,
    MenuItem,
    TextField,
    Typography,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material';
import { campaignService, fichaService } from '@services';
import type { Note, Weapon, Armor, Item } from '@types';
import { useSnackbar } from 'notistack';
import { useMemo, useState, type ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeDatabase } from '@hooks';
import { blue, green } from '@mui/material/colors';
import AddItemModal from '@layout/AddItemModal';

export default function GMActions(): ReactElement {
    const { campaign, isUserGM, users, fichas, code } = useCampaignContext()
    const { enqueueSnackbar } = useSnackbar()

    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null)
    const [ openAddDialog, setOpenAddDialog ] = useState(false)
    const [ noteContent, setNoteContent ] = useState('')
    const [ addItemModalOpen, setAddItemModalOpen ] = useState(false)

    // Level up dialog states
    const [ levelUpDialogOpen, setLevelUpDialogOpen ] = useState(false)
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([])
    const [ isLevelingUp, setIsLevelingUp ] = useState(false)
    const [ levelsToAdd, setLevelsToAdd ] = useState<number>(1)

    const menuOpen = Boolean(anchorEl)

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleCloseMenu = () => {
        setAnchorEl(null)
    }

    const handleOpenAddNote = () => {
        setNoteContent('')
        setOpenAddDialog(true)
        handleCloseMenu()
    }

    const handleOpenAddCustomItem = () => {
        setAddItemModalOpen(true)
        handleCloseMenu()
    }

    const handleSaveNote = async () => {
        try {
            if (!noteContent.trim()) {
                enqueueSnackbar('Conteúdo da nota é obrigatório', { variant: 'error' })
                return
            }

            const newNote: Note = {
                content: noteContent.trim(),
                timestamp: new Date()
            }
            await campaignService.createNote(campaign._id!, newNote)
            enqueueSnackbar('Nota criada com sucesso!', { variant: 'success' })
            setOpenAddDialog(false)
            setNoteContent('')
        } catch (error) {
            console.error('Erro ao criar nota:', error)
            enqueueSnackbar('Erro ao criar nota', { variant: 'error' })
        }
    }

    // Player fichas realtime
    const queryClient = useQueryClient()
    const { data: playerFichas } = useRealtimeDatabase({
        collectionName: 'fichas',
        pipeline: [
            { $match: { _id: { $in: fichas.map(f => f._id) } } }
        ],
        onChange: async () => {
            await queryClient.invalidateQueries({ queryKey: [ 'playerFichas', fichas.map(f => f._id) ] })
            await queryClient.refetchQueries({ queryKey: [ 'playerFichas', fichas.map(f => f._id) ] })
        }
    }, {
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
                ficha: playerFicha
            }
        })
    }, [ users, playerFichas ])

    const handleOpenLevelUp = () => {
        setSelectedPlayers([])
        setLevelsToAdd(1)
        setLevelUpDialogOpen(true)
        handleCloseMenu()
    }

    const handleLevelUp = async () => {
        try {
            setIsLevelingUp(true)
            await Promise.all(
                selectedPlayers.map(async playerId => {
                    const player = players.find(p => p.id === playerId)
                    if (player?.ficha?._id) {
                        try {
                            const updatedFicha = await fichaService.increaseLevel(player.ficha._id, levelsToAdd)
                            enqueueSnackbar(`Ficha ${player.ficha.name} foi para o nível ${updatedFicha.level}!`, { variant: 'success' })
                        } catch (error) {
                            console.error(`Erro ao evoluir ficha ${player.ficha.name}:`, error)
                            enqueueSnackbar(`Não foi possível evoluir a ficha ${player.ficha.name}!`, { variant: 'error' })
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
            <Button
                onClick={handleOpenMenu}
                variant='contained'
                aria-controls={menuOpen ? 'gm-actions-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
            >
                <Typography variant="button">
                    Ações do Game Master
                </Typography>
            </Button>

            <Menu
                id="gm-actions-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <span>
                    <MenuItem onClick={handleOpenAddNote} disabled={!isUserGM}>
                        <ListItemIcon>
                            <NoteAddIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText>Adicionar nota da campanha</MenuItemText>
                    </MenuItem>
                </span>
                <Divider />
                <span>
                    <MenuItem onClick={handleOpenLevelUp} disabled={!isUserGM}>
                        <ListItemIcon>
                            <TrendingUpIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText>Aumentar Nível de Jogadores</MenuItemText>
                    </MenuItem>
                </span>
                <Divider />
                <span>
                    <MenuItem onClick={handleOpenAddCustomItem} disabled={!isUserGM}>
                        <ListItemIcon>
                            <AddCircleOutlineIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText>Adicionar Item customizado</MenuItemText>
                    </MenuItem>
                </span>
            </Menu>

            {/* Dialog: Nova Nota */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Nova Nota</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Conteúdo"
                        multiline
                        rows={4}
                        fullWidth
                        autoFocus
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSaveNote} variant="contained" disabled={!isUserGM}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Level Up */}
            <Dialog 
                open={levelUpDialogOpen} 
                onClose={() => !isLevelingUp && setLevelUpDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon /> Evolução de Personagens
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Quantidade de Níveis"
                            type="number"
                            value={levelsToAdd}
                            onChange={e => {
                                const value = parseInt(e.target.value)
                                if (value > 0) setLevelsToAdd(value)
                            }}
                            inputProps={{ min: 1, max: 10 }}
                            fullWidth
                            disabled={isLevelingUp}
                        />

                        <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                            </Typography>
                            <Box sx={{ maxHeight: 360, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
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
                                                    '&.Mui-selected': {
                                                        bgcolor: green[100] + '60',
                                                        '&:hover': { bgcolor: green[100] + '80' }
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
                                                                {player.ficha?.name ?? 'Sem ficha'}
                                                            </Typography>
                                                            {selectedPlayers.includes(player.id!) && (
                                                                <Chip label="Selecionado" size="small" color="success" sx={{ fontWeight: 600 }} />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                            <Chip 
                                                                label={`Nível ${player.ficha?.level ?? 'N/A'}`}
                                                                size="small"
                                                                sx={{ bgcolor: blue[100], color: blue[800], fontWeight: 600 }}
                                                            />
                                                            {selectedPlayers.includes(player.id!) && (
                                                                <Chip 
                                                                    label={`→ Nível ${(player.ficha?.level ?? 0) + levelsToAdd}`}
                                                                    size="small"
                                                                    sx={{ bgcolor: green[100], color: green[800], fontWeight: 600 }}
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
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setLevelUpDialogOpen(false)} disabled={isLevelingUp} variant="outlined">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleLevelUp}
                        variant="contained"
                        disabled={selectedPlayers.length === 0 || isLevelingUp}
                        startIcon={isLevelingUp ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                        sx={{ bgcolor: green[600], '&:hover': { bgcolor: green[700] } }}
                    >
                        {isLevelingUp ? 'Evoluindo...' : `Evoluir ${selectedPlayers.length} Jogador${selectedPlayers.length !== 1 ? 'es' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Adicionar Item customizado */}
            <AddItemModal
                modalOpen={addItemModalOpen}
                setModalOpen={setAddItemModalOpen}
                disableDefaultCreate
                title="Adicionar Item Customizado"
                onConfirm={async (created: Weapon | Armor | Item) => {
                    try {
                        // Type guards para identificar o tipo do item
                        const isWeapon = (it: any): it is Weapon => it && 'hit' in it && 'effect' in it && 'ammo' in it
                        const isArmor = (it: any): it is Armor => it && 'displacementPenalty' in it && 'value' in it && 'categ' in it

                        const type: 'weapon' | 'armor' | 'item' = isWeapon(created) ? 'weapon' : isArmor(created) ? 'armor' : 'item'

                        await campaignService.addCustomItem(campaign._id!, type, created)
                        
                        // Atualiza dados da campanha imediatamente
                        await queryClient.invalidateQueries({ queryKey: [ 'campaignData', code ] })
                        await queryClient.refetchQueries({ queryKey: [ 'campaignData', code ] })

                        setAddItemModalOpen(false)
                        enqueueSnackbar('Item customizado adicionado à campanha!', { variant: 'success' })
                    } catch (error) {
                        console.error('Erro ao adicionar item customizado:', error)
                        enqueueSnackbar('Não foi possível adicionar o item customizado.', { variant: 'error' })
                    }
                }}
            />
        </Box>
    )
}
