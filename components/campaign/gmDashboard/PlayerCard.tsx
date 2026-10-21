import { AddItemModal, WarningModal } from '@layout'
import { Add, Backpack, Block, ChatBubbleOutline, DirectionsRun, Info, LocalPolice, MonetizationOn, MoreVert } from '@mui/icons-material'
import {
    Box,
    Button,
    Chip,
    DialogActions,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    Typography
} from '@mui/material'
import { campaignService, charsheetService, notificationService } from '@services'
import { enqueueSnackbar } from 'notistack'
import { memo, useState } from 'react'
import { useCampaignContext } from '@contexts';
import { TextField } from '@mui/material'
import { CharsheetDetailsModal } from './modals'
import type { Armor, Item, Weapon } from '@models'
import type { CharsheetDTO } from '@models/dtos'
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace'
import { charsheetEntity } from '@utils/firestoreEntities'
import { useCharsheetSystem } from '@hooks/useCharsheetSystem'
import { color, font } from '@themes/tokens'
import StatMeter from './StatMeter'

/** Texto só para leitor de tela (o rótulo do número ao lado, que a tela mostra por ícone) */
const srOnly = {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap'
} as const

function normalizeToArray<T>(value: any): T[] {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'object') {
        const keys = Object.keys(value)
        const isNumericKeys = keys.every(key => !isNaN(Number(key)))
        if (isNumericKeys) {
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => value[key])
        }

        const values = Object.values(value)
        const flattened = values.flatMap(v => {
            if (Array.isArray(v)) return v
            return [ v ]
        })

        return flattened.filter(v => v !== undefined && v !== null) as T[]
    }
    return []
}

// memo: com as referências de ficha estabilizadas por item (useStableArrayItems),
// só o card do jogador cuja ficha mudou re-renderiza.
function PlayerCard({ charsheet }: { charsheet: Required<CharsheetDTO> }) {
    const { campaign, charsheets } = useCampaignContext()
    const { system: customSystem } = useCharsheetSystem(charsheet.systemId)
    const weightUnit = customSystem ? (customSystem.weightConfig?.unit ?? '') : 'kg'

    // Sistemas customizados podem desligar LP, MP e AP (mesma regra do PlayerHeader)
    const hasLP = !customSystem || (customSystem.pointsConfig?.hasLP ?? customSystem.initialFields?.life?.enabled ?? true)
    const hasMP = !customSystem || (customSystem.pointsConfig?.hasMP ?? customSystem.initialFields?.mana?.enabled ?? true)
    const hasAP = !customSystem || (customSystem.pointsConfig?.hasAP ?? customSystem.initialFields?.armor?.enabled ?? true)
    const lpName = customSystem?.pointsConfig?.lpName || customSystem?.initialFields?.life?.label || 'Vida'
    const mpName = customSystem?.pointsConfig?.mpName || customSystem?.initialFields?.mana?.label || 'Mana'
    const apName = customSystem?.pointsConfig?.apName || customSystem?.initialFields?.armor?.label || 'Armadura'

    // Combate ativo, fase de ação: o cartão de quem joga agora ganha o destaque "Em turno"
    const combat = campaign.session?.combat
    const currentCombatant = combat?.isActive && combat.phase === 'ACTION'
        ? combat.combatants?.[combat.currentTurnIndex]
        : undefined
    const isMyTurn = Boolean(currentCombatant && (
        currentCombatant.id === charsheet.id
        || (currentCombatant.odacId && currentCombatant.odacId === charsheet.userId)
    ))
    const [ playerAnchorEl, setPlayerAnchorEl ] = useState<null | HTMLElement>(null)
    const [ addItemModalOpen, setAddItemModalOpen ] = useState(false)
    const [ removeUserDialogOpen, setRemoveUserDialogOpen ] = useState(false)
    const [ charsheetDetailsOpen, setCharsheetDetailsOpen ] = useState(false)

    const [ notificationDialogOpen, setNotificationDialogOpen ] = useState(false)
    const [ notificationTitle, setNotificationTitle ] = useState('')
    const [ notificationContent, setNotificationContent ] = useState('')

    const stats = charsheet.stats
    const spacedMoney = useNumbersWithSpaces()

    const handlePlayerMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setPlayerAnchorEl(event.currentTarget)
    }

    const handlePlayerMenuClose = () => {
        setPlayerAnchorEl(null)
    }

    const handleAddItem = async (item: Weapon | Item | Armor) => {
        try {
            // Busca a ficha mais recente do servidor em vez de usar a prop (que pode
            // estar desatualizada) — evita sobrescrever itens adicionados por outra
            // ação (ex: outro "adicionar item" ou depósito de widget) enquanto esta
            // tela estava aberta.
            const freshCharsheet = await charsheetEntity.findById(charsheet.id)
            const inventory = freshCharsheet?.inventory ?? charsheet.inventory

            // Verifica se é uma arma ou um item
            const isWeapon = 'hit' in item
            const isArmor = 'displacementPenalty' in item
            const currentWeapons = normalizeToArray(inventory?.weapons)
            const currentArmors = normalizeToArray(inventory?.armors)
            const currentItems = normalizeToArray(inventory?.items)

            if (isWeapon) {
                await charsheetService.updateFields(charsheet.id, {
                    'inventory.weapons': [ ...currentWeapons, item ]
                } as any)
            } else if (isArmor) {
                await charsheetService.updateFields(charsheet.id, {
                    'inventory.armors': [ ...currentArmors, item ]
                } as any)
            } else {
                await charsheetService.updateFields(charsheet.id, {
                    'inventory.items': [ ...currentItems, item ]
                } as any)
            }

            enqueueSnackbar(`Item ${item.name} adicionado com sucesso!`, { variant: 'success' })
        } catch (error) {
            console.error('Erro ao adicionar item:', error)
            enqueueSnackbar('Erro ao adicionar item!', { variant: 'error' })
        }
    }

    const handleSendNotification = async () => {
        try {
            await notificationService.create({
                title: notificationTitle,
                content: notificationContent,
                userId: charsheet.userId,
                timestamp: new Date().toISOString(),
                read: false,
                type: 'other'
            })

            enqueueSnackbar('Notificação enviada com sucesso!', { variant: 'success' })
        } catch (error: any) {
            enqueueSnackbar(`Erro ao enviar notificação: ${error.message}`, { variant: 'error' })
        }
        
        setNotificationDialogOpen(false)
    }

    const viewCharsheetDetails = () => {
        setCharsheetDetailsOpen(true);
        handlePlayerMenuClose();
    }

    const handleRemoveUser = async () => {
        try {
            if (!charsheet.id) return

            await campaignService.removeUser(campaign.id, charsheet.userId)

            enqueueSnackbar('Usuário removido com sucesso!', { variant: 'success' })
        } catch (error: any) {
            console.error('Erro ao remover usuário:', error)
            enqueueSnackbar(`Erro ao remover usuário: ${error.message}`, { variant: 'error' })
        }

        setRemoveUserDialogOpen(false)
    }

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    bgcolor: 'background.raised',
                    borderRadius: 2,
                    borderColor: isMyTurn ? 'primary.main' : 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {/* Nome, situação e menu de opções */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                {charsheet.name}
                            </Typography>
                            {isMyTurn && <Chip label="Em turno" size="small" color="primary" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Nv. {charsheet.level} • {charsheet.class as string} • {charsheet.lineage as unknown as string}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        aria-label={`Opções de ${charsheet.name}`}
                        aria-haspopup="menu"
                        onClick={handlePlayerMenuClick}
                        sx={{ mt: -0.5, mr: -0.5 }}
                    >
                        <MoreVert />
                    </IconButton>
                </Box>

                {/* Medidores de LP, MP e AP (os que o sistema da ficha usa) */}
                {(hasLP || hasMP || hasAP) && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {hasLP && (
                            <StatMeter
                                label={customSystem ? lpName : 'LP'}
                                ariaLabel={`${lpName} de ${charsheet.name}`}
                                value={stats?.lp ?? 0}
                                max={stats?.maxLp ?? 0}
                                barColor={color.lp}
                            />
                        )}
                        {hasMP && (
                            <StatMeter
                                label={customSystem ? mpName : 'MP'}
                                ariaLabel={`${mpName} de ${charsheet.name}`}
                                value={stats?.mp ?? 0}
                                max={stats?.maxMp ?? 0}
                                barColor={color.mp}
                            />
                        )}
                        {hasAP && (
                            <StatMeter
                                label={customSystem ? apName : 'AP'}
                                ariaLabel={`${apName} de ${charsheet.name}`}
                                value={stats?.ap ?? 0}
                                max={stats?.maxAp ?? 0}
                                barColor={color.ap}
                            />
                        )}
                    </Box>
                )}

                {/* Dinheiro, munição, carga e deslocamento */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        columnGap: 2,
                        rowGap: 0.5,
                        mt: 'auto',
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        '& .stat': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'text.secondary'
                        },
                        '& .stat svg': { fontSize: 16 },
                        '& .stat .value': { fontSize: 13, fontFamily: font.mono, color: 'text.primary' }
                    }}
                >
                    <Box className="stat">
                        <MonetizationOn aria-hidden />
                        <Box component="span" sx={srOnly}>Dinheiro:</Box>
                        <Typography component="span" className="value">{spacedMoney(charsheet.inventory.money)}</Typography>
                    </Box>

                    {(charsheet.ammoCounter.max > 0 || charsheet.ammoCounter.current > 0) && (
                        <Box className="stat">
                            <LocalPolice aria-hidden />
                            <Box component="span" sx={srOnly}>Munição:</Box>
                            <Typography component="span" className="value">
                                {charsheet.ammoCounter.current}/{charsheet.ammoCounter.max}
                            </Typography>
                        </Box>
                    )}

                    <Box className="stat">
                        <Backpack aria-hidden />
                        <Box component="span" sx={srOnly}>Carga:</Box>
                        <Typography component="span" className="value">
                            {charsheet.capacity.cargo}/{charsheet.capacity.max}{weightUnit ? ` ${weightUnit}` : ''}
                        </Typography>
                    </Box>

                    <Box className="stat">
                        <DirectionsRun aria-hidden />
                        <Box component="span" sx={srOnly}>Deslocamento:</Box>
                        <Typography component="span" className="value">{charsheet.displacement || 0}m</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Menu de Opções do Jogador */}
            <Menu anchorEl={playerAnchorEl} open={Boolean(playerAnchorEl)} onClose={handlePlayerMenuClose}>
                <Box sx={{ width: 320, maxWidth: '100%' }}>
                    <MenuList>
                        <MenuItem onClick={viewCharsheetDetails}>
                            <ListItemIcon>
                                <Info />
                            </ListItemIcon>
                            <ListItemText>Ver detalhes</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => setAddItemModalOpen(true)}>
                            <ListItemIcon>
                                <Add fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Adicionar item</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => setNotificationDialogOpen(true)}>
                            <ListItemIcon>
                                <ChatBubbleOutline fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Enviar Notificação</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => setRemoveUserDialogOpen(true)}>
                            <ListItemIcon>
                                <Block sx={{ color: 'error.main' }} />
                            </ListItemIcon>
                            <ListItemText sx={{ color: 'error.light' }}>Remover</ListItemText>
                        </MenuItem>
                    </MenuList>
                </Box>
            </Menu>

            {/* Modal de Adicionar Item */}
            <AddItemModal
                subtitle={`Adicionar item para ${charsheet.name} (${charsheet.id})`}
                modalOpen={addItemModalOpen}
                setModalOpen={setAddItemModalOpen}
                disableDefaultCreate={true}
                onConfirm={handleAddItem}
            />

            {/* Modal de Notificação */}
            <Dialog open={notificationDialogOpen} onClose={() => setNotificationDialogOpen(false)}>
                <DialogTitle>Enviar Notificação</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="notification-title"
                        label="Título"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="notification-content"
                        label="Conteúdo"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={notificationContent}
                        onChange={(e) => setNotificationContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotificationDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSendNotification}>Enviar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de aviso */}
            <WarningModal
                text={`Você tem certeza que deseja banir usuário ${charsheets.find(
                    userCharsheet => userCharsheet.id === charsheet.id
                )?.name} da campanha?`}
                open={removeUserDialogOpen}
                onClose={() => setRemoveUserDialogOpen(false)}
                onConfirm={handleRemoveUser}
            />

            {/* Modal de Detalhes da Charsheet */}
            <CharsheetDetailsModal
                open={charsheetDetailsOpen}
                onClose={() => setCharsheetDetailsOpen(false)}
                charsheet={charsheet}
            />
        </>
    )
}

export default memo(PlayerCard)
