/* eslint-disable react-hooks/exhaustive-deps */
import ItemComponent from '@components/ficha/subcomponents/Item';
import { RPGIcon } from '@components/misc';
import { rarityArmorBonuses } from '@constants/dataTypes';
import { AddItemModal } from '@layout';
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
        
        return {
            totalItems: (inventory.weapons?.length || 0) + (inventory.armors?.length || 0) + (inventory.items?.length || 0),
            weapons: inventory.weapons?.length || 0,
            armors: inventory.armors?.length || 0,
            items: inventory.items?.length || 0
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
        type
        ,
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

        // Props base que todos os tipos compartilham
        const baseProps = {
            name: item.name,
            description: item.description,
            rarity: item.rarity,
            kind: item.kind,
            weight: item.weight,
            quantity: item.quantity,
            as: type === 'weapon' ? 'weapon' : type === 'armor' ? 'armor' : 'item'
        };

        // Props específicas baseadas no tipo
        if (type === 'weapon') {
            return (
                <ItemComponent
                    {...baseProps}
                    as='weapon'
                    categ={item.categ}
                    range={item.range}
                    hit={item.hit}
                    ammo={item.ammo}
                    magazineSize={item.magazineSize}
                    accessories={item.accessories}
                    bonus={item.bonus}
                    effect={item.effect}
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
                    categ={item.categ}
                    value={item.value}
                    displacementPenalty={item.displacementPenalty}
                    accessories={item.accessories}
                />
            );
        } else {
            return (
                <ItemComponent
                    {...baseProps}
                    as='item'
                    effects={item.effects}
                    level={item.level}
                />
            );
        }
    }

    // Renderiza as armas
    const weapons = useMemo(() => {
        if (!inventory?.weapons) return []
        return inventory.weapons.map((weapon, index) => {
            const rarityValues = rarityArmorBonuses[weapon.rarity]
            const bonus = rarityValues || 0;

            return (
                <Grid key={`${weapon.name}${index}`} item xs={12} sm={6} md={4} lg={3}>
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
        if (!inventory?.armors) return []
        return inventory.armors.map((armor, index) => (
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
        if (!inventory?.items) return []
        return inventory.items.map((item, index) => (
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