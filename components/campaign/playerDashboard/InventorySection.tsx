/* eslint-disable max-len */
'use client';

import { rarityColor } from '@constants';
import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { RarityType } from '@models/types/string';
import { 
    ExpandMore,
    Inventory2,
    Shield,
    ShoppingBag,
    Warning,
    CheckCircle,
    AutoFixNormal,
    Search
} from '@mui/icons-material';
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
    Badge
} from '@mui/material';
import { red, blue, green, orange, grey } from '@mui/material/colors';
import { type ReactElement, useState, useMemo } from 'react';

type InventoryTab = 'all' | 'weapons' | 'armors' | 'items';

export default function InventorySection(): ReactElement {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<InventoryTab>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const totalItems = charsheet.inventory.weapons.length + charsheet.inventory.armors.length + charsheet.inventory.items.length;
    const capacityPercent = (charsheet.capacity.cargo / charsheet.capacity.max) * 100;
    const isOverloaded = capacityPercent > 100;
    const isNearLimit = capacityPercent > 80;

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
            items = items.concat(charsheet.inventory.weapons.map(w => ({ item: w, type: 'weapon' as const })));
        }
        if (activeTab === 'all' || activeTab === 'armors') {
            items = items.concat(charsheet.inventory.armors.map(a => ({ item: a, type: 'armor' as const })));
        }
        if (activeTab === 'all' || activeTab === 'items') {
            items = items.concat(charsheet.inventory.items.map(i => ({ item: i, type: 'item' as const })));
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
                    { label: 'Tipo', value: item.kind },
                    { label: 'Categoria', value: item.categ },
                    { label: 'Alcance', value: `${item.range === 'Corpo-a-corpo' ? 'Corpo-a-corpo' : item.range + 'm'}` },
                    { label: 'Peso', value: `${item.weight} kg` }
                ];
            case 'armor':
                return [
                    { label: 'Defesa', value: `+${item.value} AP`, highlight: true },
                    { label: 'Tipo', value: item.kind },
                    { label: 'Categoria', value: item.categ },
                    { label: 'Penalidade', value: `${item.displacementPenalty}m` },
                    { label: 'Peso', value: `${item.weight} kg` }
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
                                    label={`+${item.value} AP`}
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
                                    {item.accessories.map((acc: string, idx: number) => (
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
                                    {charsheet.capacity.cargo}/{charsheet.capacity.max} kg
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
        </Box>
    );
}