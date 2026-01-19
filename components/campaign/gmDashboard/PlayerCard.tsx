import { AddItemModal, WarningModal } from '@layout'
import { Add, Backpack, Block, Bolt, ChatBubbleOutline, Favorite, Info, LocalPolice, MonetizationOn, MoreVert, Shield } from '@mui/icons-material'
import {
    Box,
    Button,
    DialogActions,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    Typography
} from '@mui/material'
import { red } from '@mui/material/colors'
import { campaignService, notificationService } from '@services'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { useCampaignContext } from '@contexts';
import { TextField } from '@mui/material'
import { CharsheetDetailsModal } from './modals'
import type { Armor, Item, Weapon } from '@models'
import type { CharsheetDTO } from '@models/dtos'
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace'
import { charsheetEntity } from '@utils/firestoreEntities'

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

export default function PlayerCard({ charsheet }: { charsheet: Required<CharsheetDTO> }) {
    const { campaign, charsheets } = useCampaignContext()
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
            // Verifica se é uma arma ou um item
            const isWeapon = 'hit' in item
            const isArmor = 'displacementPenalty' in item
            const currentWeapons = normalizeToArray(charsheet.inventory?.weapons)
            const currentArmors = normalizeToArray(charsheet.inventory?.armors)
            const currentItems = normalizeToArray(charsheet.inventory?.items)

            if (isWeapon) {
                await charsheetEntity.update(charsheet.id, {
                    'inventory.weapons': [ ...currentWeapons, item ]
                } as any)
            } else if (isArmor) {
                await charsheetEntity.update(charsheet.id, {
                    'inventory.armors': [ ...currentArmors, item ]
                } as any)
            } else {
                await charsheetEntity.update(charsheet.id, {
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
            <Grid item xs={12} md={6} key={charsheet.id}>
                <Paper
                    sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                    }}
                >
                    {/* Menu de Opções */}
                    <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={handlePlayerMenuClick}
                    >
                        <MoreVert />
                    </IconButton>

                    {/* Nome e Informações do Personagem */}
                    <Box textAlign="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {charsheet.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Nv. {charsheet.level} • {charsheet.class as string} • {charsheet.lineage as unknown as string}
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
                            <Favorite color="error" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {stats?.lp}/{stats?.maxLp}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Bolt color="info" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {stats?.mp}/{stats?.maxMp}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Shield color="success" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {stats?.ap}/{stats?.maxAp}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <MonetizationOn sx={{ fontSize: 16, color: 'gold' }} />
                            <Typography variant="body2">{spacedMoney(charsheet.inventory.money)}</Typography>
                        </Box>

                        <Box className="stat">
                            <LocalPolice sx={{ fontSize: 16, color: 'orange' }} />
                            <Typography variant="body2">
                                {charsheet.ammoCounter.current}/{charsheet.ammoCounter.max}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Backpack sx={{ fontSize: 16, color: 'gray' }} />
                            <Typography variant="body2">
                                {charsheet.capacity.cargo}/{charsheet.capacity.max} kg
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Typography variant="body2" sx={{ fontSize: 16, fontWeight: 'bold' }}>
                                🏃
                            </Typography>
                            <Typography variant="body2">
                                {charsheet.displacement || 0}m
                            </Typography>
                        </Box>

                    </Box>
                </Paper>
            </Grid>

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
                                <Block sx={{ color: red[500] }} />
                            </ListItemIcon>
                            <ListItemText sx={{ color: red[500] }}>Remover</ListItemText>
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
