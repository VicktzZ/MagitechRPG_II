/* eslint-disable max-len */
'use client';

import { rarityColor } from '@constants';
import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import type { RarityType } from '@models/types/string';
import { 
    ExpandMore,
    Inventory2,
    Shield,
    ShoppingBag,
    Warning,
    CheckCircle,
    AutoFixNormal,
    Search,
    Delete,
    CardGiftcard
} from '@mui/icons-material';

/**
 * Normaliza um valor que pode ser um array ou um objeto com chaves numéricas
 * Converte Record<number, T> para T[]
 */
function normalizeToArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    
    // Se é um objeto com chaves numéricas, converter para array
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        const isNumericKeys = keys.every(key => !isNaN(Number(key)));
        if (isNumericKeys) {
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => value[key]);
        }
    }
    
    return [];
}
import { 
    Accordion, 
    AccordionDetails, 
    AccordionSummary, 
    Box, 
    Chip, 
    Paper, 
    Typography,
    Stack,
    LinearProgress,
    Tooltip,
    Divider,
    useTheme,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Badge,
    IconButton
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { red, blue, green, orange, grey } from '@mui/material/colors';
import { type ReactElement, useState, useMemo } from 'react';
import { useSession } from '@node_modules/next-auth/react';
import { type SessionPlayer } from '@features/roguelite/components';
import { SubstitutionModal } from '@features/roguelite/components/perkCardsModal/components/SubstitutionModal';

type InventoryTab = 'all' | 'weapons' | 'armors' | 'items';

export default function InventorySection(): ReactElement {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { users, campaign, charsheets } = useCampaignContext();
    const { data: session } = useSession();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [ activeTab, setActiveTab ] = useState<InventoryTab>('all');
    const [ searchQuery, setSearchQuery ] = useState('');
    
    // Estado para modal de doação
    const [ donationModal, setDonationModal ] = useState<{
        open: boolean;
        item: any;
        type: 'weapon' | 'armor' | 'item';
    }>({ open: false, item: null, type: 'item' });

    // Calcula o peso total do inventário dinamicamente
    const calculateTotalWeight = useMemo(() => {
        const weapons = normalizeToArray(charsheet.inventory.weapons);
        const armors = normalizeToArray(charsheet.inventory.armors);
        const items = normalizeToArray(charsheet.inventory.items);
        
        const weaponsWeight = weapons.reduce((acc, w) => acc + (w.weight || 0), 0);
        const armorsWeight = armors.reduce((acc, a) => acc + (a.weight || 0), 0);
        const itemsWeight = items.reduce((acc, i) => acc + ((i.weight || 0) * (i.quantity || 1)), 0);
        return weaponsWeight + armorsWeight + itemsWeight;
    }, [ charsheet.inventory.weapons, charsheet.inventory.armors, charsheet.inventory.items ]);

    const totalItems = normalizeToArray(charsheet.inventory.weapons).length + 
                      normalizeToArray(charsheet.inventory.armors).length + 
                      normalizeToArray(charsheet.inventory.items).length;
    const capacityPercent = (calculateTotalWeight / charsheet.capacity.max) * 100;
    const isOverloaded = capacityPercent > 100;
    const isNearLimit = capacityPercent > 80;

    // Prepara lista de jogadores da sessão (excluindo o jogador atual)
    const sessionPlayers: SessionPlayer[] = useMemo(() => {
        const currentUserId = session?.user?.id;
        const campaignPlayers = campaign?.players || [];
        const allCharsheets = charsheets || [];
        
        return users.players
            .filter(player => player.id !== currentUserId)
            .map(player => {
                const playerInCampaign = campaignPlayers.find((cp: any) => cp.userId === player.id);
                const playerCharsheet = playerInCampaign 
                    ? allCharsheets.find((cs: any) => cs.id === playerInCampaign.charsheetId)
                    : undefined;
                
                return {
                    odac: player.name || 'Jogador',
                    name: playerCharsheet?.name || `Ficha de ${player.name || 'Jogador'}`,
                    odacId: player.id,
                    odacImage: player.image,
                    charsheetId: playerCharsheet?.id || playerInCampaign?.charsheetId || '',
                    weaponCount: playerCharsheet?.inventory?.weapons?.length || 0,
                    armorCount: playerCharsheet?.inventory?.armors?.length || 0,
                    currentCargo: playerCharsheet?.capacity?.cargo || 0,
                    maxCargo: playerCharsheet?.capacity?.max || 0
                };
            })
            .filter(p => p.charsheetId);
    }, [ users.players, session?.user?.id, charsheets, campaign?.players ]);

    // Abre modal de doação
    const handleOpenDonationModal = (item: any, type: 'weapon' | 'armor' | 'item', e: React.MouseEvent) => {
        e.stopPropagation();
        setDonationModal({ open: true, item, type });
    };

    // Callback de doação
    const handleDonate = async (targetPlayerId: string, targetCharsheetId: string): Promise<{ success: boolean; message: string }> => {
        if (!donationModal.item || !campaign?.id) {
            return { success: false, message: 'Dados insuficientes para doação' };
        }

        try {
            const response = await fetch(`/api/campaign/${campaign.id}/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donorCharsheetId: charsheet.id,
                    targetCharsheetId,
                    targetUserId: targetPlayerId,
                    itemType: donationModal.type,
                    item: donationModal.item,
                    donorName: charsheet.name || 'Um jogador'
                })
            });

            const result = await response.json();

            if (result.success) {
                // Remove o item do inventário do doador
                const itemWeight = (donationModal.item.weight || 0) * (donationModal.item.quantity || 1);
                const updatedInventory: any = {};

                switch (donationModal.type) {
                case 'weapon':
                    updatedInventory['inventory.weapons'] = normalizeToArray(charsheet.inventory.weapons).filter(w => w.id !== donationModal.item.id);
                    break;
                case 'armor': {
                    updatedInventory['inventory.armors'] = normalizeToArray(charsheet.inventory.armors).filter(a => a.id !== donationModal.item.id);
                    // Decrementa AP ao doar armadura
                    const armorAPValue = donationModal.item.ap || donationModal.item.value || 0;
                    const currentAP = charsheet.stats?.ap || 5;
                    const currentMaxAP = charsheet.stats?.maxAp || 5;
                    const newAP = Math.max(5, currentAP - armorAPValue);
                    const newMaxAP = Math.max(5, currentMaxAP - armorAPValue);
                    
                    updatedInventory['stats.ap'] = newAP;
                    updatedInventory['stats.maxAp'] = newMaxAP;
                    break;
                }
                case 'item': {
                    updatedInventory['inventory.items'] = normalizeToArray(charsheet.inventory.items).filter(i => i.id !== donationModal.item.id);
                    // Se o item for do tipo "Capacidade", diminui capacity.max ao invés de cargo
                    if (donationModal.item.kind === 'Capacidade') {
                        const currentMax = charsheet.capacity?.max || 0;
                        const newMax = Math.max(0, currentMax - Math.abs(donationModal.item.weight || 0));
                        updatedInventory['capacity.max'] = parseFloat(newMax.toFixed(1));
                    }
                    break;
                }
                }

                // Atualiza inventário e peso (apenas para itens que não são de Capacidade)
                if (donationModal.type !== 'item' || donationModal.item.kind !== 'Capacidade') {
                    const newCargo = parseFloat(Math.max(0, charsheet.capacity.cargo - itemWeight).toFixed(1));
                    updatedInventory['capacity.cargo'] = newCargo;
                }

                await updateCharsheet(updatedInventory);

                enqueueSnackbar(result.message, { variant: 'success' });
                setDonationModal({ open: false, item: null, type: 'item' });
            }

            return result;
        } catch (error) {
            console.error('Erro ao doar item:', error);
            return { success: false, message: 'Erro ao processar doação' };
        }
    };

    // Função para deletar item do inventário
    const handleDeleteItem = async (itemToDelete: any, type: 'weapon' | 'armor' | 'item', e: React.MouseEvent) => {
        e.stopPropagation(); // Evita expandir o accordion
        
        try {
            const updatedInventory: any = {};
            const itemWeight = (itemToDelete.weight || 0) * (itemToDelete.quantity || 1);
            
            switch (type) {
            case 'weapon':
                updatedInventory['inventory.weapons'] = normalizeToArray(charsheet.inventory.weapons).filter(w => w.id !== itemToDelete.id);
                break;
            case 'armor': {
                updatedInventory['inventory.armors'] = normalizeToArray(charsheet.inventory.armors).filter(a => a.id !== itemToDelete.id);
                // Decrementa AP ao remover armadura
                const armorAPValue = itemToDelete.ap || itemToDelete.value || 0;
                const currentAP = charsheet.stats?.ap || 5;
                const currentMaxAP = charsheet.stats?.maxAp || 5;
                const newAP = Math.max(5, currentAP - armorAPValue);
                const newMaxAP = Math.max(5, currentMaxAP - armorAPValue);
                
                updatedInventory['stats.ap'] = newAP;
                updatedInventory['stats.maxAp'] = newMaxAP;
                break;
            }
            case 'item': {
                updatedInventory['inventory.items'] = normalizeToArray(charsheet.inventory.items).filter(i => i.id !== itemToDelete.id);
                // Se o item for do tipo "Capacidade", diminui capacity.max ao invés de cargo
                if (itemToDelete.kind === 'Capacidade') {
                    const currentMax = charsheet.capacity?.max || 0;
                    const newMax = Math.max(0, currentMax - Math.abs(itemToDelete.weight || 0));
                    updatedInventory['capacity.max'] = parseFloat(newMax.toFixed(1));
                }
                break;
            }
            }

            // Atualiza inventário e peso (apenas para itens que não são de Capacidade)
            if (type !== 'item' || itemToDelete.kind !== 'Capacidade') {
                const newCargo = parseFloat(Math.max(0, charsheet.capacity.cargo - itemWeight).toFixed(1));
                updatedInventory['capacity.cargo'] = newCargo;
            }
            
            await updateCharsheet(updatedInventory);

            enqueueSnackbar(`${itemToDelete.name} removido do inventário!`, { variant: 'success' });
        } catch (error) {
            console.error('Erro ao remover item:', error);
            enqueueSnackbar('Erro ao remover item', { variant: 'error' });
        }
    };

    const getItemTypeConfig = (type: 'weapon' | 'armor' | 'item') => {
        switch (type) {
        case 'weapon':
            return { color: red[600], bg: red[100], icon: AutoFixNormal, label: 'Arma' };
        case 'armor':
            return { color: blue[600], bg: blue[100], icon: Shield, label: 'Armadura' };
        case 'item':
            return { color: green[600], bg: green[100], icon: ShoppingBag, label: 'Item' };
        }
    };

    // Filtra itens baseado na busca e tab ativa
    const filteredItems = useMemo(() => {
        let items: Array<{ item: any, type: 'weapon' | 'armor' | 'item' }> = [];

        if (activeTab === 'all' || activeTab === 'weapons') {
            items = items.concat(normalizeToArray(charsheet.inventory.weapons).map(w => ({ item: w, type: 'weapon' as const })));
        }
        if (activeTab === 'all' || activeTab === 'armors') {
            items = items.concat(normalizeToArray(charsheet.inventory.armors).map(a => ({ item: a, type: 'armor' as const })));
        }
        if (activeTab === 'all' || activeTab === 'items') {
            items = items.concat(normalizeToArray(charsheet.inventory.items).map(i => ({ item: i, type: 'item' as const })));
        }

        // Filtro por busca
        if (searchQuery) {
            const term = searchQuery.toLowerCase();
            items = items.filter(({ item }) => (item?.name ?? '').toLowerCase().includes(term));
        }

        // Deduplica por chave composta (type + name) para evitar repetições visuais
        const seen = new Set<string>();
        const unique = items.filter(({ item, type }) => {
            const key = `${type}::${item?.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return unique;
    }, [
        activeTab,
        searchQuery,
        charsheet.inventory.weapons,
        charsheet.inventory.armors,
        charsheet.inventory.items
    ]);

    const renderInventoryItem = (item: any, type: 'weapon' | 'armor' | 'item') => {
        const typeConfig = getItemTypeConfig(type);
        const TypeIcon = typeConfig.icon;
        
        const getItemDetails = () => {
            switch (type) {
            case 'weapon':
                return [
                    { label: 'Dano', value: item.effect.value, highlight: true },
                    { label: 'Crítico', value: `${item.effect.critValue} (${item.effect.critChance})` },
                    { label: 'Tipo', value: item.effect.effectType || item.kind },
                    { label: 'Categoria', value: item.categ },
                    { label: 'Alcance', value: item.range === 'Corpo-a-corpo' ? 'Corpo-a-corpo' : item.range },
                    { label: 'Peso', value: `${item.weight} kg` }
                ];
            case 'armor':
                return [
                    { label: 'Defesa', value: `+${item.ap || item.value || 0} AP`, highlight: true },
                    { label: 'Tipo', value: item.kind || '-' },
                    { label: 'Categoria', value: item.categ || '-' },
                    { label: 'Penalidade', value: `${item.displacementPenalty ?? 0}m` },
                    { label: 'Peso', value: `${item.weight || 0} kg` }
                ];
            case 'item':
                return [
                    { label: 'Tipo', value: item.kind },
                    { label: 'Peso', value: `${item.weight} kg` },
                    { label: 'Quantidade', value: `x${item.quantity ?? 1}`, highlight: true }
                ];
            }
        };

        const details = getItemDetails();
        const rarityColorValue = item.rarity ? rarityColor[item.rarity as RarityType] : grey[500];

        return (
            <Accordion
                key={item.name}
                elevation={0}
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    '&:hover': {
                        borderColor: typeConfig.color + '60',
                        bgcolor: theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9'
                    },
                    mb: 1.5,
                    transition: 'all 0.2s ease'
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                        minHeight: 64,
                        '& .MuiAccordionSummary-content': {
                            my: 1.5,
                            gap: 2
                        }
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                        {/* Ícone e Nome */}
                        <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                            <Box 
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    bgcolor: `${typeConfig.color}15`,
                                    border: `2px solid ${typeConfig.color}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TypeIcon sx={{ color: typeConfig.color, fontSize: '1.3rem' }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {typeConfig.label}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Tags */}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {item.rarity && (
                                <Chip
                                    label={item.rarity}
                                    size="small"
                                    sx={{
                                        bgcolor: item.rarity === 'Amaldiçoado' ? 'transparent' : `${rarityColorValue}20`,
                                        color: rarityColorValue,
                                        border: '1px solid',
                                        borderColor: `${rarityColorValue}40`,
                                        fontWeight: 600,
                                        height: 24
                                    }}
                                />
                            )}
                            {type === 'weapon' && (
                                <Chip
                                    label={`${item.effect.value} dano`}
                                    size="small"
                                    sx={{
                                        bgcolor: `${red[500]}20`,
                                        color: red[600],
                                        fontWeight: 600,
                                        height: 24
                                    }}
                                />
                            )}
                            {type === 'armor' && (
                                <Chip
                                    label={`+${item.ap || item.value || 0} AP`}
                                    size="small"
                                    sx={{
                                        bgcolor: `${blue[500]}20`,
                                        color: blue[600],
                                        fontWeight: 600,
                                        height: 24
                                    }}
                                />
                            )}
                            {type === 'item' && item.quantity && item.quantity > 1 && (
                                <Chip
                                    label={`x${item.quantity}`}
                                    size="small"
                                    sx={{
                                        bgcolor: `${green[500]}20`,
                                        color: green[600],
                                        fontWeight: 600,
                                        height: 24
                                    }}
                                />
                            )}
                        </Stack>
                    </Stack>
                </AccordionSummary>
                
                <AccordionDetails sx={{ pt: 0, pb: 2.5, px: 2.5 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                        {/* Detalhes em Grid */}
                        <Box 
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                gap: 2
                            }}
                        >
                            {details.map((detail, index) => (
                                <Box 
                                    key={index}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor: detail.highlight 
                                            ? `${typeConfig.color}10` 
                                            : theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
                                        border: '1px solid',
                                        borderColor: detail.highlight
                                            ? `${typeConfig.color}30`
                                            : theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0'
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        {detail.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: detail.highlight ? typeConfig.color : 'text.primary' }}>
                                        {detail.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        
                        {/* Acessórios */}
                        {item.accessories && item.accessories.length > 0 && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Acessórios
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {normalizeToArray(item.accessories).map((acc: string, idx: number) => (
                                        <Chip
                                            key={idx}
                                            label={acc}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 24 }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        
                        {/* Descrição */}
                        {item.description && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0'
                                }}
                            >
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    📝 Descrição
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        lineHeight: 1.6,
                                        color: 'text.secondary'
                                    }}
                                >
                                    {item.description}
                                </Typography>
                            </Box>
                        )}
                        
                        {/* Botões de Ação */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            {/* Botão de Doar */}
                            {sessionPlayers.length > 0 && (
                                <Tooltip title="Doar para outro jogador">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleOpenDonationModal(item, type, e)}
                                        sx={{
                                            color: blue[400],
                                            '&:hover': {
                                                bgcolor: `${blue[500]}15`,
                                                color: blue[600]
                                            }
                                        }}
                                    >
                                        <CardGiftcard fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            
                            {/* Botão de Deletar */}
                            <Tooltip title="Remover do inventário">
                                <IconButton
                                    size="small"
                                    onClick={async (e) => await handleDeleteItem(item, type, e)}
                                    sx={{
                                        color: red[400],
                                        '&:hover': {
                                            bgcolor: `${red[500]}15`,
                                            color: red[600]
                                        }
                                    }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        );
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper 
                elevation={2}
                sx={{ 
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2}>
                        <Box display="flex" alignItems="center" gap={2} flex={1}>
                            <Box 
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: `${green[500]}15`,
                                    border: `2px solid ${green[500]}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Inventory2 sx={{ color: green[600], fontSize: '1.75rem' }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Inventário
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Status de Capacidade */}
                        <Tooltip title={isOverloaded ? 'Sobrecarga!' : isNearLimit ? 'Próximo do limite' : 'Capacidade OK'}>
                            <Box 
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    bgcolor: isOverloaded 
                                        ? `${red[500]}15` 
                                        : isNearLimit 
                                            ? `${orange[500]}15` 
                                            : `${green[500]}15`,
                                    border: '1px solid',
                                    borderColor: isOverloaded 
                                        ? `${red[500]}30` 
                                        : isNearLimit 
                                            ? `${orange[500]}30` 
                                            : `${green[500]}30`
                                }}
                            >
                                {isOverloaded ? (
                                    <Warning sx={{ color: red[600], fontSize: '1.2rem' }} />
                                ) : isNearLimit ? (
                                    <Warning sx={{ color: orange[600], fontSize: '1.2rem' }} />
                                ) : (
                                    <CheckCircle sx={{ color: green[600], fontSize: '1.2rem' }} />
                                )}
                                <Typography variant="body2" fontWeight={600}>
                                    {calculateTotalWeight.toFixed(1)}/{charsheet.capacity.max} kg
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Stack>
                    
                    {/* Barra de Capacidade */}
                    <Box sx={{ position: 'relative' }}>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(capacityPercent, 100)}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: isOverloaded ? red[500] : isNearLimit ? orange[500] : green[500],
                                    borderRadius: 4
                                }
                            }}
                        />
                        {isOverloaded && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '100%',
                                    bgcolor: `${red[500]}30`,
                                    borderRadius: 4,
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Tabs e Busca */}
                <Box sx={{ px: 3, pt: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ display: 'flex', alignItems: 'center' }} spacing={2} mb={2}>
                        <Tabs 
                            value={activeTab} 
                            onChange={(_, value) => setActiveTab(value)}
                            sx={{ flex: 1 }}
                        >
                            <Tab 
                                label="Todos" 
                                value="all"
                                icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={totalItems} color="primary" />}
                                iconPosition="end"
                            />
                            <Tab 
                                label="Armas" 
                                value="weapons"
                                icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={charsheet.inventory.weapons.length} color="error" />}
                                iconPosition="end"
                            />
                            <Tab 
                                label="Armaduras" 
                                value="armors"
                                icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={charsheet.inventory.armors.length} color="info" />}
                                iconPosition="end"
                            />
                            <Tab 
                                label="Itens" 
                                value="items"
                                icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={charsheet.inventory.items.length} color="success" />}
                                iconPosition="end"
                            />
                        </Tabs>
                        
                        <TextField
                            size="small"
                            placeholder="Buscar item..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ minWidth: { xs: '100%', md: 250 } }}
                        />
                    </Stack>
                </Box>

                {/* Lista de Itens */}
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {filteredItems.length === 0 ? (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 6, 
                                textAlign: 'center',
                                border: '2px dashed',
                                borderColor: 'divider',
                                bgcolor: 'transparent',
                                borderRadius: 2
                            }}
                        >
                            <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                {searchQuery ? 'Nenhum item encontrado' : 'Inventário vazio'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery 
                                    ? 'Tente buscar com outros termos'
                                    : 'Os itens do personagem aparecerão aqui'
                                }
                            </Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={0}>
                            {filteredItems.map(({ item, type }, idx) => (
                                <Box key={`${type}-${item?.name}-${idx}`}>
                                    {renderInventoryItem(item, type)}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Paper>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
            `}</style>

            {/* Modal de Doação */}
            {donationModal.open && donationModal.item && (
                <SubstitutionModal
                    open={donationModal.open}
                    type={donationModal.type}
                    newItem={{
                        id: donationModal.item.id,
                        name: donationModal.item.name,
                        description: donationModal.item.description || '',
                        rarity: donationModal.item.rarity,
                        weight: donationModal.item.weight
                    }}
                    existingItems={[]}
                    sessionPlayers={sessionPlayers}
                    onSubstitute={() => {}} // Não usado no modo donateOnly
                    onDonate={handleDonate}
                    onCancel={() => setDonationModal({ open: false, item: null, type: 'item' })}
                    donateOnly={true}
                    itemWeight={donationModal.item.weight || 0}
                />
            )}
        </Box>
    );
}