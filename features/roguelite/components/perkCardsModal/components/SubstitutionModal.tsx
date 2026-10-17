'use client'

import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs,
    Typography,
    Chip,
    Stack,
    alpha,
    useTheme,
    CircularProgress
} from '@mui/material'
import { SwapHoriz, Star, Warning, CardGiftcard, Person } from '@mui/icons-material'
import ElementIcon from '@components/misc/ElementIcon'
import { useState, type ReactElement } from 'react'

export type SubstitutionType = 'spell' | 'weapon' | 'armor' | 'item'

export interface SubstitutableItem {
    id: string
    name: string
    description?: string
    rarity?: string
    level?: number | string
    element?: string
    // Campos adicionais para exibição
    [key: string]: any
}

export interface SessionPlayer {
    odac: string
    name: string
    odacId: string
    odacImage?: string
    charsheetId: string
    // Informações de limite do jogador
    weaponCount?: number
    armorCount?: number
    // Informações de peso
    currentCargo?: number
    maxCargo?: number
}

interface SubstitutionModalProps {
    open: boolean
    type: SubstitutionType
    newItem: SubstitutableItem
    existingItems: SubstitutableItem[]
    sessionPlayers?: SessionPlayer[]
    onSubstitute: (replacedItemId: string) => void
    onDonate?: (targetPlayerId: string, targetCharsheetId: string) => Promise<{ success: boolean; message: string }>
    onCancel: () => void
    /** Modo somente doação - esconde aba de substituição */
    donateOnly?: boolean
    /** Peso do item sendo doado (para validação) */
    itemWeight?: number
}

const typeLabels: Record<SubstitutionType, { singular: string; plural: string; icon: string }> = {
    spell: { singular: 'magia', plural: 'magias', icon: '📖' },
    weapon: { singular: 'arma', plural: 'armas', icon: '⚔️' },
    armor: { singular: 'armadura', plural: 'armaduras', icon: '🛡️' },
    item: { singular: 'item', plural: 'itens', icon: '📦' }
}

function getItemSecondaryText(item: SubstitutableItem, type: SubstitutionType): string {
    switch (type) {
    case 'spell':
        return `${item.element || 'Sem elemento'} • Nível ${item.level || 1}`
    case 'weapon':
        return item.categ || item.rarity || 'Arma'
    case 'armor':
        return item.categ || item.rarity || 'Armadura'
    case 'item':
        return item.kind || item.rarity || 'Item'
    default:
        return item.rarity || ''
    }
}

export function SubstitutionModal({
    open,
    type,
    newItem,
    existingItems,
    sessionPlayers = [],
    onSubstitute,
    onDonate,
    onCancel,
    donateOnly = false,
    itemWeight = 0
}: SubstitutionModalProps): ReactElement {
    const theme = useTheme()
    const [ selectedItemId, setSelectedItemId ] = useState<string | null>(null)
    const [ selectedPlayerId, setSelectedPlayerId ] = useState<string | null>(null)
    const [ selectedCharsheetId, setSelectedCharsheetId ] = useState<string | null>(null)
    const [ activeTab, setActiveTab ] = useState(donateOnly ? 1 : 0) // Se donateOnly, inicia na aba de doação
    const [ donating, setDonating ] = useState(false)
    const [ donationError, setDonationError ] = useState<string | null>(null)
    const labels = typeLabels[type]
    
    // Peso real do item (usa itemWeight passado ou tenta pegar do newItem)
    const actualItemWeight = itemWeight || newItem.weight || 0
    
    // Debug inicial
    console.log('[SubstitutionModal] Props iniciais:', {
        open,
        type,
        sessionPlayersCount: sessionPlayers.length,
        hasOnDonate: !!onDonate,
        existingItemsCount: existingItems.length
    })
    
    // Verifica se pode doar (armas, armaduras e itens)
    const canDonate = (type === 'weapon' || type === 'armor' || type === 'item') && !!onDonate
    
    // Debug
    console.log('[SubstitutionModal] Debug:', {
        type,
        canDonate,
        donateOnly,
        actualItemWeight,
        sessionPlayersLength: sessionPlayers.length,
        hasOnDonate: !!onDonate
    })

    const handleConfirmSubstitute = () => {
        if (selectedItemId) {
            onSubstitute(selectedItemId)
        }
    }

    const handleConfirmDonate = async () => {
        console.log('[SubstitutionModal] Confirmando doação:', {
            selectedPlayerId,
            selectedCharsheetId,
            hasOnDonate: !!onDonate,
            newItem
        })
        
        if (!selectedPlayerId || !selectedCharsheetId || !onDonate) {
            console.log('[SubstitutionModal] Dados insuficientes para doação')
            return
        }
        
        setDonating(true)
        setDonationError(null)
        
        try {
            console.log('[SubstitutionModal] Chamando onDonate...')
            const result = await onDonate(selectedPlayerId, selectedCharsheetId)
            console.log('[SubstitutionModal] Resultado da doação:', result)
            
            if (!result.success) {
                setDonationError(result.message)
            }
            // Se sucesso, o modal será fechado externamente
        } catch (error) {
            console.error('[SubstitutionModal] Erro na doação:', error)
            setDonationError('Erro ao realizar doação. Tente novamente.')
        } finally {
            setDonating(false)
        }
    }

    const handleSelectPlayer = (player: SessionPlayer) => {
        console.log('[SubstitutionModal] Selecionando jogador:', {
            playerId: player.odacId,
            charsheetId: player.charsheetId,
            playerName: player.name
        })
        setSelectedPlayerId(player.odacId)
        setSelectedCharsheetId(player.charsheetId)
        setDonationError(null)
    }

    // Verifica se o jogador está no limite e retorna o motivo
    const getPlayerLimitInfo = (player: SessionPlayer): { atLimit: boolean; reason: string; details: string } => {
        const currentCargo = player.currentCargo || 0
        const maxCargo = player.maxCargo || 0
        const newCargo = currentCargo + actualItemWeight
        const wouldExceedWeight = maxCargo > 0 && newCargo > maxCargo
        
        if (type === 'weapon') {
            const atWeaponLimit = (player.weaponCount || 0) >= 2
            if (atWeaponLimit && wouldExceedWeight) {
                return { atLimit: true, reason: 'Limite de armas e peso excedido', details: `2/2 armas • ${currentCargo.toFixed(1)}/${maxCargo}kg` }
            }
            if (atWeaponLimit) {
                return { atLimit: true, reason: 'Limite de armas atingido', details: '2/2 armas' }
            }
            if (wouldExceedWeight) {
                return { atLimit: true, reason: 'Peso excederia o limite', details: `${currentCargo.toFixed(1)}+${actualItemWeight}>${maxCargo}kg` }
            }
            return { atLimit: false, reason: '', details: `${player.weaponCount || 0}/2 armas • ${currentCargo.toFixed(1)}/${maxCargo}kg` }
        }
        
        if (type === 'armor') {
            const atArmorLimit = (player.armorCount || 0) >= 1
            if (atArmorLimit && wouldExceedWeight) {
                return { atLimit: true, reason: 'Limite de armaduras e peso excedido', details: `1/1 armadura • ${currentCargo.toFixed(1)}/${maxCargo}kg` }
            }
            if (atArmorLimit) {
                return { atLimit: true, reason: 'Limite de armaduras atingido', details: '1/1 armadura' }
            }
            if (wouldExceedWeight) {
                return { atLimit: true, reason: 'Peso excederia o limite', details: `${currentCargo.toFixed(1)}+${actualItemWeight}>${maxCargo}kg` }
            }
            return { atLimit: false, reason: '', details: `${player.armorCount || 0}/1 armadura • ${currentCargo.toFixed(1)}/${maxCargo}kg` }
        }
        
        // Para itens, só verifica peso
        if (type === 'item') {
            if (wouldExceedWeight) {
                return { atLimit: true, reason: 'Peso excederia o limite', details: `${currentCargo.toFixed(1)}+${actualItemWeight}>${maxCargo}kg` }
            }
            return { atLimit: false, reason: '', details: `${currentCargo.toFixed(1)}/${maxCargo}kg` }
        }
        
        return { atLimit: false, reason: '', details: '' }
    }
    
    // Wrapper para compatibilidade

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            sx={{
                zIndex: 10000 // Acima do modal de perks (9998)
            }}
            PaperProps={{
                sx: {
                    borderRadius: 3
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {donateOnly || activeTab === 1 ? <CardGiftcard color="info" /> : <SwapHoriz color="warning" />}
                    <Typography variant="h6" fontWeight={700}>
                        {donateOnly || activeTab === 1 ? `Doar ${labels.singular}` : `Substituir ${labels.singular}`}
                    </Typography>
                </Stack>
            </DialogTitle>

            {/* Abas - só aparece se pode doar E não está em modo donateOnly */}
            {canDonate && !donateOnly && (
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => {
                        setActiveTab(newValue)
                        setDonationError(null)
                    }}
                    sx={{ px: 2 }}
                >
                    <Tab icon={<SwapHoriz />} iconPosition="start" label="Substituir" />
                    <Tab icon={<CardGiftcard />} iconPosition="start" label="Doar" />
                </Tabs>
            )}

            <DialogContent>
                {/* === ABA DE SUBSTITUIÇÃO === */}
                {activeTab === 0 && (
                    <>
                        {/* Aviso */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.warning.main, 0.3)
                            }}
                        >
                            <Warning color="warning" sx={{ mt: 0.3 }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600} color="warning.main">
                                    Espaço insuficiente!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Você não possui espaço disponível para {labels.plural}. 
                                    Selecione uma {labels.singular} existente para substituir.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Nova item */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                {labels.icon} Nova {labels.singular}:
                            </Typography>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.success.main, 0.3)
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {newItem.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {getItemSecondaryText(newItem, type)}
                                        </Typography>
                                    </Box>
                                    {newItem.rarity && (
                                        <Chip 
                                            label={newItem.rarity} 
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Box>

                        {/* Lista de itens existentes */}
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Selecione a {labels.singular} a ser substituída:
                        </Typography>
                        <List
                            sx={{
                                maxHeight: 300,
                                overflow: 'auto',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2
                            }}
                        >
                            {existingItems.map((item) => (
                                <ListItemButton
                                    key={item.id}
                                    selected={selectedItemId === item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    sx={{
                                        borderRadius: 1,
                                        mx: 0.5,
                                        my: 0.25,
                                        '&.Mui-selected': {
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            borderColor: theme.palette.error.main,
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.error.main, 0.15)
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {type === 'spell'
                                            ? (
                                                <ElementIcon
                                                    element={item.element}
                                                    sx={{
                                                        color: selectedItemId === item.id
                                                            ? theme.palette.error.main
                                                            : 'text.secondary'
                                                    }}
                                                />
                                            )
                                            : (
                                                <Star
                                                    sx={{
                                                        color: selectedItemId === item.id
                                                            ? theme.palette.error.main
                                                            : 'text.secondary'
                                                    }}
                                                />
                                            )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={getItemSecondaryText(item, type)}
                                        primaryTypographyProps={{ fontWeight: 500 }}
                                    />
                                    {item.rarity && (
                                        <Chip 
                                            label={item.rarity} 
                                            size="small"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                )}

                {/* === ABA DE DOAÇÃO === */}
                {activeTab === 1 && (
                    <>
                        {/* Info sobre o item a ser doado */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                🎁 {labels.singular.charAt(0).toUpperCase() + labels.singular.slice(1)} a ser doada:
                            </Typography>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.info.main, 0.3)
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {newItem.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {getItemSecondaryText(newItem, type)}
                                        </Typography>
                                    </Box>
                                    {newItem.rarity && (
                                        <Chip 
                                            label={newItem.rarity} 
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Box>

                        {/* Lista de jogadores */}
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Selecione o jogador que receberá o item:
                        </Typography>
                        
                        {sessionPlayers.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="text.secondary">
                                    Nenhum jogador disponível na sessão.
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {console.log('[SubstitutionModal] Renderizando jogadores:', sessionPlayers.map(p => ({
                                    name: p.name,
                                    odacId: p.odacId,
                                    charsheetId: p.charsheetId,
                                    weaponCount: p.weaponCount,
                                    armorCount: p.armorCount
                                })))}
                                <List
                                    sx={{
                                        maxHeight: 300,
                                        overflow: 'auto',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2
                                    }}
                                >
                                    {sessionPlayers.map((player) => {
                                        const limitInfo = getPlayerLimitInfo(player)
                                        return (
                                            <ListItemButton
                                                key={player.odacId}
                                                selected={selectedPlayerId === player.odacId}
                                                onClick={() => !limitInfo.atLimit && handleSelectPlayer(player)}
                                                disabled={limitInfo.atLimit}
                                                sx={{
                                                    borderRadius: 1,
                                                    mx: 0.5,
                                                    my: 0.25,
                                                    opacity: limitInfo.atLimit ? 0.5 : 1,
                                                    '&.Mui-selected': {
                                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.info.main, 0.15)
                                                        }
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar 
                                                        src={player.odacImage} 
                                                        alt={player.name}
                                                        sx={{ width: 36, height: 36 }}
                                                    >
                                                        <Person />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={player.name}
                                                    secondary={
                                                        limitInfo.atLimit 
                                                            ? `⚠️ ${limitInfo.reason}`
                                                            : limitInfo.details
                                                    }
                                                    primaryTypographyProps={{ fontWeight: 500 }}
                                                    secondaryTypographyProps={{ 
                                                        color: limitInfo.atLimit ? 'warning.main' : 'text.secondary'
                                                    }}
                                                />
                                            </ListItemButton>
                                        )
                                    })}
                                </List>
                            </>
                        )}

                        {/* Erro de doação */}
                        {donationError && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.error.main, 0.3)
                                }}
                            >
                                <Typography variant="body2" color="error">
                                    {donationError}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button onClick={onCancel} color="inherit" disabled={donating}>
                    Cancelar
                </Button>
                
                {activeTab === 0 ? (
                    <Button
                        onClick={handleConfirmSubstitute}
                        variant="contained"
                        color="error"
                        disabled={!selectedItemId}
                        startIcon={<SwapHoriz />}
                    >
                        Substituir
                    </Button>
                ) : (
                    <Button
                        onClick={handleConfirmDonate}
                        variant="contained"
                        color="info"
                        disabled={!selectedPlayerId || donating}
                        startIcon={donating ? <CircularProgress size={20} /> : <CardGiftcard />}
                    >
                        {donating ? 'Doando...' : 'Doar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}
