'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { 
    Box, 
    Button, 
    Chip, 
    CircularProgress, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer, 
    IconButton, 
    Paper, 
    Skeleton, 
    Stack, 
    Tooltip, 
    Typography,
    Badge,
    useTheme
} from '@mui/material';
import { 
    Close, 
    Refresh, 
    ShoppingCart, 
    Storefront,
    Visibility
} from '@mui/icons-material';
import { amber, blue, green, grey, orange, purple, red } from '@mui/material/colors';
import { type ReactElement, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { rarityColor } from '@constants';
import type { RarityType } from '@models/types/string';

interface ShopItem {
    id: string
    name: string
    description?: string
    perkType: string
    rarity: string
    price: number
    spellLevel?: number
    data?: any
}

export default function ShopDrawer(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    
    const [ drawerOpen, setDrawerOpen ] = useState(false);
    const [ shopItems, setShopItems ] = useState<ShopItem[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isPurchasing, setIsPurchasing ] = useState<string | null>(null);
    const [ selectedItem, setSelectedItem ] = useState<ShopItem | null>(null);

    // Verifica se a loja está aberta
    const isShopOpen = campaign?.shop?.isOpen ?? false;

    const currency = campaign?.shop?.currency ?? 'SCRAP';
    const currencySymbol = currency === 'YEN' ? '¥' : '¢';
    const displayPrice = (price: number) => (currency === 'YEN' ? price * 1000 : price);

    // Carrega itens da loja
    const loadShopItems = useCallback(async (forceRefresh = false) => {
        if (!campaign?.id || !isShopOpen) return;
        
        setIsLoading(true);
        try {
            const url = forceRefresh 
                ? `/api/campaign/${campaign.id}/shop/items?refresh=true`
                : `/api/campaign/${campaign.id}/shop/items`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success && result.items) {
                setShopItems(result.items);
            } else if (!result.success) {
                console.log('[ShopDrawer] Erro:', result.message);
                setShopItems([]);
            }
        } catch (error) {
            console.error('Erro ao carregar itens da loja:', error);
        } finally {
            setIsLoading(false);
        }
    }, [ campaign?.id, isShopOpen ]);

    // Carrega itens quando abre o drawer
    useEffect(() => {
        if (drawerOpen && isShopOpen) {
            loadShopItems();
        }
    }, [ drawerOpen, isShopOpen, loadShopItems ]);

    // Função para comprar item
    const handlePurchase = async (item: ShopItem) => {
        const currentMoney = charsheet?.inventory?.money ?? 0;
        
        if (currentMoney < item.price) {
            enqueueSnackbar('Dinheiro insuficiente!', { variant: 'error' });
            return;
        }

        setIsPurchasing(item.id);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/shop/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    charsheetId: charsheet.id,
                    itemId: item.id,
                    item
                })
            });

            const result = await response.json();

            if (result.success) {
                // Atualiza dinheiro localmente
                await updateCharsheet({
                    'inventory.money': currentMoney - item.price
                });
                
                // Remove item da lista da loja
                setShopItems(prev => prev.filter(i => i.id !== item.id));
                
                enqueueSnackbar(`${item.name} comprado por ${currencySymbol}${displayPrice(item.price)}!`, { variant: 'success' });
            } else {
                enqueueSnackbar(result.error || 'Erro ao comprar item', { variant: 'error' });
            }
        } catch (error) {
            console.error('Erro ao comprar item:', error);
            enqueueSnackbar('Erro ao processar compra', { variant: 'error' });
        } finally {
            setIsPurchasing(null);
        }
    };

    // Não mostra nada se a loja não estiver aberta
    if (!isShopOpen) return null;

    const currentMoney = charsheet?.inventory?.money ?? 0;

    // Verifica limites de inventário
    const weaponCount = charsheet?.inventory?.weapons?.length ?? 0;
    const armorCount = charsheet?.inventory?.armors?.length ?? 0;
    const spellCount = charsheet?.spells?.length ?? 0;
    const maxSpells = charsheet?.maxSpells ?? 5;
    
    const isRoguelite = campaign?.mode === 'Roguelite';
    const canBuyWeapon = !isRoguelite || weaponCount < 2;
    const canBuyArmor = armorCount < 1;
    const canBuySpell = spellCount < maxSpells;

    const getItemRestriction = (item: ShopItem): string | null => {
        const type = item.perkType?.toUpperCase() || '';
        
        if ((type === 'WEAPON' || type === 'ARMA') && !canBuyWeapon) {
            return 'Você já possui 2 armas';
        }
        if ((type === 'ARMOR' || type === 'ARMADURA') && !canBuyArmor) {
            return 'Você já possui uma armadura';
        }
        if ((type === 'SPELL' || type === 'MAGIA') && !canBuySpell) {
            return `Espaços de magia cheios (${spellCount}/${maxSpells})`;
        }
        return null;
    };

    const getTypeColor = (perkType: string, spellLevel?: number) => {
        const type = perkType?.toUpperCase() || '';
        switch (type) {
        case 'WEAPON':
        case 'ARMA': 
            return { bg: red[100], color: red[800], label: '⚔️ Arma' };
        case 'ARMOR':
        case 'ARMADURA': 
            return { bg: blue[100], color: blue[800], label: '🛡️ Armadura' };
        case 'ITEM': 
            return { bg: amber[100], color: amber[800], label: '📦 Item' };
        case 'SKILL':
        case 'HABILIDADE': 
            return { bg: purple[100], color: purple[800], label: '⚡ Habilidade' };
        case 'SPELL':
        case 'MAGIA': 
            return { bg: orange[100], color: orange[800], label: `✨ Magia${spellLevel ? ` Nv.${spellLevel}` : ''}` };
        case 'UPGRADE': 
            return { bg: green[100], color: green[800], label: '🔧 Acessório' };
        default: 
            return { bg: grey[100], color: grey[800], label: perkType };
        }
    };

    // Helper para renderizar valores de forma segura (evita objetos como React children)
    const safeRender = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
        if (typeof value === 'object') {
            // Tenta extrair propriedades comuns
            if (value.description) return value.description;
            if (value.value) return safeRender(value.value);
            if (value.name) return value.name;
            return '';
        }
        return String(value);
    };

    return (
        <>
            {/* Botão flutuante da loja */}
            <Tooltip title="Loja disponível!" placement="left">
                <Badge 
                    badgeContent={shopItems.length || '!'} 
                    color="success"
                    sx={{
                        position: 'fixed',
                        bottom: 80,
                        right: 20,
                        zIndex: 1000
                    }}
                >
                    <IconButton
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: orange[500],
                            color: 'white',
                            boxShadow: 3,
                            '&:hover': {
                                bgcolor: orange[600],
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Storefront />
                    </IconButton>
                </Badge>
            </Tooltip>

            {/* Drawer da loja */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 400, md: 450 },
                        bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#fafafa'
                    }
                }}
            >
                {/* Header */}
                <Box 
                    sx={{ 
                        p: 2, 
                        bgcolor: orange[500], 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <Storefront />
                        <Typography variant="h6" fontWeight={700}>
                            Loja
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                            label={`${currencySymbol}${displayPrice(currentMoney).toFixed(0)}`}
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                fontWeight: 700
                            }}
                        />
                        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Box>
                </Box>

                {/* Conteúdo */}
                <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                    {isLoading ? (
                        <Stack spacing={2}>
                            <Skeleton variant="rounded" height={120} />
                            <Skeleton variant="rounded" height={120} />
                            <Skeleton variant="rounded" height={120} />
                        </Stack>
                    ) : shopItems.length === 0 ? (
                        <Paper 
                            sx={{ 
                                p: 4, 
                                textAlign: 'center',
                                border: '2px dashed',
                                borderColor: 'divider',
                                bgcolor: 'transparent'
                            }}
                        >
                            <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">
                                Nenhum item disponível
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aguarde o mestre adicionar itens à loja.
                            </Typography>
                            <Button 
                                onClick={async () => await loadShopItems(true)} 
                                startIcon={<Refresh />}
                                sx={{ mt: 2 }}
                            >
                                Atualizar
                            </Button>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {shopItems.map(item => {
                                const typeConfig = getTypeColor(item.perkType, item.spellLevel);
                                const canAfford = currentMoney >= item.price;
                                const restriction = getItemRestriction(item);
                                const canBuy = canAfford && !restriction;
                                const rarityColorValue = rarityColor[item.rarity as RarityType] || grey[500];

                                return (
                                    <Paper
                                        key={item.id}
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: canBuy ? 'divider' : red[200],
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255,255,255,0.03)' 
                                                : 'white',
                                            opacity: canBuy ? 1 : 0.7,
                                            transition: 'all 0.2s ease',
                                            '&:hover': canBuy ? {
                                                borderColor: orange[300],
                                                boxShadow: 2
                                            } : {}
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {item.name}
                                                </Typography>
                                                <Box display="flex" gap={0.5} mt={0.5}>
                                                    <Chip 
                                                        label={typeConfig.label}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: typeConfig.bg, 
                                                            color: typeConfig.color,
                                                            fontWeight: 600,
                                                            height: 22
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={item.rarity}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: `${rarityColorValue}20`, 
                                                            color: rarityColorValue,
                                                            fontWeight: 600,
                                                            height: 22
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Chip 
                                                label={`${currencySymbol}${displayPrice(item.price)}`}
                                                sx={{ 
                                                    bgcolor: canAfford ? green[100] : red[100], 
                                                    color: canAfford ? green[800] : red[800],
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </Box>

                                        {item.description && (
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{ 
                                                    mb: 1.5,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {typeof item.description === 'string' 
                                                    ? item.description 
                                                    : (item.description as any)?.description || ''}
                                            </Typography>
                                        )}

                                        {/* Alerta de restrição */}
                                        {restriction && (
                                            <Typography 
                                                variant="caption" 
                                                color="error"
                                                sx={{ display: 'block', mb: 1, fontWeight: 600 }}
                                            >
                                                ⚠️ {restriction}
                                            </Typography>
                                        )}

                                        <Box display="flex" gap={1}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setSelectedItem(item)}
                                                startIcon={<Visibility />}
                                                sx={{ flex: 1 }}
                                            >
                                                Ver
                                            </Button>
                                            <Button
                                                variant="contained"
                                                disabled={!canBuy || isPurchasing === item.id}
                                                onClick={async () => await handlePurchase(item)}
                                                startIcon={isPurchasing === item.id ? <CircularProgress size={16} /> : <ShoppingCart />}
                                                sx={{
                                                    flex: 2,
                                                    bgcolor: canBuy ? green[500] : grey[400],
                                                    '&:hover': { bgcolor: canBuy ? green[600] : grey[400] }
                                                }}
                                            >
                                                {isPurchasing === item.id 
                                                    ? 'Comprando...' 
                                                    : restriction
                                                        ? 'Indisponível'
                                                        : canAfford 
                                                            ? 'Comprar' 
                                                            : 'Sem dinheiro'}
                                            </Button>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Drawer>

            {/* Modal de Visualização do Item */}
            <Dialog 
                open={!!selectedItem} 
                onClose={() => setSelectedItem(null)}
                maxWidth="sm"
                fullWidth
            >
                {selectedItem && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {selectedItem.name}
                                </Typography>
                                <Box display="flex" gap={0.5} mt={0.5}>
                                    <Chip 
                                        label={getTypeColor(selectedItem.perkType, selectedItem.spellLevel).label}
                                        size="small"
                                        sx={{ 
                                            bgcolor: getTypeColor(selectedItem.perkType, selectedItem.spellLevel).bg, 
                                            color: getTypeColor(selectedItem.perkType, selectedItem.spellLevel).color,
                                            fontWeight: 600
                                        }}
                                    />
                                    <Chip 
                                        label={selectedItem.rarity}
                                        size="small"
                                        sx={{ 
                                            bgcolor: `${rarityColor[selectedItem.rarity as RarityType] || grey[500]}20`, 
                                            color: rarityColor[selectedItem.rarity as RarityType] || grey[500],
                                            fontWeight: 600
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Chip 
                                label={`${currencySymbol}${displayPrice(selectedItem.price)}`}
                                sx={{ 
                                    bgcolor: currentMoney >= selectedItem.price ? green[100] : red[100], 
                                    color: currentMoney >= selectedItem.price ? green[800] : red[800],
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}
                            />
                        </DialogTitle>
                        <DialogContent>
                            {/* Descrição */}
                            {selectedItem.description && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Descrição
                                    </Typography>
                                    <Typography variant="body1">
                                        {typeof selectedItem.description === 'string' 
                                            ? selectedItem.description 
                                            : (selectedItem.description as any)?.description || ''}
                                    </Typography>
                                </Box>
                            )}

                            {/* Detalhes do item baseado no tipo */}
                            {selectedItem.data && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Atributos
                                    </Typography>
                                    
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                        {/* Armas */}
                                        {selectedItem.data.categ && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Categoria</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.categ)}</Typography>
                                            </Box>
                                        )}
                                        {selectedItem.data.range && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Alcance</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.range)}</Typography>
                                            </Box>
                                        )}
                                        {selectedItem.data.effect?.value && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Dano</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.effect.value)}</Typography>
                                            </Box>
                                        )}
                                        {selectedItem.data.effect?.critValue && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Crítico</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.effect.critValue)}</Typography>
                                            </Box>
                                        )}

                                        {/* Armaduras */}
                                        {selectedItem.data.value !== undefined && (selectedItem.perkType?.toUpperCase() === 'ARMADURA' || selectedItem.perkType?.toUpperCase() === 'ARMOR') && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Defesa</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.value)}</Typography>
                                            </Box>
                                        )}

                                        {/* Magias */}
                                        {selectedItem.data.element && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Elemento</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.element)}</Typography>
                                            </Box>
                                        )}
                                        {selectedItem.data.execution && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Execução</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.execution)}</Typography>
                                            </Box>
                                        )}
                                        {selectedItem.data.mpCost !== undefined && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Custo MP</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.mpCost)}</Typography>
                                            </Box>
                                        )}

                                        {/* Itens (apenas se não for habilidade) */}
                                        {selectedItem.data.kind && (selectedItem.perkType?.toUpperCase() !== 'SKILL' && selectedItem.perkType?.toUpperCase() !== 'HABILIDADE') && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Tipo</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.kind)}</Typography>
                                            </Box>
                                        )}
                                        {selectedItem.data.weight !== undefined && (selectedItem.perkType?.toUpperCase() !== 'SKILL' && selectedItem.perkType?.toUpperCase() !== 'HABILIDADE') && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Peso</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.weight)}kg</Typography>
                                            </Box>
                                        )}

                                        {/* Habilidades */}
                                        {selectedItem.data.skillType && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Tipo de Habilidade</Typography>
                                                <Typography variant="body2" fontWeight={600}>{safeRender(selectedItem.data.skillType)}</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Efeitos (para magias com stages) */}
                                    {selectedItem.data.stages && selectedItem.data.stages.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Estágios
                                            </Typography>
                                            <Stack spacing={1}>
                                                {selectedItem.data.stages.map((stage: any, idx: number) => (
                                                    <Paper key={idx} sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                                                        <Typography variant="caption" color="primary" fontWeight={600}>
                                                            Estágio {idx + 1}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {typeof stage === 'string' 
                                                                ? stage 
                                                                : stage.description || stage.value || JSON.stringify(stage)}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* Efeitos de items/perks */}
                                    {selectedItem.data.effects && selectedItem.data.effects.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Efeitos
                                            </Typography>
                                            <Stack spacing={0.5}>
                                                {selectedItem.data.effects.map((effect: any, idx: number) => (
                                                    <Typography key={idx} variant="body2">
                                                        • {typeof effect === 'string' 
                                                            ? effect 
                                                            : effect.description || effect.value || JSON.stringify(effect)}
                                                    </Typography>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                            {/* Alerta de restrição no modal */}
                            {getItemRestriction(selectedItem) && (
                                <Typography 
                                    variant="body2" 
                                    color="error"
                                    sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}
                                >
                                    ⚠️ {getItemRestriction(selectedItem)}
                                </Typography>
                            )}
                            <Box display="flex" gap={1} width="100%">
                                <Button onClick={() => setSelectedItem(null)} variant="outlined" sx={{ flex: 1 }}>
                                    Fechar
                                </Button>
                                <Button
                                    variant="contained"
                                    disabled={
                                        currentMoney < selectedItem.price || 
                                        isPurchasing === selectedItem.id ||
                                        !!getItemRestriction(selectedItem)
                                    }
                                    onClick={() => {
                                        handlePurchase(selectedItem);
                                        setSelectedItem(null);
                                    }}
                                    startIcon={isPurchasing === selectedItem.id ? <CircularProgress size={16} /> : <ShoppingCart />}
                                    sx={{
                                        flex: 2,
                                        bgcolor: (currentMoney >= selectedItem.price && !getItemRestriction(selectedItem)) 
                                            ? green[500] : grey[400],
                                        '&:hover': { 
                                            bgcolor: (currentMoney >= selectedItem.price && !getItemRestriction(selectedItem)) 
                                                ? green[600] : grey[400] 
                                        }
                                    }}
                                >
                                    {getItemRestriction(selectedItem) 
                                        ? 'Indisponível'
                                        : `Comprar por ${currencySymbol}${displayPrice(selectedItem.price)}`}
                                </Button>
                            </Box>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
}
