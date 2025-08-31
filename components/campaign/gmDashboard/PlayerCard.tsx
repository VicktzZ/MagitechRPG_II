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
import { campaignService, fichaService, notificationService } from '@services'
import type { Armor, Ficha, Item, Weapon } from '@types'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { useCampaignContext } from '@contexts';
import { TextField } from '@mui/material'
import { FichaDetailsModal } from './modals'

export default function PlayerCard({ ficha }: { ficha: Required<Ficha> }) {
    const { campaign, fichas } = useCampaignContext()
    const [ playerAnchorEl, setPlayerAnchorEl ] = useState<null | HTMLElement>(null)
    const [ addItemModalOpen, setAddItemModalOpen ] = useState(false)
    const [ removeUserDialogOpen, setRemoveUserDialogOpen ] = useState(false)
    const [ fichaDetailsOpen, setFichaDetailsOpen ] = useState(false)

    const [ notificationDialogOpen, setNotificationDialogOpen ] = useState(false)
    const [ notificationTitle, setNotificationTitle ] = useState('')
    const [ notificationContent, setNotificationContent ] = useState('')

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
            const updatedInventory = isWeapon
                ? {
                    ...ficha.inventory,
                    weapons: [ ...ficha.inventory.weapons, item ]
                }
                : isArmor
                    ? {
                        ...ficha.inventory,
                        armors: [ ...ficha.inventory.armors, item ]
                    }
                    : {
                        ...ficha.inventory,
                        items: [ ...ficha.inventory.items, item ]
                    }

            const updatedFicha = await fichaService.updateById({
                id: ficha._id,
                data: {
                    ...ficha,
                    inventory: updatedInventory
                }
            })

            if (updatedFicha) {
                enqueueSnackbar(`Item ${item.name} adicionado com sucesso!`, { variant: 'success' })
            }
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
                userId: ficha.userId,
                timestamp: new Date(),
                read: false,
                type: 'other'
            })

            enqueueSnackbar('Notificação enviada com sucesso!', { variant: 'success' })
        } catch (error: any) {
            enqueueSnackbar(`Erro ao enviar notificação: ${error.message}`, { variant: 'error' })
        }
        
        setNotificationDialogOpen(false)
    }

    const viewFichaDetails = () => {
        setFichaDetailsOpen(true);
        handlePlayerMenuClose();
    }

    const handleRemoveUser = async () => {
        try {
            if (!ficha._id) return

            await campaignService.removeUser(campaign._id!, ficha.userId)

            enqueueSnackbar('Usuário removido com sucesso!', { variant: 'success' })
        } catch (error: any) {
            console.error('Erro ao remover usuário:', error)
            enqueueSnackbar(`Erro ao remover usuário: ${error.message}`, { variant: 'error' })
        }

        setRemoveUserDialogOpen(false)
    }

    return (
        <>
            <Grid item xs={12} md={6} key={ficha._id}>
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
                            <Favorite color="error" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {ficha.attributes.lp}/{ficha.attributes.maxLp}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Bolt color="info" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {ficha.attributes.mp}/{ficha.attributes.maxMp}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Shield color="success" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {ficha.attributes.ap}/{ficha.attributes.maxAp}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <MonetizationOn sx={{ fontSize: 16, color: 'gold' }} />
                            <Typography variant="body2">{ficha.inventory.money}</Typography>
                        </Box>

                        <Box className="stat">
                            <LocalPolice sx={{ fontSize: 16, color: 'orange' }} />
                            <Typography variant="body2">
                                {ficha.ammoCounter.current}/{ficha.ammoCounter.max}
                            </Typography>
                        </Box>

                        <Box className="stat">
                            <Backpack sx={{ fontSize: 16, color: 'gray' }} />
                            <Typography variant="body2">
                                {ficha.capacity.cargo}/{ficha.capacity.max} kg
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Menu de Opções do Jogador */}
            <Menu anchorEl={playerAnchorEl} open={Boolean(playerAnchorEl)} onClose={handlePlayerMenuClose}>
                <Box sx={{ width: 320, maxWidth: '100%' }}>
                    <MenuList>
                        <MenuItem onClick={viewFichaDetails}>
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
                text={`Você tem certeza que deseja banir usuário ${fichas.find(
                    userFicha => userFicha._id === ficha._id
                )?.name} da campanha?`}
                open={removeUserDialogOpen}
                onClose={() => setRemoveUserDialogOpen(false)}
                onConfirm={handleRemoveUser}
            />

            {/* Modal de Detalhes da Ficha */}
            <FichaDetailsModal 
                open={fichaDetailsOpen}
                onClose={() => setFichaDetailsOpen(false)}
                ficha={ficha}
            />
        </>
    )
}
