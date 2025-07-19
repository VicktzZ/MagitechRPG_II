/* eslint-disable max-len */
'use client';

import { rarityColor } from '@constants';
import { useCampaignCurrentFichaContext } from '@contexts';
import { 
    ExpandMore,
    Inventory2,
    Shield,
    ShoppingBag,
    Warning,
    CheckCircle,
    Info,
    AutoFixNormal
} from '@mui/icons-material';
import { Masonry } from '@mui/lab';
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
    useTheme
} from '@mui/material';
import { red, blue, green, orange, purple } from '@mui/material/colors';
import type { RarityType } from '@types';
import { type ReactElement } from 'react';

export default function InventorySection(): ReactElement {
    const { ficha } = useCampaignCurrentFichaContext();
    const theme = useTheme();

    const totalItems = ficha.inventory.weapons.length + ficha.inventory.armors.length + ficha.inventory.items.length;
    const capacityPercent = (ficha.capacity.cargo / ficha.capacity.max) * 100;
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

    const renderInventoryItem = (item: any, type: 'weapon' | 'armor' | 'item') => {
        const typeConfig = getItemTypeConfig(type);
        const TypeIcon = typeConfig.icon;
        
        const getItemDetails = () => {
            switch (type) {
            case 'weapon':
                return [
                    { label: 'Dano', value: item.effect.value },
                    { label: 'Dano Crítico', value: item.effect.critValue },
                    { label: 'Chance Crítica', value: `${item.effect.critChance}%` },
                    { label: 'Tipo', value: item.kind },
                    { label: 'Categoria', value: item.categ },
                    { label: 'Alcance', value: `${item.range}m` },
                    { label: 'Peso', value: `${item.weight} Kg` },
                    { label: 'Acessórios', value: item.accessories?.join(', ') || 'Nenhum' }
                ];
            case 'armor':
                return [
                    { label: 'Defesa', value: `${item.value} AP` },
                    { label: 'Tipo', value: item.kind },
                    { label: 'Categoria', value: item.categ },
                    { label: 'Penalidade', value: `${item.displacementPenalty}m` },
                    { label: 'Peso', value: `${item.weight} Kg` },
                    { label: 'Acessórios', value: item.accessories?.join(', ') || 'Nenhum' }
                ];
            case 'item':
                return [
                    { label: 'Tipo', value: item.kind },
                    { label: 'Peso', value: `${item.weight} Kg` },
                    { label: 'Quantidade', value: `x${item.quantity ?? 1}` }
                ];
            }
        };

        const details = getItemDetails();

        return (
            <Accordion
                key={item.name}
                elevation={1}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    '&:hover': {
                        borderColor: typeConfig.color + '60',
                        boxShadow: 2
                    },
                    mb: 1
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: typeConfig.color }} />}
                    sx={{
                        minHeight: 56,
                        bgcolor: typeConfig.bg + '40',
                        borderRadius: '8px 8px 0 0',
                        '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            gap: 2
                        }
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box 
                            sx={{
                                p: 0.5,
                                borderRadius: 1,
                                bgcolor: typeConfig.bg,
                                border: '1px solid',
                                borderColor: typeConfig.color + '40'
                            }}
                        >
                            <TypeIcon sx={{ color: typeConfig.color, fontSize: '1.2rem' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: typeConfig.color }}>
                            {item.name}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto' }}>
                        {item.rarity && (
                            <Chip
                                label={item.rarity}
                                size="small"
                                sx={{
                                    bgcolor: item.rarity === 'Amaldiçoado' ? 'black' : rarityColor[item.rarity as RarityType],
                                    color: item.rarity === 'Amaldiçoado' ? rarityColor[item.rarity as RarityType] : 'white',
                                    border: '1px solid',
                                    borderColor: item.rarity === 'Amaldiçoado' ? rarityColor[item.rarity as RarityType] : 'transparent',
                                    fontWeight: 600
                                }}
                            />
                        )}
                        {type === 'weapon' && (
                            <Chip
                                label={`${item.effect.value} dano`}
                                size="small"
                                sx={{
                                    bgcolor: red[100],
                                    color: red[800],
                                    fontWeight: 600
                                }}
                            />
                        )}
                        {type === 'armor' && (
                            <Chip
                                label={`+${item.value} AP`}
                                size="small"
                                sx={{
                                    bgcolor: blue[100],
                                    color: blue[800],
                                    fontWeight: 600
                                }}
                            />
                        )}
                        {type === 'item' && item.quantity && item.quantity > 1 && (
                            <Chip
                                label={`x${item.quantity}`}
                                size="small"
                                sx={{
                                    bgcolor: green[100],
                                    color: green[800],
                                    fontWeight: 600
                                }}
                            />
                        )}
                    </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                        {/* Detalhes em Grid */}
                        <Box 
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 1.5
                            }}
                        >
                            {details.map((detail, index) => (
                                <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {detail.label}:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {detail.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        
                        {/* Descrição */}
                        {item.description && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" color={typeConfig.color} sx={{ mb: 1, fontWeight: 600 }}>
                                        📝 Descrição
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            lineHeight: 1.6,
                                            textAlign: 'justify',
                                            p: 1.5,
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {item.description}
                                    </Typography>
                                </Box>
                            </>
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
                    p: 3, 
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                        : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Stack spacing={3}>
                    {/* Header com Estatísticas */}
                    <Box>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: green[100],
                                    border: '2px solid',
                                    borderColor: green[200]
                                }}
                            >
                                <Inventory2 sx={{ color: green[700], fontSize: '2rem' }} />
                            </Box>
                            <Box flex={1}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        mb: 0.5
                                    }}
                                >
                                    Inventário
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {totalItems} {totalItems === 1 ? 'item' : 'itens'} • Capacidade: {ficha.capacity.cargo}/{ficha.capacity.max} kg
                                </Typography>
                            </Box>
                            <Tooltip title={isOverloaded ? 'Sobrecarga!' : isNearLimit ? 'Próximo do limite' : 'Capacidade OK'}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {isOverloaded ? (
                                        <Warning sx={{ color: red[600] }} />
                                    ) : isNearLimit ? (
                                        <Warning sx={{ color: orange[600] }} />
                                    ) : (
                                        <CheckCircle sx={{ color: green[600] }} />
                                    )}
                                </Box>
                            </Tooltip>
                        </Box>
                        
                        {/* Barra de Capacidade */}
                        <Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(capacityPercent, 100)}
                                sx={{
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: isOverloaded ? red[600] : isNearLimit ? orange[600] : green[600],
                                        borderRadius: 6
                                    }
                                }}
                            />
                        </Box>
                        
                        {/* Estatísticas por Categoria */}
                        <Box 
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                mt: 2,
                                p: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Stack alignItems="center" spacing={0.5}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <AutoFixNormal sx={{ color: red[600], fontSize: '1.2rem' }} />
                                    <Typography variant="h6" sx={{ color: red[600], fontWeight: 700 }}>
                                        {ficha.inventory.weapons.length}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Armas
                                </Typography>
                            </Stack>
                            
                            <Divider orientation="vertical" flexItem />
                            
                            <Stack alignItems="center" spacing={0.5}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Shield sx={{ color: blue[600], fontSize: '1.2rem' }} />
                                    <Typography variant="h6" sx={{ color: blue[600], fontWeight: 700 }}>
                                        {ficha.inventory.armors.length}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Armaduras
                                </Typography>
                            </Stack>
                            
                            <Divider orientation="vertical" flexItem />
                            
                            <Stack alignItems="center" spacing={0.5}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <ShoppingBag sx={{ color: green[600], fontSize: '1.2rem' }} />
                                    <Typography variant="h6" sx={{ color: green[600], fontWeight: 700 }}>
                                        {ficha.inventory.items.length}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Itens
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>

                    {/* Seção de Armas */}
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <AutoFixNormal sx={{ color: red[600] }} />
                            <Typography variant="h6" sx={{ color: red[600], fontWeight: 600 }}>
                                Armas ({ficha.inventory.weapons.length})
                            </Typography>
                        </Box>
                        
                        {ficha.inventory.weapons.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: red[300],
                                    bgcolor: red[50] + '40'
                                }}
                            >
                                <Typography variant="body1" color={red[600]} sx={{ fontWeight: 600 }}>
                                    Nenhuma arma no inventário
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1}>
                                {ficha.inventory.weapons.map((weapon) => renderInventoryItem(weapon, 'weapon'))}
                            </Stack>
                        )}
                    </Box>

                    {/* Seção de Armaduras */}
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Shield sx={{ color: blue[600] }} />
                            <Typography variant="h6" sx={{ color: blue[600], fontWeight: 600 }}>
                                Armaduras ({ficha.inventory.armors.length})
                            </Typography>
                        </Box>
                        
                        {ficha.inventory.armors.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: blue[300],
                                    bgcolor: blue[50] + '40'
                                }}
                            >
                                <Typography variant="body1" color={blue[600]} sx={{ fontWeight: 600 }}>
                                    Nenhuma armadura no inventário
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1}>
                                {ficha.inventory.armors.map((armor) => renderInventoryItem(armor, 'armor'))}
                            </Stack>
                        )}
                    </Box>

                    {/* Seção de Itens */}
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <ShoppingBag sx={{ color: green[600] }} />
                            <Typography variant="h6" sx={{ color: green[600], fontWeight: 600 }}>
                                Itens ({ficha.inventory.items.length})
                            </Typography>
                        </Box>
                        
                        {ficha.inventory.items.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: green[300],
                                    bgcolor: green[50] + '40'
                                }}
                            >
                                <Typography variant="body1" color={green[600]} sx={{ fontWeight: 600 }}>
                                    Nenhum item no inventário
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1}>
                                {ficha.inventory.items.map((item) => renderInventoryItem(item, 'item'))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
