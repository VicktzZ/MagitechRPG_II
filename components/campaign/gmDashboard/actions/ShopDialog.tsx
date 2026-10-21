'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Slider,
    Typography
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { color } from '@themes/tokens';
import { useSnackbar } from 'notistack';
import { PerkTypeEnum } from '@enums/rogueliteEnum';
import type { PlayerInfo, ShopConfig } from './types';
import { RARITY_OPTIONS, DEFAULT_SHOP_CONFIG } from './constants';

interface ShopDialogProps {
    open: boolean;
    onClose: () => void;
    players: PlayerInfo[];
    campaignId: string;
    existingShop?: Partial<ShopConfig> & { isOpen?: boolean };
}

export default function ShopDialog({ 
    open, 
    onClose, 
    players, 
    campaignId,
    existingShop
}: ShopDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [ shopConfig, setShopConfig ] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
    const [ isUpdating, setIsUpdating ] = useState(false);
    const [ shopItems, setShopItems ] = useState<any[]>([]);
    const [ isLoadingItems, setIsLoadingItems ] = useState(false);
    const isShopOpen = existingShop?.isOpen ?? false;

    const currency = shopConfig.currency ?? 'SCRAP';
    const currencySymbol = currency === 'YEN' ? '¥' : '¢';
    const displayPrice = (price: number) => (currency === 'YEN' ? price * 1000 : price);

    const loadShopItems = useCallback(async () => {
        setIsLoadingItems(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/shop/items`);
            const result = await response.json();
            
            if (result.success && result.items) {
                setShopItems(result.items);
            } else {
                setShopItems([]);
            }
        } catch (error) {
            console.error('Erro ao carregar itens da loja:', error);
            setShopItems([]);
        } finally {
            setIsLoadingItems(false);
        }
    }, [ campaignId ]);

    // Carrega configuração existente ao abrir
    useEffect(() => {
        if (open && existingShop) {
            setShopConfig({
                itemCount: existingShop.itemCount ?? 5,
                rarities: existingShop.rarities ?? [],
                types: existingShop.types ?? [],
                itemKinds: existingShop.itemKinds ?? [],
                priceMultiplier: existingShop.priceMultiplier ?? 1.0,
                currency: existingShop.currency ?? DEFAULT_SHOP_CONFIG.currency,
                visibleToAll: existingShop.visibleToAll ?? true,
                visibleToPlayers: existingShop.visibleToPlayers ?? []
            });
            
            if (existingShop.isOpen) {
                loadShopItems();
            }
        }
    }, [ open, existingShop ]);

    const handleToggleShop = async (openShop: boolean) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/shop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isOpen: openShop,
                    config: openShop ? shopConfig : undefined
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao atualizar loja');
            }

            enqueueSnackbar(result.message || (openShop ? 'Loja aberta para os jogadores!' : 'Loja fechada.'), { variant: 'success' });
            
            if (openShop) {
                await loadShopItems();
            }
            
            // Fecha o dialog após a ação
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar loja:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao atualizar loja', { variant: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        if (!isUpdating) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorefrontIcon sx={{ color: 'text.secondary' }} />
                Gerenciar Loja
                {isShopOpen && (
                    <Chip label="Aberta" size="small" sx={{ ml: 1, bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }} />
                )}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    {/* Status da loja */}
                    <Box 
                        sx={{ 
                            p: 2, 
                            bgcolor: isShopOpen ? alpha(color.success, 0.1) : 'background.raised',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: isShopOpen ? 'success.main' : 'divider'
                        }}
                    >
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                mb: 1, 
                                fontWeight: 700, 
                                color: isShopOpen ? 'success.main' : 'text.primary' 
                            }}
                        >
                            Status da Loja: {isShopOpen ? 'aberta' : 'fechada'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isShopOpen 
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
                            sx={{ color: 'primary.main' }}
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
                            sx={{ color: 'primary.main' }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                            Moeda da loja
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label="¢ Sucata"
                                size="small"
                                onClick={() => setShopConfig(prev => ({ ...prev, currency: 'SCRAP' }))}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: currency === 'SCRAP' ? color.amberSubtle : 'background.raised',
                                    color: currency === 'SCRAP' ? 'text.primary' : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: currency === 'SCRAP' ? color.amberLine : 'transparent'
                                }}
                            />
                            <Chip
                                label="¥ Ienes (x1000)"
                                size="small"
                                onClick={() => setShopConfig(prev => ({ ...prev, currency: 'YEN' }))}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: currency === 'YEN' ? color.amberSubtle : 'background.raised',
                                    color: currency === 'YEN' ? 'text.primary' : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: currency === 'YEN' ? color.amberLine : 'transparent'
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Filtros de raridade */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                            Raridades permitidas (vazio = todas)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {RARITY_OPTIONS.map(rarity => (
                                <Chip
                                    key={rarity}
                                    label={rarity}
                                    size="small"
                                    onClick={() => {
                                        const newRarities = shopConfig.rarities.includes(rarity)
                                            ? shopConfig.rarities.filter(r => r !== rarity)
                                            : [ ...shopConfig.rarities, rarity ];
                                        setShopConfig(prev => ({ ...prev, rarities: newRarities  }));
                                    }}
                                    sx={{
                                        bgcolor: shopConfig.rarities.includes(rarity) 
                                            ? color.amberSubtle 
                                            : 'background.raised',
                                        color: shopConfig.rarities.includes(rarity) ? 'text.primary' : 'text.secondary',
                                        fontWeight: shopConfig.rarities.includes(rarity) ? 600 : 400,
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: shopConfig.rarities.includes(rarity) ? color.amberLine : 'transparent'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Filtros de tipos de perks */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                            Tipos de itens permitidos (vazio = todos)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {Object.entries(PerkTypeEnum)
                                .filter(([ key ]) => ![
                                    'FOGO',
                                    'ÁGUA',
                                    'AR',
                                    'TERRA',
                                    'ELETRICIDADE',
                                    'LUZ',
                                    'TREVAS',
                                    'NÃO-ELEMENTAL',
                                    'SANGUE',
                                    'VÁCUO',
                                    'EXPLOSÃO',
                                    'TÓXICO',
                                    'RADIAÇÃO',
                                    'PSÍQUICO'
                                ].includes(key))
                                .map(([ key, value ]) => (
                                    <Chip
                                        key={key}
                                        label={value}
                                        size="small"
                                        onClick={() => {
                                            const newTypes = shopConfig.types.includes(value)
                                                ? shopConfig.types.filter(t => t !== value)
                                                : [ ...shopConfig.types, value ];
                                            setShopConfig(prev => ({ ...prev, types: newTypes }));
                                        }}
                                        sx={{
                                            bgcolor: shopConfig.types.includes(value) 
                                                ? color.amberSubtle 
                                                : 'background.raised',
                                            color: shopConfig.types.includes(value) ? 'text.primary' : 'text.secondary',
                                            fontWeight: shopConfig.types.includes(value) ? 600 : 400,
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: shopConfig.types.includes(value) ? color.amberLine : 'transparent'
                                        }}
                                    />
                                ))}
                        </Box>
                    </Box>

                    {/* Visibilidade */}
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Visibilidade da Loja
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Checkbox
                                checked={shopConfig.visibleToAll}
                                onChange={(e) => setShopConfig(prev => ({ 
                                    ...prev, 
                                    visibleToAll: e.target.checked,
                                    visibleToPlayers: e.target.checked ? [] : prev.visibleToPlayers
                                }))}
                            />
                            <Typography variant="body2">Visível para todos os jogadores</Typography>
                        </Box>
                        {!shopConfig.visibleToAll && (
                            <Box sx={{ ml: 4, mt: 1, maxHeight: 150, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <List dense>
                                    {players.map(player => (
                                        <ListItem 
                                            key={player.id} 
                                            button 
                                            onClick={() => {
                                                const isSelected = shopConfig.visibleToPlayers.includes(player.id);
                                                setShopConfig(prev => ({
                                                    ...prev,
                                                    visibleToPlayers: isSelected
                                                        ? prev.visibleToPlayers.filter(id => id !== player.id)
                                                        : [ ...prev.visibleToPlayers, player.id ]
                                                }));
                                            }}
                                        >
                                            <Checkbox checked={shopConfig.visibleToPlayers.includes(player.id)} size="small" />
                                            <ListItemAvatar>
                                                <Avatar src={player.avatar} sx={{ width: 24, height: 24 }} />
                                            </ListItemAvatar>
                                            <ListItemText primary={player.charsheet?.name || player.name} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>

                    {/* Visualização dos itens da loja */}
                    {isShopOpen && (
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Itens na Loja ({shopItems.length})
                                </Typography>
                                <Button 
                                    size="small" 
                                    onClick={loadShopItems}
                                    disabled={isLoadingItems}
                                    startIcon={isLoadingItems ? <CircularProgress size={16} /> : null}
                                >
                                    Atualizar
                                </Button>
                            </Box>
                            
                            {isLoadingItems ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : shopItems.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    Nenhum item na loja ainda.
                                </Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflow: 'auto' }}>
                                    {shopItems.map((item: any) => (
                                        <Box 
                                            key={item.id}
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                p: 1, 
                                                borderRadius: 1,
                                                bgcolor: 'background.raised',
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {item.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                    <Chip label={item.perkType} size="small" sx={{ height: 18, fontSize: '0.75rem' }} />
                                                    <Chip label={item.rarity} size="small" sx={{ height: 18, fontSize: '0.75rem' }} />
                                                </Box>
                                            </Box>
                                            <Chip 
                                                label={`${currencySymbol}${displayPrice(item.price)}`}
                                                size="small"
                                                sx={{ fontWeight: 700, bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} disabled={isUpdating} variant="outlined">
                    Cancelar
                </Button>
                {isShopOpen ? (
                    <Button
                        onClick={async () => await handleToggleShop(false)}
                        variant="contained"
                        disabled={isUpdating}
                        startIcon={isUpdating ? <CircularProgress size={20} /> : <StorefrontIcon />}
                        sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }}
                    >
                        {isUpdating ? 'Fechando...' : 'Fechar Loja'}
                    </Button>
                ) : (
                    <Button
                        onClick={async () => await handleToggleShop(true)}
                        variant="contained"
                        disabled={isUpdating}
                        startIcon={isUpdating ? <CircularProgress size={20} /> : <StorefrontIcon />}
                        sx={{ bgcolor: 'success.main', color: 'success.contrastText', '&:hover': { bgcolor: 'success.dark' } }}
                    >
                        {isUpdating ? 'Abrindo...' : 'Abrir Loja'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
