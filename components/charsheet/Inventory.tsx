/* eslint-disable react-hooks/exhaustive-deps */
import ItemComponent from '@components/charsheet/subcomponents/Item';
import { RPGIcon } from '@components/misc';
import { rarityArmorBonuses } from '@constants/dataTypes';
import { AddItemModal } from '@layout';
import { type Armor, type Item, type Weapon } from '@models';
import type { Charsheet } from '@models/entities';
import {
    Add,
    CheckCircle,
    FitnessCenter,
    Inventory2,
    Shield,
    ShoppingBag,
    Warning
} from '@mui/icons-material';
import {
    alpha,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import { useMemo, useState, type ReactElement } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const redFilter = 'invert(16%) sepia(44%) saturate(6989%) hue-rotate(352deg) brightness(97%) contrast(82%)'

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

// TODO: ACRESCENTAR ITENS DE LINHAGEM (ao mudar)
// TODO: INCREMENTAR SISTEMAS DE NÍVEIS (3) PARA ITENS
export function Inventory (): ReactElement {
    const { control } = useFormContext<Charsheet>()
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    
    // Observa os valores relevantes do formulário
    const inventory = useWatch({ control, name: 'inventory' })
    const expertises = useWatch({ control, name: 'expertises' })
    const capacity = useWatch({ control, name: 'capacity' })
    
    const [ modalOpen, setModalOpen ] = useState<boolean>(false)

    // Calcula estatísticas do inventário
    const inventoryStats = useMemo(() => {
        if (!inventory) return { totalItems: 0, weapons: 0, armors: 0, items: 0 }
        
        const weaponsArray = normalizeToArray(inventory.weapons);
        const armorsArray = normalizeToArray(inventory.armors);
        const itemsArray = normalizeToArray(inventory.items);
        
        // Contar apenas objetos válidos (não IDs)
        const validWeapons = weaponsArray.filter((w: any) => typeof w === 'object' && w !== null && 'name' in w);
        const validArmors = armorsArray.filter((a: any) => typeof a === 'object' && a !== null && 'name' in a);
        const validItems = itemsArray.filter((i: any) => typeof i === 'object' && i !== null && 'name' in i);
        
        return {
            totalItems: validWeapons.length + validArmors.length + validItems.length,
            weapons: validWeapons.length,
            armors: validArmors.length,
            items: validItems.length
        }
    }, [ inventory ])

    // Calcula porcentagem de capacidade
    const capacityPercentage = useMemo(() => {
        if (!capacity || capacity.max === 0) return 0
        return Math.min((capacity.cargo / capacity.max) * 100, 100)
    }, [ capacity ])

    // Determina cor da capacidade
    const getCapacityColor = () => {
        if (capacityPercentage >= 100) return 'error'
        if (capacityPercentage >= 75) return 'warning'
        if (capacityPercentage >= 50) return 'info'
        return 'success'
    }

    // Componente adaptador para traduzir as props
    function InventoryItem({
        item,
        type,
        bonus
    }: {
        item: any,
        type: 'weapon' | 'armor' | 'item',
        index: number,
        bonus?: number
    }) {
        // Garante que todos os campos necessários existam
        if (!item?.name || !item.description || !item.rarity) {
            console.error('Item inválido:', item);
            return null;
        }

        // Função helper para garantir que accessories seja array de strings
        const normalizeAccessories = (acc: any): string[] => {
            if (!acc) return [];
            if (Array.isArray(acc)) return acc.map(a => String(a));
            if (typeof acc === 'string') return [ acc ];
            if (typeof acc === 'object') return Object.values(acc).map(a => String(a));
            return [];
        };

        // Função helper para garantir que effect seja objeto válido
        const normalizeEffect = (eff: any) => {
            if (!eff || typeof eff !== 'object') {
                return { effectType: '', value: '', critValue: '' };
            }
            return {
                effectType: String(eff.effectType || ''),
                value: String(eff.value || ''),
                critValue: String(eff.critValue || '')
            };
        };

        // Props base que todos os tipos compartilham
        const baseProps = {
            name: String(item.name || ''),
            description: String(item.description || ''),
            rarity: String(item.rarity || ''),
            kind: String(item.kind || ''),
            weight: Number(item.weight) || 0,
            quantity: Number(item.quantity) || 1,
            as: type === 'weapon' ? 'weapon' : type === 'armor' ? 'armor' : 'item'
        };

        try {
            // Props específicas baseadas no tipo
            if (type === 'weapon') {
                return (
                    <ItemComponent
                        {...baseProps}
                        as='weapon'
                        categ={String(item.categ || '')}
                        range={String(item.range || '')}
                        hit={String(item.hit || '')}
                        ammo={String(item.ammo || '')}
                        magazineSize={Number(item.magazineSize) || 0}
                        accessories={normalizeAccessories(item.accessories)}
                        bonus={String(item.bonus || '')}
                        effect={normalizeEffect(item.effect)}
                        bonusValue={bonus ? [ bonus ] : [ 0 ]}
                        isDisadvantage={false}
                        diceQuantity={1}
                    />
                );
            } else if (type === 'armor') {
                return (
                    <ItemComponent
                        {...baseProps}
                        as='armor'
                        categ={String(item.categ || '')}
                        value={Number(item.value) || 0}
                        displacementPenalty={Number(item.displacementPenalty) || 0}
                        accessories={normalizeAccessories(item.accessories)}
                    />
                );
            } else {
                return (
                    <ItemComponent
                        {...baseProps}
                        as='item'
                        effects={String(item.effects || '')}
                        level={Number(item.level) || 0}
                    />
                );
            }
        } catch (error) {
            console.error('Erro ao renderizar item:', error, item);
            return null;
        }
    }

    // Renderiza as armas
    const weapons = useMemo(() => {
        const weaponsArray = normalizeToArray<Weapon>(inventory?.weapons);
        if (weaponsArray.length === 0) return []
        return weaponsArray.map((weapon, index) => {
            const rarityValues = rarityArmorBonuses[weapon.rarity]
            const bonus = rarityValues || 0;

            return (
                <Grid key={`${weapon.name}-${index}`} item xs={12} sm={6} md={4} lg={3}>
                    <InventoryItem
                        item={weapon}
                        type="weapon"
                        index={index}
                        bonus={bonus}
                    />
                </Grid>
            )
        })
    }, [ inventory?.weapons, expertises ])

    // Renderiza as armaduras
    const armors = useMemo(() => {
        const armorsArray = normalizeToArray<Armor>(inventory?.armors);
        if (armorsArray.length === 0) return []
        return armorsArray.map((armor, index) => (
            <Grid key={`${armor.name}${index}`} item xs={12} sm={6} md={4} lg={3}>
                <InventoryItem
                    item={armor}
                    type="armor"
                    index={index}
                />
            </Grid>
        ))
    }, [ inventory?.armors ])

    // Renderiza os itens
    const items = useMemo(() => {
        const itemsArray = normalizeToArray<Item>(inventory?.items);
        if (itemsArray.length === 0) return []
        
        // Filtrar apenas objetos válidos (não IDs)
        const validItems = itemsArray.filter((item: any) => 
            typeof item === 'object' && 
            item !== null && 
            'name' in item
        );
        
        return validItems.map((item, index) => (
            <Grid key={`${item.name}${index}`} item xs={12} sm={6} md={4} lg={3}>
                <InventoryItem
                    item={item}
                    type="item"
                    index={index}
                />
            </Grid>
        ))
    }, [ inventory?.items ])

    return (
        <>
            <Box 
                display='flex' 
                flexDirection='column' 
                gap={3}
                sx={{ 
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                }}
            >
                {/* Header do Inventário */}
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: matches ? 2 : 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper3',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack 
                        direction={matches ? 'column' : 'row'}
                        alignItems={matches ? 'stretch' : 'center'}
                        justifyContent='space-between'
                        spacing={2}
                    >
                        <Stack direction='row' alignItems='center' spacing={2}>
                            <Inventory2 sx={{ color: 'primary.main', fontSize: '2rem' }} />
                            <Box>
                                <Typography variant={matches ? 'h6' : 'h5'} fontWeight="bold" color="primary">
                                    Inventário
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {inventoryStats.totalItems} itens total
                                </Typography>
                            </Box>
                        </Stack>
                        
                        <Stack direction={matches ? 'column' : 'row'} spacing={2} alignItems='center'>
                            {/* Capacidade */}
                            <Paper 
                                sx={{ 
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: `${getCapacityColor()}.main`,
                                    minWidth: matches ? '100%' : '200px'
                                }}
                            >
                                <Stack spacing={1}>
                                    <Stack direction='row' alignItems='center' justifyContent='space-between'>
                                        <Stack direction='row' alignItems='center' spacing={1}>
                                            <FitnessCenter sx={{ color: `${getCapacityColor()}.main`, fontSize: '1rem' }} />
                                            <Typography variant="body2" fontWeight="medium">
                                                Capacidade
                                            </Typography>
                                        </Stack>
                                        <Tooltip title={capacityPercentage >= 100 ? 'Inventário sobrecarregado!' : capacityPercentage >= 75 ? 'Inventário quase cheio' : 'Capacidade normal'}>
                                            {capacityPercentage >= 100 ? 
                                                <Warning sx={{ color: 'error.main', fontSize: '1rem' }} /> :
                                                <CheckCircle sx={{ color: `${getCapacityColor()}.main`, fontSize: '1rem' }} />
                                            }
                                        </Tooltip>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={capacityPercentage}
                                        color={getCapacityColor()}
                                        sx={{ 
                                            height: 8, 
                                            borderRadius: 4,
                                            bgcolor: alpha(theme.palette[getCapacityColor()].main, 0.1)
                                        }}
                                    />
                                    <Typography 
                                        variant="body2" 
                                        textAlign="center"
                                        fontWeight="bold"
                                        color={`${getCapacityColor()}.main`}
                                    >
                                        {capacity ? `${capacity.cargo}/${capacity.max} kg` : '0/0 kg'}
                                    </Typography>
                                </Stack>
                            </Paper>
                            
                            {/* Botão Adicionar */}
                            <Tooltip title="Adicionar novo item ao inventário">
                                <Button
                                    onClick={() => setModalOpen(true)}
                                    variant="contained"
                                    startIcon={<Add />}
                                    size={matches ? 'medium' : 'large'}
                                    sx={{
                                        fontWeight: 'bold',
                                        px: 3,
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: theme.shadows[6]
                                        }
                                    }}
                                >
                                    {matches ? 'Adicionar' : 'Adicionar Item'}
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Conteúdo do Inventário */}
                <Paper
                    elevation={1}
                    sx={{
                        p: matches ? 2 : 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack spacing={4}>
                        {/* Seção Armas */}
                        <Box>
                            <Stack direction='row' alignItems='center' spacing={1} mb={2}>
                                <RPGIcon icon='sword2' filter={redFilter} />
                                <Typography variant="h6" fontWeight="bold" color={red[500]}>
                                    Armas
                                </Typography>
                                <Chip 
                                    label={inventoryStats.weapons} 
                                    size="small" 
                                    color={inventoryStats.weapons > 0 ? 'default' : 'secondary'}
                                />
                            </Stack>
                            {inventoryStats.weapons > 0 ? (
                                <Grid container spacing={matches ? 1 : 2}>
                                    {weapons}
                                </Grid>
                            ) : (
                                <Paper 
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center', 
                                        bgcolor: alpha(red[500], 0.05),
                                        border: `1px dashed ${alpha(red[500], 0.3)}`
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhuma arma no inventário
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        <Divider />

                        {/* Seção Armaduras */}
                        <Box>
                            <Stack direction='row' alignItems='center' spacing={1} mb={2}>
                                <Shield sx={{ color: blue[500] }} />
                                <Typography variant="h6" fontWeight="bold" color={blue[500]}>
                                    Armaduras
                                </Typography>
                                <Chip 
                                    label={inventoryStats.armors} 
                                    size="small" 
                                    color={inventoryStats.armors > 0 ? 'default' : 'secondary'}
                                />
                            </Stack>
                            {inventoryStats.armors > 0 ? (
                                <Grid container spacing={matches ? 1 : 2}>
                                    {armors}
                                </Grid>
                            ) : (
                                <Paper 
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center', 
                                        bgcolor: alpha(blue[500], 0.05),
                                        border: `1px dashed ${alpha(blue[500], 0.3)}`
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhuma armadura no inventário
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        <Divider />

                        {/* Seção Itens */}
                        <Box>
                            <Stack direction='row' alignItems='center' spacing={1} mb={2}>
                                <ShoppingBag sx={{ color: green[500] }} />
                                <Typography variant="h6" fontWeight="bold" color={green[500]}>
                                    Itens
                                </Typography>
                                <Chip 
                                    label={inventoryStats.items} 
                                    size="small" 
                                    color={inventoryStats.items > 0 ? 'default' : 'secondary'}
                                />
                            </Stack>
                            {inventoryStats.items > 0 ? (
                                <Grid container spacing={matches ? 1 : 2}>
                                    {items}
                                </Grid>
                            ) : (
                                <Paper 
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center', 
                                        bgcolor: alpha(green[500], 0.05),
                                        border: `1px dashed ${alpha(green[500], 0.3)}`
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhum item no inventário
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Stack>
                </Paper>    
            </Box>

            <AddItemModal
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </>
    )
}

export default Inventory;