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
import FlagIcon from '@mui/icons-material/Flag';
import ReplayIcon from '@mui/icons-material/Replay';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {
    Box,
    Button,
    Chip,
    Divider,
    ListItemIcon,
    ListSubheader,
    Menu,
    MenuItem,
    ListItemText as MenuItemText,
    Stack,
    Tooltip,
    alpha
} from '@mui/material';
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
    CombatEffectsCatalogDialog,
    FinishCampaignDialog,
    type PlayerInfo,
    type MassActionType
} from './actions';
import CreatureCreator from './CreatureCreator';
import CampaignStatsModal from '../CampaignStatsModal';
import WidgetManagerDialog from '../widget/WidgetManagerDialog';
import { errorMessage } from '@utils/errors';
import { campaignRevealsSpellStages } from '@utils/spellReveal';

/** Botões da barra de ações: altura mínima de 40px (alvo de toque confortável) */
const barButtonSx = { minHeight: 40 } as const;

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
    const [ effectsCatalogOpen, setEffectsCatalogOpen ] = useState(false);
    const [ finishDialogOpen, setFinishDialogOpen ] = useState(false);
    const [ statsModalOpen, setStatsModalOpen ] = useState(false);
    const [ widgetManagerOpen, setWidgetManagerOpen ] = useState(false);
    const [ isReopening, setIsReopening ] = useState(false);
    const [ isTogglingReveal, setIsTogglingReveal ] = useState(false);

    const isFinished = campaign.status === 'finished';

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
                (p as { odacId?: string }).odacId === player.id || p.userId === player.id
            );
            const charsheet = realtimeCharsheets?.find(c => c.id === playerInCampaign?.charsheetId);
            // Vantagens adquiridas nesta campanha (sessão correspondente ao campaignCode)
            const campaignPerks = charsheet?.session?.find(
                s => s.campaignCode === campaign.campaignCode
            )?.perks ?? [];

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
                    attributes: charsheet.attributes,
                    perks: campaignPerks
                } : undefined
            };
        }) || [];
    }, [ users.players, campaign?.players, campaign.campaignCode, realtimeCharsheets ]);

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

    const openWidgetManager = () => {
        setWidgetManagerOpen(true);
        handleCloseMenu();
    };

    const openEffectsCatalog = () => {
        setEffectsCatalogOpen(true);
        handleCloseMenu();
    };

    const openFinishDialog = () => {
        setFinishDialogOpen(true);
        handleCloseMenu();
    };

    const openStatsModal = () => {
        setStatsModalOpen(true);
        handleCloseMenu();
    };

    const handleReopenCampaign = async () => {
        handleCloseMenu();
        setIsReopening(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/finish`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao reabrir campanha');
            }
            enqueueSnackbar('Campanha reaberta!', { variant: 'success' });
            await queryClient.invalidateQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] });
        } catch (error) {
            console.error('Erro ao reabrir campanha:', error);
            enqueueSnackbar(errorMessage(error, 'Erro ao reabrir campanha'), { variant: 'error' });
        } finally {
            setIsReopening(false);
        }
    };

    // Revelar os estágios de todas as magias aos jogadores (só visualização; ver utils/spellReveal.ts). Grava só este campo da campanha
    const revealStages = campaignRevealsSpellStages(campaign) || campaign.revealSpellStages === true;
    const handleToggleRevealStages = async () => {
        setIsTogglingReveal(true);
        try {
            await campaignService.updateFields(campaign.id, { revealSpellStages: !revealStages });
            await queryClient.invalidateQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] });
            enqueueSnackbar(revealStages ? 'Os estágios das magias voltaram a seguir o desbloqueio de cada jogador.' : 'Os jogadores agora veem todos os estágios das magias.', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao alterar a revelação dos estágios:', error);
            enqueueSnackbar(errorMessage(error, 'Não foi possível alterar a revelação dos estágios.'), { variant: 'error' });
        } finally {
            setIsTogglingReveal(false);
        }
    };
    // A regra de estágios só existe no Magitech padrão: no Roguelite e em sistema customizado os estágios já ficam todos abertos
    const showRevealStages = campaign.mode !== 'Roguelite' && !campaign.systemId;

    // Custom item handler
    const handleAddCustomItem = async (created: Weapon | Armor | Item) => {
        try {
            const isWeapon = (it: object): it is Weapon => it && 'hit' in it && 'effect' in it && 'ammo' in it;
            const isArmor = (it: object): it is Armor => it && 'displacementPenalty' in it && 'value' in it && 'categ' in it;

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

    const isCombatActive = Boolean(campaign.session?.combat?.isActive);
    const widgetsCount = campaign.widgets?.length ?? 0;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Barra de ações rápidas: o que o mestre usa a toda hora fica a um clique */}
            <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                gap={1}
                role="group"
                aria-label="Ações do mestre"
            >
                <Button
                    variant="contained"
                    startIcon={<SportsKabaddiIcon />}
                    onClick={openCombat}
                    sx={barButtonSx}
                >
                    {isCombatActive ? `Combate · R${campaign.session?.combat?.round}` : 'Iniciar combate'}
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<StorefrontIcon />}
                    onClick={openShop}
                    sx={barButtonSx}
                >
                    Loja
                    {campaign.shop?.isOpen && (
                        <Chip
                            label="Aberta"
                            size="small"
                            sx={{
                                ml: 1,
                                height: 20,
                                bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
                                color: 'success.main'
                            }}
                        />
                    )}
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CardGiftcardIcon />}
                    onClick={openOfferPerks}
                    sx={barButtonSx}
                >
                    Vantagens
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<NoteAddIcon />}
                    onClick={openAddNote}
                    sx={barButtonSx}
                >
                    Nova nota
                </Button>

                {showRevealStages && (
                    <Tooltip
                        title="Mostra aos jogadores o texto e o custo de MP de todos os estágios de todas as magias, mesmo os que eles ainda não desbloquearam, na campanha e na ficha. É só leitura: para conjurar um estágio, o jogador ainda precisa evoluir a magia."
                        arrow
                    >
                        <span>
                            <Button
                                variant={revealStages ? 'contained' : 'outlined'}
                                color={revealStages ? 'primary' : 'secondary'}
                                startIcon={<VisibilityIcon />}
                                onClick={() => { void handleToggleRevealStages() }}
                                disabled={isTogglingReveal || isFinished}
                                aria-pressed={revealStages}
                                sx={barButtonSx}
                            >
                                {revealStages ? 'Estágios revelados' : 'Revelar estágios'}
                            </Button>
                        </span>
                    </Tooltip>
                )}

                <Button
                    id="gm-more-actions-button"
                    variant="outlined"
                    color="secondary"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={handleOpenMenu}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-controls={menuOpen ? 'gm-more-actions-menu' : undefined}
                    sx={barButtonSx}
                >
                    Mais ações
                </Button>
            </Stack>

            {/* Mais ações: o restante, com "Finalizar campanha" separado do resto */}
            <Menu
                id="gm-more-actions-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                MenuListProps={{ 'aria-labelledby': 'gm-more-actions-button' }}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 280,
                            mt: 1,
                            '& .MuiListItemIcon-root': { color: 'text.secondary' }
                        }
                    }
                }}
            >
                <MenuItem onClick={openLevelUp}>
                    <ListItemIcon>
                        <TrendingUpIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Aumentar nível de jogadores</MenuItemText>
                </MenuItem>

                {campaign.mode === 'Roguelite' && (
                    <MenuItem onClick={openRogueliteLevelUp}>
                        <ListItemIcon>
                            <AutoGraphIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText>Evolução Roguelite (+5)</MenuItemText>
                    </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={openAddItem}>
                    <ListItemIcon>
                        <AddCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Adicionar item customizado</MenuItemText>
                </MenuItem>

                <MenuItem onClick={openCreatureCreator}>
                    <ListItemIcon>
                        <PetsIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Adicionar criatura</MenuItemText>
                </MenuItem>

                <MenuItem onClick={openWidgetManager}>
                    <ListItemIcon>
                        <WidgetsIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>
                        {widgetsCount > 0 ? 'Administrar widgets' : 'Criar widget da campanha'}
                        {widgetsCount > 0 && (
                            <Chip
                                label={widgetsCount}
                                size="small"
                                sx={{ ml: 1, height: 18, fontSize: 12 }}
                            />
                        )}
                    </MenuItemText>
                </MenuItem>

                <MenuItem onClick={openEffectsCatalog}>
                    <ListItemIcon>
                        <BoltIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Efeitos de combate</MenuItemText>
                </MenuItem>

                <Divider />

                <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '32px', fontSize: 12 }}>
                    Ações em massa
                </ListSubheader>

                <MenuItem onClick={() => openMassAction('restoreLP')}>
                    <ListItemIcon>
                        <FavoriteIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Restaurar LP</MenuItemText>
                </MenuItem>

                <MenuItem onClick={() => openMassAction('restoreMP')}>
                    <ListItemIcon>
                        <BoltIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Restaurar MP</MenuItemText>
                </MenuItem>

                <MenuItem onClick={() => openMassAction('addMoney')}>
                    <ListItemIcon>
                        <AttachMoneyIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Adicionar dinheiro</MenuItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={openStatsModal}>
                    <ListItemIcon>
                        <EmojiEventsIcon fontSize="small" />
                    </ListItemIcon>
                    <MenuItemText>Ver estatísticas da campanha</MenuItemText>
                </MenuItem>

                <Divider />

                {/* Ciclo de vida da campanha: o item destrutivo fica isolado no fim do menu */}
                {!isFinished ? (
                    <MenuItem onClick={openFinishDialog}>
                        <ListItemIcon>
                            <FlagIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText sx={{ color: 'error.light' }}>Finalizar campanha</MenuItemText>
                    </MenuItem>
                ) : (
                    <MenuItem onClick={handleReopenCampaign} disabled={isReopening}>
                        <ListItemIcon>
                            <ReplayIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuItemText>Reabrir campanha</MenuItemText>
                    </MenuItem>
                )}
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
                campaignId={campaign.id}
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

            <CombatEffectsCatalogDialog
                open={effectsCatalogOpen}
                onClose={() => setEffectsCatalogOpen(false)}
                campaignId={campaign.id}
            />

            <FinishCampaignDialog
                open={finishDialogOpen}
                onClose={() => setFinishDialogOpen(false)}
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                onFinished={async () => {
                    await queryClient.invalidateQueries({ queryKey: [ 'campaignData', campaign.campaignCode ] });
                    setStatsModalOpen(true);
                }}
            />

            <CampaignStatsModal
                open={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                campaignId={campaign.id}
                campaignTitle={campaign.title}
            />

            <WidgetManagerDialog
                open={widgetManagerOpen}
                onClose={() => setWidgetManagerOpen(false)}
            />
        </Box>
    );
}
