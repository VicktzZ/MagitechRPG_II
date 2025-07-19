/* eslint-disable react-hooks/exhaustive-deps */
import ItemComponent from '@components/ficha/subcomponents/Item';
import CreateItemModal from '@components/ficha/dialogs/inventoryCreateModals/CreateItemModal';
import { RPGIcon } from '@components/misc';
import { rarityArmorBonuses } from '@constants/dataTypes';
import {
    Add,
    CheckCircle,
    Close,
    FitnessCenter,
    Inventory2,
    Shield,
    ShoppingBag,
    TouchApp,
    Warning
} from '@mui/icons-material';
import { Avatar, Fade, GlobalStyles } from '@mui/material';
import {
    alpha,
    Backdrop,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Modal,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import type { Ficha } from '@types';
import { useMemo, useState, type ReactElement } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

type ItemName = 'weapon' | 'item' | 'armor'
const redFilter = 'invert(16%) sepia(44%) saturate(6989%) hue-rotate(352deg) brightness(97%) contrast(82%)'

// TODO: ACRESCENTAR ITENS DE LINHAGEM (ao mudar)
export function Inventory (): ReactElement {
    const { control   } = useFormContext<Ficha>()
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    
    // Observa os valores relevantes do formulário
    const inventory = useWatch({ control, name: 'inventory' })
    
    const expertises = useWatch({ control, name: 'expertises' })
    const capacity = useWatch({ control, name: 'capacity' })
    
    const [ modalOpen, setModalOpen ] = useState<boolean>(false)
    const [ modalContent, setModalContent ] = useState<ReactElement>(
        <CreateItemModal 
            itemType={'weapon'}
            onClose={() => { setModalOpen(false) }}
        />
    )
    
    const [ addButtonsStyle, setAddButtonsStyle ] = useState<Record<ItemName, 'outlined' | 'contained'>>({
        weapon: 'contained',
        armor: 'outlined',
        item: 'outlined'
    })

    const changeModalContent = (itemName: ItemName): void => {
        setAddButtonsStyle({
            weapon: 'outlined',
            armor: 'outlined',
            item: 'outlined',
            [itemName]: 'contained'
        })

        setModalContent(
            <CreateItemModal 
                itemType={itemName}
                onClose={() => { setModalOpen(false) }}
            />
        )
    }

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

                {/* Estatísticas rápidas */}
                <Paper 
                    elevation={1}
                    sx={{ 
                        p: matches ? 1.5 : 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Stack 
                        direction={matches ? 'column' : 'row'}
                        divider={<Divider orientation={matches ? 'horizontal' : 'vertical'} flexItem />}
                        spacing={matches ? 1 : 2}
                        justifyContent='space-around'
                    >
                        <Stack direction='row' alignItems='center' spacing={1} flex={1} justifyContent='center'>
                            <RPGIcon icon='sword2' filter={redFilter} />
                            <Box textAlign='center'>
                                <Typography variant="h6" fontWeight="bold" color={red[500]}>
                                    {inventoryStats.weapons}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Armas
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={1} flex={1} justifyContent='center'>
                            <Shield sx={{ color: blue[500] }} />
                            <Box textAlign='center'>
                                <Typography variant="h6" fontWeight="bold" color={blue[500]}>
                                    {inventoryStats.armors}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Armaduras
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={1} flex={1} justifyContent='center'>
                            <ShoppingBag sx={{ color: green[500] }} />
                            <Box textAlign='center'>
                                <Typography variant="h6" fontWeight="bold" color={green[500]}>
                                    {inventoryStats.items}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Itens
                                </Typography>
                            </Box>
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

            {/* Modal Melhorado */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                        sx: {
                            backgroundColor: alpha(theme.palette.background.default, 0.7),
                            backdropFilter: 'blur(8px)'
                        }
                    }
                }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2
                }}
            >
                <Fade in={modalOpen}>
                    <Paper
                        elevation={24}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: {
                                xs: '80%',
                                sm: '70%',
                                md: '60%'
                            },
                            maxHeight: '90%',
                            width: '95%',
                            maxWidth: '800px',
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, 
                                    ${theme.palette.error.main}, 
                                    ${theme.palette.info.main}, 
                                    ${theme.palette.success.main})`,
                                borderTopLeftRadius: 4,
                                borderTopRightRadius: 4
                            }
                        }}
                    >
                        {/* Header do Modal */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: { xs: 1.5, sm: 2 }, 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.95)} 100%)`,
                                color: 'primary.contrastText',
                                borderRadius: 0,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `radial-gradient(circle at top right, ${alpha('#fff', 0.1)}, transparent 70%)`,
                                    pointerEvents: 'none'
                                }
                            }}
                        >
                            <Stack direction='row' alignItems='center' justifyContent='space-between'>
                                <Stack direction='row' alignItems='center' spacing={1.5}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha('#fff', 0.2),
                                            width: 38,
                                            height: 38,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                                            animation: modalContent ? 'none' : 'pulseLight 2s infinite'
                                        }}
                                    >
                                        <Add sx={{ color: '#fff', fontSize: 24 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography 
                                            variant='h6' 
                                            fontWeight="bold"
                                            sx={{
                                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            Adicionar Item ao Inventário
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                opacity: 0.8,
                                                display: { xs: 'none', sm: 'block' }
                                            }}
                                        >
                                            Selecione o tipo de item para começar
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Tooltip title="Fechar" arrow>
                                    <IconButton 
                                        onClick={() => setModalOpen(false)}
                                        sx={{ 
                                            color: 'primary.contrastText',
                                            bgcolor: alpha('#fff', 0.1),
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: alpha('#fff', 0.2),
                                                transform: 'rotate(90deg)'
                                            }
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Paper>
                        
                        {/* Botões de Categoria com Estilo Aprimorado */}
                        <Paper
                            elevation={4}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                borderRadius: 0,
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                backdropFilter: 'blur(10px)',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                spacing={{ xs: 1, sm: 1.5 }} 
                                justifyContent='center'
                                alignItems="stretch"
                            >
                                <Tooltip title="Adicionar uma nova arma ao inventário" arrow>
                                    <Button 
                                        onClick={() => changeModalContent('weapon')} 
                                        variant={addButtonsStyle.weapon}
                                        startIcon={
                                            <Avatar
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    bgcolor: 'transparent',
                                                    boxShadow: addButtonsStyle.weapon === 'contained' ? '0 0 10px rgba(244,67,54,0.5)' : 'none'
                                                }}
                                            >
                                                <RPGIcon 
                                                    icon='sword2' 
                                                    sx={{ 
                                                        fontSize: 16,
                                                        color: addButtonsStyle.weapon === 'contained' ? 'white' : theme.palette.error.main
                                                    }} 
                                                />
                                            </Avatar>
                                        }
                                        sx={{ 
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 1,
                                            borderRadius: 2,
                                            flex: { xs: 1, sm: 1 },
                                            transition: 'all 0.3s ease',
                                            background: addButtonsStyle.weapon === 'contained' 
                                                ? `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)` 
                                                : 'transparent',
                                            border: addButtonsStyle.weapon !== 'contained' 
                                                ? `1px solid ${theme.palette.error.main}` 
                                                : 'none',
                                            boxShadow: addButtonsStyle.weapon === 'contained'
                                                ? `0 4px 20px ${alpha(theme.palette.error.main, 0.5)}`
                                                : 'none',
                                            '&:hover': {
                                                background: addButtonsStyle.weapon === 'contained'
                                                    ? `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`
                                                    : alpha(theme.palette.error.main, 0.1),
                                                transform: 'translateY(-2px)',
                                                boxShadow: addButtonsStyle.weapon === 'contained'
                                                    ? `0 6px 25px ${alpha(theme.palette.error.main, 0.6)}`
                                                    : `0 4px 15px ${alpha(theme.palette.error.main, 0.3)}`
                                            }
                                        }}
                                    >
                                        Arma
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Adicionar uma nova armadura ao inventário" arrow>
                                    <Button 
                                        onClick={() => changeModalContent('armor')} 
                                        variant={addButtonsStyle.armor}
                                        startIcon={
                                            <Avatar
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    bgcolor: 'transparent',
                                                    boxShadow: addButtonsStyle.armor === 'contained' ? '0 0 10px rgba(33,150,243,0.5)' : 'none'
                                                }}
                                            >
                                                <Shield 
                                                    sx={{ 
                                                        fontSize: 16,
                                                        color: addButtonsStyle.armor === 'contained' ? 'white' : theme.palette.info.main
                                                    }} 
                                                />
                                            </Avatar>
                                        }
                                        sx={{ 
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 1,
                                            borderRadius: 2,
                                            flex: { xs: 1, sm: 1 },
                                            transition: 'all 0.3s ease',
                                            background: addButtonsStyle.armor === 'contained' 
                                                ? `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)` 
                                                : 'transparent',
                                            border: addButtonsStyle.armor !== 'contained' 
                                                ? `1px solid ${theme.palette.info.main}` 
                                                : 'none',
                                            boxShadow: addButtonsStyle.armor === 'contained'
                                                ? `0 4px 20px ${alpha(theme.palette.info.main, 0.5)}`
                                                : 'none',
                                            '&:hover': {
                                                background: addButtonsStyle.armor === 'contained'
                                                    ? `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`
                                                    : alpha(theme.palette.info.main, 0.1),
                                                transform: 'translateY(-2px)',
                                                boxShadow: addButtonsStyle.armor === 'contained'
                                                    ? `0 6px 25px ${alpha(theme.palette.info.main, 0.6)}`
                                                    : `0 4px 15px ${alpha(theme.palette.info.main, 0.3)}`
                                            }
                                        }}
                                    >
                                        Armadura
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Adicionar um novo item ao inventário" arrow>
                                    <Button 
                                        onClick={() => changeModalContent('item')} 
                                        variant={addButtonsStyle.item}
                                        startIcon={
                                            <Avatar
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    bgcolor: 'transparent',
                                                    boxShadow: addButtonsStyle.item === 'contained' ? '0 0 10px rgba(76,175,80,0.5)' : 'none'
                                                }}
                                            >
                                                <ShoppingBag 
                                                    sx={{ 
                                                        fontSize: 16,
                                                        color: addButtonsStyle.item === 'contained' ? 'white' : theme.palette.success.main
                                                    }} 
                                                />
                                            </Avatar>
                                        }
                                        sx={{ 
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 1,
                                            borderRadius: 2,
                                            flex: { xs: 1, sm: 1 },
                                            transition: 'all 0.3s ease',
                                            background: addButtonsStyle.item === 'contained' 
                                                ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)` 
                                                : 'transparent',
                                            border: addButtonsStyle.item !== 'contained' 
                                                ? `1px solid ${theme.palette.success.main}` 
                                                : 'none',
                                            boxShadow: addButtonsStyle.item === 'contained'
                                                ? `0 4px 20px ${alpha(theme.palette.success.main, 0.5)}`
                                                : 'none',
                                            '&:hover': {
                                                background: addButtonsStyle.item === 'contained'
                                                    ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
                                                    : alpha(theme.palette.success.main, 0.1),
                                                transform: 'translateY(-2px)',
                                                boxShadow: addButtonsStyle.item === 'contained'
                                                    ? `0 6px 25px ${alpha(theme.palette.success.main, 0.6)}`
                                                    : `0 4px 15px ${alpha(theme.palette.success.main, 0.3)}`
                                            }
                                        }}
                                    >
                                        Item
                                    </Button>
                                </Tooltip>
                            </Stack>
                        </Paper>
                        
                        {/* Conteúdo do Modal com Animação */}
                        <Box 
                            sx={{ 
                                flex: 1, 
                                overflow: 'auto', 
                                p: { xs: 1.5, sm: 2, md: 3 },
                                bgcolor: alpha(theme.palette.background.paper, 0.95),
                                position: 'relative'
                            }}
                        >
                            {modalContent ? (
                                <Fade in={!!modalContent} timeout={500}>
                                    <Box>{modalContent}</Box>
                                </Fade>
                            ) : (
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        height: '100%',
                                        opacity: 0.7,
                                        p: 3
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            width: 60,
                                            height: 60,
                                            mb: 2
                                        }}
                                    >
                                        <TouchApp sx={{ fontSize: 30, color: theme.palette.primary.main }} />
                                    </Avatar>
                                    <Typography variant="body1" align="center" fontWeight="medium" color="text.secondary">
                                        Selecione um tipo de item acima para começar
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        {/* Keyframes para animações */}
                        <GlobalStyles 
                            styles={{
                                '@keyframes pulseLight': {
                                    '0%': {
                                        boxShadow: '0 0 0 0 rgba(255,255,255,0.4)'
                                    },
                                    '70%': {
                                        boxShadow: '0 0 0 10px rgba(255,255,255,0)'
                                    },
                                    '100%': {
                                        boxShadow: '0 0 0 0 rgba(255,255,255,0)'
                                    }
                                }
                            }}
                        />
                    </Paper>
                </Fade>
            </Modal>
        </>
    )
}

export default Inventory;