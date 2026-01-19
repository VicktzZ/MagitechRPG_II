'use client';

import { useCampaignContext } from '@contexts';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import AddItemModal from '@layout/AddItemModal';
import type { Armor, Item, Weapon } from '@models';

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PetsIcon from '@mui/icons-material/Pets';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';

import {
    Box,
    Button,
    Chip,
    Divider,
    ListItemIcon,
    Menu,
    MenuItem,
    ListItemText as MenuItemText,
    Typography
} from '@mui/material';
import { green, orange, red, blue } from '@mui/material/colors';
import { campaignService } from '@services';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useMemo, useState, type ReactElement } from 'react';

// Componentes modulares
import {
    AddNoteDialog,
    LevelUpDialog,
    RogueliteLevelUpDialog,
    OfferPerksDialog,
    ShopDialog,
    MassActionDialog,
    CombatDialog,
    type PlayerInfo,
    type MassActionType
} from './actions';
import CreatureCreator from './CreatureCreator';

export default function GMActions(): ReactElement {
    const { campaign, isUserGM, users, charsheets } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    // Menu state
    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    // Dialog states
    const [ addNoteDialogOpen, setAddNoteDialogOpen ] = useState(false);
    const [ levelUpDialogOpen, setLevelUpDialogOpen ] = useState(false);
    const [ rogueliteLevelUpDialogOpen, setRogueliteLevelUpDialogOpen ] = useState(false);
    const [ addItemModalOpen, setAddItemModalOpen ] = useState(false);
    const [ creatureDialogOpen, setCreatureDialogOpen ] = useState(false);
    const [ offerPerksDialogOpen, setOfferPerksDialogOpen ] = useState(false);
    const [ shopDialogOpen, setShopDialogOpen ] = useState(false);
    const [ massActionDialogOpen, setMassActionDialogOpen ] = useState(false);
    const [ massActionType, setMassActionType ] = useState<MassActionType | null>(null);
    const [ combatDialogOpen, setCombatDialogOpen ] = useState(false);

    // Realtime charsheet data
    const { data: realtimeCharsheets } = useFirestoreRealtime('charsheet', {
        filters: [ { field: 'id', operator: 'in', value: charsheets.map(c => c.id) } ],
        enabled: charsheets.length > 0
    });

    // Memoized player list with charsheet data
    const players: PlayerInfo[] = useMemo(() => {
        return users.players?.map(player => {
            // campaign.players usa `userId`, não `odacId`
            const playerInCampaign = campaign?.players?.find(p => 
                (p as any).odacId === player.id || p.userId === player.id
            );
            const charsheet = realtimeCharsheets?.find((c: any) => c.id === playerInCampaign?.charsheetId);

            return {
                id: player.id,
                name: player.name || 'Jogador',
                avatar: player.image,
                charsheet: charsheet ? {
                    id: charsheet.id,
                    name: charsheet.name,
                    level: charsheet.level,
                    stats: charsheet.stats,
                    inventory: charsheet.inventory,
                    attributes: charsheet.attributes
                } : undefined
            };
        }) || [];
    }, [ users.players, campaign?.players, realtimeCharsheets ]);

    // Menu handlers
    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // Action handlers
    const openAddNote = () => {
        setAddNoteDialogOpen(true);
        handleCloseMenu();
    };

    const openLevelUp = () => {
        setLevelUpDialogOpen(true);
        handleCloseMenu();
    };

    const openRogueliteLevelUp = () => {
        setRogueliteLevelUpDialogOpen(true);
        handleCloseMenu();
    };

    const openAddItem = () => {
        setAddItemModalOpen(true);
        handleCloseMenu();
    };

    const openCreatureCreator = () => {
        setCreatureDialogOpen(true);
        handleCloseMenu();
    };

    const openOfferPerks = () => {
        setOfferPerksDialogOpen(true);
        handleCloseMenu();
    };

    const openShop = () => {
        setShopDialogOpen(true);
        handleCloseMenu();
    };

    const openMassAction = (type: MassActionType) => {
        setMassActionType(type);
        setMassActionDialogOpen(true);
        handleCloseMenu();
    };

    const openCombat = () => {
        setCombatDialogOpen(true);
        handleCloseMenu();
    };

    // Custom item handler
    const handleAddCustomItem = async (created: Weapon | Armor | Item) => {
        try {
            const isWeapon = (it: any): it is Weapon => it && 'hit' in it && 'effect' in it && 'ammo' in it;
            const isArmor = (it: any): it is Armor => it && 'displacementPenalty' in it && 'value' in it && 'categ' in it;

            const type: 'weapon' | 'armor' | 'item' = isWeapon(created) ? 'weapon' : isArmor(created) ? 'armor' : 'item';

            await campaignService.addCustomItem(campaign.id, type, created);
            
            await queryClient.invalidateQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] });
            await queryClient.refetchQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] });

            setAddItemModalOpen(false);
            enqueueSnackbar('Item customizado adicionado à campanha!', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao adicionar item customizado:', error);
            enqueueSnackbar('Não foi possível adicionar o item customizado.', { variant: 'error' });
        }
    };

    if (!isUserGM) return <></>;

    return (
        <Box>
            {/* Botão do Menu */}
            <Button
                variant="outlined"
                onClick={handleOpenMenu}
                sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.main',
                        color: 'white'
                    }
                }}
            >
                AÇÕES DO GAME MASTER
            </Button>

            {/* Menu de Ações */}
            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: { minWidth: 280, mt: 1 }
                    }
                }}
            >
                {/* Ações Básicas */}
                <MenuItem onClick={openAddNote} disabled={!isUserGM}>
                    <ListItemIcon>
                        <NoteAddIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Adicionar nota da campanha</MenuItemText>
                </MenuItem>

                <MenuItem onClick={openLevelUp} disabled={!isUserGM}>
                    <ListItemIcon>
                        <TrendingUpIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Aumentar Nível de Jogadores</MenuItemText>
                </MenuItem>

                {campaign.mode === 'Roguelite' && (
                    <MenuItem onClick={openRogueliteLevelUp} disabled={!isUserGM}>
                        <ListItemIcon>
                            <AutoGraphIcon fontSize="small" sx={{ color: green[500] }} />
                        </ListItemIcon>
                        <MenuItemText>
                            Evolução Roguelite (+5)
                            <Chip 
                                label="Roguelite" 
                                size="small" 
                                sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: green[100], color: green[800] }}
                            />
                        </MenuItemText>
                    </MenuItem>
                )}

                <Divider />

                {/* Itens e Criaturas */}
                <MenuItem onClick={openAddItem} disabled={!isUserGM}>
                    <ListItemIcon>
                        <AddCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Adicionar Item customizado</MenuItemText>
                </MenuItem>

                <MenuItem onClick={openCreatureCreator} disabled={!isUserGM}>
                    <ListItemIcon>
                        <PetsIcon fontSize="small" sx={{ color: orange[600] }} />
                    </ListItemIcon>
                    <MenuItemText>Adicionar Criatura</MenuItemText>
                </MenuItem>

                <Divider />

                {/* Vantagens e Loja */}
                <MenuItem onClick={openOfferPerks} disabled={!isUserGM}>
                    <ListItemIcon>
                        <CardGiftcardIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Oferecer Vantagens</MenuItemText>
                </MenuItem>

                <MenuItem onClick={openShop} disabled={!isUserGM}>
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

                <Divider />

                {/* Combate */}
                <MenuItem onClick={openCombat} disabled={!isUserGM}>
                    <ListItemIcon>
                        <SportsKabaddiIcon fontSize="small" sx={{ color: red[500] }} />
                    </ListItemIcon>
                    <MenuItemText>
                        {campaign.session?.combat?.isActive ? 'Gerenciar Combate' : 'Iniciar Combate'}
                        {campaign.session?.combat?.isActive && (
                            <Chip 
                                label={`R${campaign.session.combat.round}`}
                                size="small" 
                                sx={{ ml: 1, height: 20, bgcolor: red[100], color: red[800] }}
                            />
                        )}
                    </MenuItemText>
                </MenuItem>

                <Divider />

                {/* Ações em Massa */}
                <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'text.secondary' }}>
                    Ações em Massa
                </Typography>

                <MenuItem onClick={() => openMassAction('restoreLP')} disabled={!isUserGM}>
                    <ListItemIcon>
                        <FavoriteIcon fontSize="small" sx={{ color: red[500] }} />
                    </ListItemIcon>
                    <MenuItemText>Restaurar LP</MenuItemText>
                </MenuItem>

                <MenuItem onClick={() => openMassAction('restoreMP')} disabled={!isUserGM}>
                    <ListItemIcon>
                        <BoltIcon fontSize="small" sx={{ color: blue[500] }} />
                    </ListItemIcon>
                    <MenuItemText>Restaurar MP</MenuItemText>
                </MenuItem>

                <MenuItem onClick={() => openMassAction('addMoney')} disabled={!isUserGM}>
                    <ListItemIcon>
                        <AttachMoneyIcon fontSize="small" sx={{ color: green[500] }} />
                    </ListItemIcon>
                    <MenuItemText>Adicionar Dinheiro</MenuItemText>
                </MenuItem>
            </Menu>

            {/* Dialogs */}
            <AddNoteDialog
                open={addNoteDialogOpen}
                onClose={() => setAddNoteDialogOpen(false)}
                campaignId={campaign.id}
            />

            <LevelUpDialog
                open={levelUpDialogOpen}
                onClose={() => setLevelUpDialogOpen(false)}
                players={players}
            />

            <RogueliteLevelUpDialog
                open={rogueliteLevelUpDialogOpen}
                onClose={() => setRogueliteLevelUpDialogOpen(false)}
                players={players}
                campaignId={campaign.id}
            />

            <AddItemModal
                modalOpen={addItemModalOpen}
                setModalOpen={setAddItemModalOpen}
                disableDefaultCreate
                title="Adicionar Item Customizado"
                onConfirm={handleAddCustomItem}
            />

            <CreatureCreator
                open={creatureDialogOpen}
                onClose={() => setCreatureDialogOpen(false)}
            />

            <OfferPerksDialog
                open={offerPerksDialogOpen}
                onClose={() => setOfferPerksDialogOpen(false)}
                players={players}
                campaignId={campaign.id}
            />

            <ShopDialog
                open={shopDialogOpen}
                onClose={() => setShopDialogOpen(false)}
                players={players}
                campaignId={campaign.id}
                existingShop={campaign.shop}
            />

            <MassActionDialog
                open={massActionDialogOpen}
                onClose={() => setMassActionDialogOpen(false)}
                actionType={massActionType}
                players={players}
                campaignId={campaign.id}
            />

            <CombatDialog
                open={combatDialogOpen}
                onClose={() => setCombatDialogOpen(false)}
                campaignId={campaign.id}
                campaignCode={campaign.campaignCode}
                players={players}
                creatures={campaign.custom?.creatures || []}
                charsheets={realtimeCharsheets || []}
                existingCombat={campaign.session?.combat}
            />
        </Box>
    );
}
