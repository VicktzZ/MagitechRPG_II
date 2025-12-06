'use client';

import { useCampaignContext } from '@contexts';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import AddItemModal from '@layout/AddItemModal';
import type { Armor, Item, Weapon, PerkFilters } from '@models';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Slider,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    ListItemText as MenuItemText,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { blue, green, orange, purple, red } from '@mui/material/colors';
import { campaignService, charsheetService } from '@services';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useMemo, useState, type ReactElement } from 'react';
import { PerkTypeEnum, SkillTypeEnum } from '@enums/rogueliteEnum';
import type { RarityType } from '@models/types/string';

export default function GMActions(): ReactElement {
    const { campaign, isUserGM, users, charsheets } = useCampaignContext()
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

    // Roguelite Level up dialog states
    const [ rogueliteLevelUpDialogOpen, setRogueliteLevelUpDialogOpen ] = useState(false)
    const [ selectedPlayersForRoguelite, setSelectedPlayersForRoguelite ] = useState<string[]>([])
    const [ isRogueliteLevelingUp, setIsRogueliteLevelingUp ] = useState(false)

    // Shop dialog states
    const [ shopDialogOpen, setShopDialogOpen ] = useState(false)
    const [ isUpdatingShop, setIsUpdatingShop ] = useState(false)
    const [ shopConfig, setShopConfig ] = useState({
        itemCount: 5,
        rarities: [] as RarityType[],
        types: [] as string[],
        itemKinds: [] as string[],
        priceMultiplier: 1.0
    })

    // Offer perks dialog states
    const [ offerPerksDialogOpen, setOfferPerksDialogOpen ] = useState(false)
    const [ selectedPlayersForPerks, setSelectedPlayersForPerks ] = useState<string[]>([])
    const [ isOfferingPerks, setIsOfferingPerks ] = useState(false)
    const [ perkFilters, setPerkFilters ] = useState<PerkFilters>({
        rarities: [],
        type: '',
        element: '',
        spellLevel: '',
        execution: '',
        itemKinds: [],
        skillTypes: []
    })

    const menuOpen = Boolean(anchorEl)

    // Filter options
    const rarityOptions: RarityType[] = [
        'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Amaldiçoado', 'Especial'
    ]
    const typeOptions = [
        { value: PerkTypeEnum.WEAPON, label: 'Arma' },
        { value: PerkTypeEnum.ARMOR, label: 'Armadura' },
        { value: PerkTypeEnum.ITEM, label: 'Item' },
        { value: PerkTypeEnum.SKILL, label: 'Habilidade' },
        { value: PerkTypeEnum.SPELL, label: 'Magia' },
        { value: PerkTypeEnum.BONUS, label: 'Bônus' },
        { value: PerkTypeEnum.UPGRADE, label: 'Upgrade' },
        { value: PerkTypeEnum.STATS, label: 'Stats' }
    ]
    const elementOptions = [
        'Fogo', 'Água', 'Ar', 'Terra', 'Eletricidade', 'Luz', 'Trevas', 'Não-Elemental',
        'Sangue', 'Vácuo', 'Psíquico', 'Radiação', 'Explosão', 'Tóxico', 'Gelo', 'Planta', 'Metal'
    ]
    const spellLevelOptions = [ '1', '2', '3', '4' ]
    const executionOptions = [ 'Livre', 'Completa', 'Padrão', 'Movimento', 'Reação', 'Bônus' ]
    const itemKindOptions = [ 'Especial', 'Utilidade', 'Consumível', 'Item Chave', 'Munição', 'Capacidade', 'Padrão', 'Arremessável', 'Equipamento' ]
    const skillTypeOptions = [
        { value: SkillTypeEnum.CLASSE, label: 'Classe' },
        { value: SkillTypeEnum.LINHAGEM, label: 'Linhagem' },
        { value: SkillTypeEnum.PROFISSAO, label: 'Profissão' },
        { value: SkillTypeEnum.TALENTO, label: 'Talento' },
        { value: SkillTypeEnum.RACA, label: 'Raça' },
        { value: SkillTypeEnum.SUBCLASSE, label: 'Subclasse' },
        { value: SkillTypeEnum.PODER_MAGICO, label: 'Poder Mágico' },
        { value: SkillTypeEnum.BONUS, label: 'Bônus' }
    ]

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

            await campaignService.createNote(campaign.id, { content: noteContent.trim() })
            enqueueSnackbar('Nota criada com sucesso!', { variant: 'success' })
            setOpenAddDialog(false)
            setNoteContent('')
        } catch (error) {
            console.error('Erro ao criar nota:', error)
            enqueueSnackbar('Erro ao criar nota', { variant: 'error' })
        }
    }

    // Player charsheets em tempo real usando Firestore
    const queryClient = useQueryClient()
    const { data: playerCharsheets } = useFirestoreRealtime('charsheet', {
        filters: charsheets.length > 0 ? [
            { field: 'id', operator: 'in', value: charsheets.map(f => f.id) }
        ] : undefined,
        onChange: async () => {
            await queryClient.invalidateQueries({ queryKey: [ 'playerCharsheets', charsheets.map(f => f.id) ] })
            await queryClient.refetchQueries({ queryKey: [ 'playerCharsheets', charsheets.map(f => f.id) ] })
        }
    })

    const players = useMemo(() => {
        return users.players?.map(player => {
            const playerCharsheet = playerCharsheets?.find(f => f.userId === player.id)
            return {
                id: player.id,
                name: player.name,
                avatar: player.image ?? '/assets/default-avatar.jpg',
                charsheet: playerCharsheet
            }
        })
    }, [ users, playerCharsheets ])

    const handleOpenLevelUp = () => {
        // Se for modo Roguelite, abre o modal específico
        if (campaign.mode === 'Roguelite') {
            setSelectedPlayersForRoguelite([])
            setRogueliteLevelUpDialogOpen(true)
        } else {
            setSelectedPlayers([])
            setLevelsToAdd(1)
            setLevelUpDialogOpen(true)
        }
        handleCloseMenu()
    }

    const handleRogueliteLevelUp = async () => {
        try {
            setIsRogueliteLevelingUp(true)
            
            // Pega os IDs dos charsheets dos jogadores selecionados
            const charsheetIds = selectedPlayersForRoguelite
                .map(playerId => {
                    const player = players.find(p => p.id === playerId)
                    return player?.charsheet?.id
                })
                .filter(Boolean) as string[]

            if (charsheetIds.length === 0) {
                enqueueSnackbar('Nenhum personagem selecionado possui ficha', { variant: 'error' })
                return
            }

            const response = await fetch(`/api/campaign/${campaign.id}/session/roguelite-levelup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ charsheetIds })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao evoluir personagens')
            }

            enqueueSnackbar(result.message, { variant: 'success' })
            setRogueliteLevelUpDialogOpen(false)
            setSelectedPlayersForRoguelite([])
        } catch (error) {
            console.error('Erro ao evoluir personagens (Roguelite):', error)
            enqueueSnackbar('Erro ao evoluir personagens', { variant: 'error' })
        } finally {
            setIsRogueliteLevelingUp(false)
        }
    }

    const handleLevelUp = async () => {
        try {
            setIsLevelingUp(true)
            await Promise.all(
                selectedPlayers.map(async playerId => {
                    const player = players.find(p => p.id === playerId)
                    if (player?.charsheet?.id) {
                        try {
                            const updatedCharsheet = await charsheetService.increaseLevel(player.charsheet.id, levelsToAdd)
                            enqueueSnackbar(`Charsheet ${player.charsheet.name} foi para o nível ${updatedCharsheet.level}!`, { variant: 'success' })
                        } catch (error) {
                            console.error(`Erro ao evoluir charsheet ${player.charsheet.name}:`, error)
                            enqueueSnackbar(`Não foi possível evoluir a charsheet ${player.charsheet.name}!`, { variant: 'error' })
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

    const handleOpenOfferPerks = () => {
        setSelectedPlayersForPerks([])
        setPerkFilters({
            rarities: [],
            type: '',
            element: '',
            spellLevel: '',
            execution: '',
            itemKinds: [],
            skillTypes: []
        })
        setOfferPerksDialogOpen(true)
        handleCloseMenu()
    }

    const handleOfferPerks = async () => {
        try {
            setIsOfferingPerks(true)
            await campaignService.offerPerks(campaign.id, selectedPlayersForPerks, perkFilters)
            enqueueSnackbar(`Vantagens oferecidas para ${selectedPlayersForPerks.length} jogador(es)!`, { variant: 'success' })
            setOfferPerksDialogOpen(false)
            setSelectedPlayersForPerks([])
        } catch (error) {
            console.error('Erro ao oferecer vantagens:', error)
            enqueueSnackbar('Erro ao oferecer vantagens', { variant: 'error' })
        } finally {
            setIsOfferingPerks(false)
        }
    }

    const handleOpenShop = () => {
        // Carrega configuração existente da campanha
        const existingShop = campaign.shop || {}
        setShopConfig({
            itemCount: existingShop.itemCount ?? 5,
            rarities: existingShop.rarities ?? [],
            types: existingShop.types ?? [],
            itemKinds: existingShop.itemKinds ?? [],
            priceMultiplier: existingShop.priceMultiplier ?? 1.0
        })
        setShopDialogOpen(true)
        handleCloseMenu()
    }

    const handleToggleShop = async (open: boolean) => {
        try {
            setIsUpdatingShop(true)
            await fetch(`/api/campaign/${campaign.id}/shop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isOpen: open,
                    config: open ? shopConfig : undefined
                })
            })
            enqueueSnackbar(open ? 'Loja aberta para os jogadores!' : 'Loja fechada.', { variant: 'success' })
            if (!open) setShopDialogOpen(false)
        } catch (error) {
            console.error('Erro ao atualizar loja:', error)
            enqueueSnackbar('Erro ao atualizar loja', { variant: 'error' })
        } finally {
            setIsUpdatingShop(false)
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
                <Divider />
                <span>
                    <MenuItem onClick={handleOpenOfferPerks} disabled={!isUserGM}>
                        <ListItemIcon>
                            <CardGiftcardIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText>Oferecer Vantagens</MenuItemText>
                    </MenuItem>
                </span>
                {campaign.mode === 'Roguelite' && (
                    <>
                        <Divider />
                        <span>
                            <MenuItem onClick={handleOpenShop} disabled={!isUserGM}>
                                <ListItemIcon>
                                    <StorefrontIcon fontSize="small" />
                                </ListItemIcon>
                                <MenuItemText>
                                    Gerenciar Loja
                                    {campaign.shop?.isOpen && (
                                        <Chip 
                                            label="Aberta" 
                                            size="small" 
                                            sx={{ ml: 1, height: 20, bgcolor: green[100], color: green[800] }}
                                        />
                                    )}
                                </MenuItemText>
                            </MenuItem>
                        </span>
                    </>
                )}
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
                                    {players?.map((player, index) => (
                                        <Box key={player.id}>
                                            <ListItem
                                                button
                                                onClick={() => {
                                                    if (isLevelingUp) return
                                                    const newSelected = selectedPlayers.includes(player.id)
                                                        ? selectedPlayers.filter(id => id !== player.id)
                                                        : [ ...selectedPlayers, player.id ]
                                                    setSelectedPlayers(newSelected)
                                                }}
                                                selected={selectedPlayers.includes(player.id)}
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
                                                            border: selectedPlayers.includes(player.id) 
                                                                ? `2px solid ${green[500]}` 
                                                                : '2px solid transparent'
                                                        }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {player.charsheet?.name ?? 'Sem charsheet'}
                                                            </Typography>
                                                            {selectedPlayers.includes(player.id) && (
                                                                <Chip label="Selecionado" size="small" color="success" sx={{ fontWeight: 600 }} />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                            <Chip 
                                                                label={`Nível ${player.charsheet?.level ?? 'N/A'}`}
                                                                size="small"
                                                                sx={{ bgcolor: blue[100], color: blue[800], fontWeight: 600 }}
                                                            />
                                                            {selectedPlayers.includes(player.id) && (
                                                                <Chip 
                                                                    label={`→ Nível ${(player.charsheet?.level ?? 0) + levelsToAdd}`}
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
                        const isWeapon = (it: any): it is Weapon => it && 'hit' in it && 'effect' in it && 'ammo' in it
                        const isArmor = (it: any): it is Armor => it && 'displacementPenalty' in it && 'value' in it && 'categ' in it

                        const type: 'weapon' | 'armor' | 'item' = isWeapon(created) ? 'weapon' : isArmor(created) ? 'armor' : 'item'

                        await campaignService.addCustomItem(campaign.id, type, created)
                        
                        // Atualiza dados da campanha imediatamente
                        await queryClient.invalidateQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] })
                        await queryClient.refetchQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] })

                        setAddItemModalOpen(false)
                        enqueueSnackbar('Item customizado adicionado à campanha!', { variant: 'success' })
                    } catch (error) {
                        console.error('Erro ao adicionar item customizado:', error)
                        enqueueSnackbar('Não foi possível adicionar o item customizado.', { variant: 'error' })
                    }
                }}
            />

            {/* Dialog: Oferecer Vantagens */}
            <Dialog 
                open={offerPerksDialogOpen} 
                onClose={() => !isOfferingPerks && setOfferPerksDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CardGiftcardIcon sx={{ color: purple[500] }} /> Oferecer Vantagens
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        {/* Filtros de Vantagens */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                Configurar Filtros das Vantagens
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {/* Raridades */}
                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <InputLabel>Raridades</InputLabel>
                                    <Select
                                        multiple
                                        value={perkFilters.rarities}
                                        label="Raridades"
                                        onChange={(e) => setPerkFilters(prev => ({ ...prev, rarities: e.target.value as RarityType[] }))}
                                        input={<OutlinedInput label="Raridades" />}
                                        renderValue={(selected) => selected.length === 0 ? 'Todas' : `${selected.length} selecionada(s)`}
                                    >
                                        {rarityOptions.map(rarity => (
                                            <MenuItem key={rarity} value={rarity}>
                                                <Checkbox checked={perkFilters.rarities.includes(rarity)} size="small" />
                                                <ListItemText primary={rarity} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Tipo */}
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        value={perkFilters.type}
                                        label="Tipo"
                                        onChange={(e) => setPerkFilters(prev => ({ ...prev, type: e.target.value as PerkTypeEnum | '' }))}
                                    >
                                        <MenuItem value=""><em>Todos</em></MenuItem>
                                        {typeOptions.map(type => (
                                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Filtros específicos para Magia */}
                                {perkFilters.type === PerkTypeEnum.SPELL && (
                                    <>
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel>Elemento</InputLabel>
                                            <Select
                                                value={perkFilters.element}
                                                label="Elemento"
                                                onChange={(e) => setPerkFilters(prev => ({ ...prev, element: e.target.value }))}
                                            >
                                                <MenuItem value=""><em>Todos</em></MenuItem>
                                                {elementOptions.map(el => (
                                                    <MenuItem key={el} value={el}>{el}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                            <InputLabel>Nível</InputLabel>
                                            <Select
                                                value={perkFilters.spellLevel}
                                                label="Nível"
                                                onChange={(e) => setPerkFilters(prev => ({ ...prev, spellLevel: e.target.value }))}
                                            >
                                                <MenuItem value=""><em>Todos</em></MenuItem>
                                                {spellLevelOptions.map(lvl => (
                                                    <MenuItem key={lvl} value={lvl}>Nível {lvl}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <InputLabel>Execução</InputLabel>
                                            <Select
                                                value={perkFilters.execution}
                                                label="Execução"
                                                onChange={(e) => setPerkFilters(prev => ({ ...prev, execution: e.target.value }))}
                                            >
                                                <MenuItem value=""><em>Todas</em></MenuItem>
                                                {executionOptions.map(exec => (
                                                    <MenuItem key={exec} value={exec}>{exec}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}

                                {/* Filtros específicos para Item */}
                                {perkFilters.type === PerkTypeEnum.ITEM && (
                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>Tipo de Item</InputLabel>
                                        <Select
                                            multiple
                                            value={perkFilters.itemKinds}
                                            label="Tipo de Item"
                                            onChange={(e) => setPerkFilters(prev => ({ ...prev, itemKinds: e.target.value as string[] }))}
                                            input={<OutlinedInput label="Tipo de Item" />}
                                            renderValue={(selected) => selected.length === 0 ? 'Todos' : `${selected.length} tipo(s)`}
                                        >
                                            {itemKindOptions.map(kind => (
                                                <MenuItem key={kind} value={kind}>
                                                    <Checkbox checked={perkFilters.itemKinds.includes(kind)} size="small" />
                                                    <ListItemText primary={kind} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {/* Filtros específicos para Habilidade */}
                                {perkFilters.type === PerkTypeEnum.SKILL && (
                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <InputLabel>Tipo de Habilidade</InputLabel>
                                        <Select
                                            multiple
                                            value={perkFilters.skillTypes}
                                            label="Tipo de Habilidade"
                                            onChange={(e) => setPerkFilters(prev => ({ ...prev, skillTypes: e.target.value as SkillTypeEnum[] }))}
                                            input={<OutlinedInput label="Tipo de Habilidade" />}
                                            renderValue={(selected) => selected.length === 0 ? 'Todos' : `${selected.length} tipo(s)`}
                                        >
                                            {skillTypeOptions.map(skillType => (
                                                <MenuItem key={skillType.value} value={skillType.value}>
                                                    <Checkbox checked={perkFilters.skillTypes.includes(skillType.value)} size="small" />
                                                    <ListItemText primary={skillType.label} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Box>
                        </Box>

                        <Divider />

                        {/* Seleção de Jogadores */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Selecionar Jogadores ({selectedPlayersForPerks.length} selecionado{selectedPlayersForPerks.length !== 1 ? 's' : ''})
                            </Typography>
                            <Box sx={{ maxHeight: 280, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <List>
                                    {players?.map((player, index) => (
                                        <Box key={player.id}>
                                            <ListItem
                                                button
                                                onClick={() => {
                                                    if (isOfferingPerks) return
                                                    const newSelected = selectedPlayersForPerks.includes(player.id)
                                                        ? selectedPlayersForPerks.filter(id => id !== player.id)
                                                        : [ ...selectedPlayersForPerks, player.id ]
                                                    setSelectedPlayersForPerks(newSelected)
                                                }}
                                                selected={selectedPlayersForPerks.includes(player.id)}
                                                disabled={isOfferingPerks}
                                                sx={{
                                                    '&.Mui-selected': {
                                                        bgcolor: purple[100] + '60',
                                                        '&:hover': { bgcolor: purple[100] + '80' }
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar 
                                                        src={player.avatar}
                                                        sx={{
                                                            border: selectedPlayersForPerks.includes(player.id) 
                                                                ? `2px solid ${purple[500]}` 
                                                                : '2px solid transparent'
                                                        }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {player.charsheet?.name ?? 'Sem charsheet'}
                                                            </Typography>
                                                            {selectedPlayersForPerks.includes(player.id) && (
                                                                <Chip label="Selecionado" size="small" sx={{ bgcolor: purple[100], color: purple[800], fontWeight: 600 }} />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={player.name}
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
                    <Button onClick={() => setOfferPerksDialogOpen(false)} disabled={isOfferingPerks} variant="outlined">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleOfferPerks}
                        variant="contained"
                        disabled={selectedPlayersForPerks.length === 0 || isOfferingPerks}
                        startIcon={isOfferingPerks ? <CircularProgress size={20} /> : <CardGiftcardIcon />}
                        sx={{ bgcolor: purple[600], '&:hover': { bgcolor: purple[700] } }}
                    >
                        {isOfferingPerks ? 'Oferecendo...' : `Oferecer para ${selectedPlayersForPerks.length} Jogador${selectedPlayersForPerks.length !== 1 ? 'es' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Level Up Roguelite */}
            <Dialog 
                open={rogueliteLevelUpDialogOpen} 
                onClose={() => !isRogueliteLevelingUp && setRogueliteLevelUpDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoGraphIcon sx={{ color: green[500] }} /> Evolução Roguelite (+5 Níveis)
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {/* Informações sobre os bônus */}
                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: green[50], 
                                borderRadius: 2,
                                border: `1px solid ${green[200]}`
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ color: green[800], mb: 1, fontWeight: 700 }}>
                                🎮 Bônus de Evolução Roguelite
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Chip label="+5 Níveis" size="small" sx={{ bgcolor: green[100], color: green[800] }} />
                                <Chip label="+5 Atributos" size="small" sx={{ bgcolor: blue[100], color: blue[800] }} />
                                <Chip label="+1 Modificadores" size="small" sx={{ bgcolor: blue[50], color: blue[700] }} />
                                <Chip label="+1 Perícias" size="small" sx={{ bgcolor: purple[100], color: purple[800] }} />
                                <Chip label="+2 Espaços de Magia" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.dark' }} />
                                <Chip label="+2.0kg Capacidade" size="small" sx={{ bgcolor: 'warning.light', color: 'warning.dark' }} />
                                <Chip label="+¢250 Dinheiro" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark' }} />
                                <Chip label="+10 LP Máximo" size="small" sx={{ bgcolor: 'error.light', color: 'error.dark' }} />
                                <Chip label="+5 MP Máximo" size="small" sx={{ bgcolor: 'info.light', color: 'info.dark' }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: green[700], display: 'block', mt: 1 }}>
                                💡 LP e MP serão totalmente restaurados ao novo máximo
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Jogadores ({selectedPlayersForRoguelite.length} selecionado{selectedPlayersForRoguelite.length !== 1 ? 's' : ''})
                            </Typography>
                            <Box sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <List>
                                    {players?.map((player, index) => (
                                        <Box key={player.id}>
                                            <ListItem
                                                button
                                                onClick={() => {
                                                    if (isRogueliteLevelingUp) return
                                                    const newSelected = selectedPlayersForRoguelite.includes(player.id)
                                                        ? selectedPlayersForRoguelite.filter(id => id !== player.id)
                                                        : [ ...selectedPlayersForRoguelite, player.id ]
                                                    setSelectedPlayersForRoguelite(newSelected)
                                                }}
                                                selected={selectedPlayersForRoguelite.includes(player.id)}
                                                disabled={isRogueliteLevelingUp || !player.charsheet}
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
                                                            border: selectedPlayersForRoguelite.includes(player.id) 
                                                                ? `2px solid ${green[500]}` 
                                                                : '2px solid transparent'
                                                        }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {player.charsheet?.name ?? 'Sem charsheet'}
                                                            </Typography>
                                                            {selectedPlayersForRoguelite.includes(player.id) && (
                                                                <Chip label="Selecionado" size="small" color="success" sx={{ fontWeight: 600 }} />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                            <Chip 
                                                                label={`Nível ${player.charsheet?.level ?? 'N/A'}`}
                                                                size="small"
                                                                sx={{ bgcolor: blue[100], color: blue[800], fontWeight: 600 }}
                                                            />
                                                            {selectedPlayersForRoguelite.includes(player.id) && (
                                                                <Chip 
                                                                    label={`→ Nível ${(player.charsheet?.level ?? 0) + 5}`}
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
                    <Button onClick={() => setRogueliteLevelUpDialogOpen(false)} disabled={isRogueliteLevelingUp} variant="outlined">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleRogueliteLevelUp}
                        variant="contained"
                        disabled={selectedPlayersForRoguelite.length === 0 || isRogueliteLevelingUp}
                        startIcon={isRogueliteLevelingUp ? <CircularProgress size={20} /> : <AutoGraphIcon />}
                        sx={{ bgcolor: green[600], '&:hover': { bgcolor: green[700] } }}
                    >
                        {isRogueliteLevelingUp ? 'Evoluindo...' : `Evoluir ${selectedPlayersForRoguelite.length} Jogador${selectedPlayersForRoguelite.length !== 1 ? 'es' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Gerenciar Loja */}
            <Dialog 
                open={shopDialogOpen} 
                onClose={() => !isUpdatingShop && setShopDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorefrontIcon sx={{ color: orange[500] }} /> 
                    Gerenciar Loja
                    {campaign.shop?.isOpen && (
                        <Chip label="Aberta" size="small" sx={{ ml: 1, bgcolor: green[100], color: green[800] }} />
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        {/* Status da loja */}
                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: campaign.shop?.isOpen 
                                    ? 'rgba(76, 175, 80, 0.1)' 
                                    : 'rgba(158, 158, 158, 0.1)',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: campaign.shop?.isOpen ? green[500] : 'divider'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: campaign.shop?.isOpen ? green[400] : 'text.primary' }}>
                                {campaign.shop?.isOpen ? '🟢' : '🔴'} Status da Loja
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {campaign.shop?.isOpen 
                                    ? 'A loja está aberta. Os jogadores podem comprar itens.'
                                    : 'A loja está fechada. Configure e abra para os jogadores.'}
                            </Typography>
                        </Box>

                        {/* Quantidade de itens */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                                Quantidade de itens na loja: <strong>{shopConfig.itemCount}</strong>
                            </Typography>
                            <Slider
                                value={shopConfig.itemCount}
                                onChange={(_, value) => setShopConfig(prev => ({ ...prev, itemCount: value as number }))}
                                min={1}
                                max={10}
                                step={1}
                                marks
                                valueLabelDisplay="auto"
                                sx={{ 
                                    color: orange[500],
                                    '& .MuiSlider-markLabel': { color: 'text.secondary' }
                                }}
                            />
                        </Box>

                        {/* Multiplicador de preço */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                                Multiplicador de preço: <strong>{shopConfig.priceMultiplier}x</strong>
                            </Typography>
                            <Slider
                                value={shopConfig.priceMultiplier}
                                onChange={(_, value) => setShopConfig(prev => ({ ...prev, priceMultiplier: value as number }))}
                                min={0.5}
                                max={3.0}
                                step={0.1}
                                marks={[
                                    { value: 0.5, label: '0.5x' },
                                    { value: 1, label: '1x' },
                                    { value: 2, label: '2x' },
                                    { value: 3, label: '3x' }
                                ]}
                                valueLabelDisplay="auto"
                                sx={{ 
                                    color: orange[500],
                                    '& .MuiSlider-markLabel': { color: 'text.secondary' }
                                }}
                            />
                        </Box>

                        {/* Filtros de raridade */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                                Raridades permitidas (vazio = todas)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {rarityOptions.map(rarity => (
                                    <Chip
                                        key={rarity}
                                        label={rarity}
                                        size="small"
                                        onClick={() => {
                                            const newRarities = shopConfig.rarities.includes(rarity)
                                                ? shopConfig.rarities.filter(r => r !== rarity)
                                                : [ ...shopConfig.rarities, rarity ]
                                            setShopConfig(prev => ({ ...prev, rarities: newRarities }))
                                        }}
                                        sx={{
                                            bgcolor: shopConfig.rarities.includes(rarity) 
                                                ? 'rgba(255, 152, 0, 0.2)' 
                                                : 'rgba(158, 158, 158, 0.2)',
                                            color: shopConfig.rarities.includes(rarity) ? orange[300] : 'text.secondary',
                                            fontWeight: shopConfig.rarities.includes(rarity) ? 600 : 400,
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: shopConfig.rarities.includes(rarity) ? orange[500] : 'transparent',
                                            '&:hover': { 
                                                bgcolor: shopConfig.rarities.includes(rarity) 
                                                    ? 'rgba(255, 152, 0, 0.3)' 
                                                    : 'rgba(158, 158, 158, 0.3)'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Filtros de tipo */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                                Tipos permitidos (vazio = todos)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {typeOptions.map(type => (
                                    <Chip
                                        key={type.value}
                                        label={type.label}
                                        size="small"
                                        onClick={() => {
                                            const newTypes = shopConfig.types.includes(type.value)
                                                ? shopConfig.types.filter(t => t !== type.value)
                                                : [ ...shopConfig.types, type.value ]
                                            setShopConfig(prev => ({ ...prev, types: newTypes }))
                                        }}
                                        sx={{
                                            bgcolor: shopConfig.types.includes(type.value) 
                                                ? 'rgba(33, 150, 243, 0.2)' 
                                                : 'rgba(158, 158, 158, 0.2)',
                                            color: shopConfig.types.includes(type.value) ? blue[300] : 'text.secondary',
                                            fontWeight: shopConfig.types.includes(type.value) ? 600 : 400,
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: shopConfig.types.includes(type.value) ? blue[500] : 'transparent',
                                            '&:hover': { 
                                                bgcolor: shopConfig.types.includes(type.value) 
                                                    ? 'rgba(33, 150, 243, 0.3)' 
                                                    : 'rgba(158, 158, 158, 0.3)'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Filtros de tipo de item */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                                Tipos de Item permitidos (vazio = todos)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {itemKindOptions.map(kind => (
                                    <Chip
                                        key={kind}
                                        label={kind}
                                        size="small"
                                        onClick={() => {
                                            const newKinds = shopConfig.itemKinds.includes(kind)
                                                ? shopConfig.itemKinds.filter(k => k !== kind)
                                                : [ ...shopConfig.itemKinds, kind ]
                                            setShopConfig(prev => ({ ...prev, itemKinds: newKinds }))
                                        }}
                                        sx={{
                                            bgcolor: shopConfig.itemKinds.includes(kind) 
                                                ? 'rgba(156, 39, 176, 0.2)' 
                                                : 'rgba(158, 158, 158, 0.2)',
                                            color: shopConfig.itemKinds.includes(kind) ? purple[300] : 'text.secondary',
                                            fontWeight: shopConfig.itemKinds.includes(kind) ? 600 : 400,
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: shopConfig.itemKinds.includes(kind) ? purple[500] : 'transparent',
                                            '&:hover': { 
                                                bgcolor: shopConfig.itemKinds.includes(kind) 
                                                    ? 'rgba(156, 39, 176, 0.3)' 
                                                    : 'rgba(158, 158, 158, 0.3)'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setShopDialogOpen(false)} disabled={isUpdatingShop} variant="outlined">
                        Cancelar
                    </Button>
                    {campaign.shop?.isOpen ? (
                        <Button
                            onClick={async () => await handleToggleShop(false)}
                            variant="contained"
                            disabled={isUpdatingShop}
                            startIcon={isUpdatingShop ? <CircularProgress size={20} /> : <StorefrontIcon />}
                            sx={{ bgcolor: red[600], '&:hover': { bgcolor: red[700] } }}
                        >
                            {isUpdatingShop ? 'Fechando...' : 'Fechar Loja'}
                        </Button>
                    ) : (
                        <Button
                            onClick={async () => await handleToggleShop(true)}
                            variant="contained"
                            disabled={isUpdatingShop}
                            startIcon={isUpdatingShop ? <CircularProgress size={20} /> : <StorefrontIcon />}
                            sx={{ bgcolor: green[600], '&:hover': { bgcolor: green[700] } }}
                        >
                            {isUpdatingShop ? 'Abrindo...' : 'Abrir Loja'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    )
}
