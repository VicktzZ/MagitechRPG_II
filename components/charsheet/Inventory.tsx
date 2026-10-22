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
import { color } from '@themes/tokens';
import { useMemo, useState, type ReactElement } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useCharsheetSystem } from '@hooks';
import { normalizeToArray } from '@utils/normalizeToArray';

// Pinta o ícone preto com `error.main` (color.danger)
const redFilter = 'invert(46%) sepia(20%) saturate(1757%) hue-rotate(314deg) brightness(100%) contrast(84%)'

/** Entrada do inventário que dá para mostrar: objeto com `name` preenchido (a descrição pode ser vazia) */
interface InventoryEntry<T> {
    entry: T
    /** Posição na lista gravada (inclui entradas inválidas puladas), usada para excluir só este item */
    index: number
}

function isRenderableEntry(entry: unknown): boolean {
    return typeof entry === 'object' && entry !== null
        && typeof (entry as { name?: unknown }).name === 'string'
        && (entry as { name: string }).name.trim() !== ''
}

function listEntries<T>(list: unknown): Array<InventoryEntry<T>> {
    return normalizeToArray<T>(list)
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => isRenderableEntry(entry))
}

function entryKey(entry: { id?: string, name?: string }, index: number): string {
    return entry.id ? `id-${entry.id}` : `${entry.name}-${index}`
}

/** Peso na tela com até 2 casas (um valor gravado como 0.9999999999999999 aparece como 1) */
function formatWeight(value: unknown): number {
    const weight = Number(value)
    return Number.isFinite(weight) ? Number(weight.toFixed(2)) : 0
}

/** Garante que accessories seja array de strings */
function normalizeAccessories(acc: unknown): string[] {
    if (!acc) return []
    if (Array.isArray(acc)) return acc.map(a => String(a))
    if (typeof acc === 'string') return [ acc ]
    if (typeof acc === 'object') return Object.values(acc as Record<string, unknown>).map(a => String(a))
    return []
}

/** Efeitos de um item como lista de textos (aceita lista, texto único ou objeto) */
function normalizeEffects(effects: unknown): string[] {
    return normalizeAccessories(effects).map(effect => effect.trim()).filter(effect => effect !== '')
}

/** Garante que effect seja um objeto válido */
function normalizeEffect(eff: any) {
    if (!eff || typeof eff !== 'object') {
        return { effectType: '', value: '', critValue: '' }
    }
    return {
        effectType: String(eff.effectType || ''),
        value: String(eff.value || ''),
        critValue: String(eff.critValue || '')
    }
}

/**
 * Card de uma arma, armadura ou item do inventário. Só o nome é exigido: itens sem descrição (como os que
 * chegam da retirada de estoque do widget) aparecem e podem ser excluídos.
 */
function InventoryItem({
    item,
    type,
    index,
    bonus
}: {
    item: any,
    type: 'weapon' | 'armor' | 'item',
    index: number,
    bonus?: number
}) {
    // Props base que todos os tipos compartilham
    const baseProps = {
        id: typeof item.id === 'string' ? item.id : undefined,
        inventoryIndex: index,
        name: String(item.name || ''),
        description: String(item.description || ''),
        rarity: String(item.rarity || 'Comum'),
        kind: String(item.kind || ''),
        weight: Number(item.weight) || 0,
        quantity: Number(item.quantity) || 1
    } as any

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
        )
    }

    if (type === 'armor') {
        return (
            <ItemComponent
                {...baseProps}
                as='armor'
                categ={String(item.categ || '')}
                value={Number(item.value) || 0}
                displacementPenalty={Number(item.displacementPenalty) || 0}
                accessories={normalizeAccessories(item.accessories)}
            />
        )
    }

    return (
        <ItemComponent
            {...baseProps}
            as='item'
            effects={normalizeEffects(item.effects)}
            level={Number(item.level) || 0}
        />
    )
}

// TODO: ACRESCENTAR ITENS DE LINHAGEM (ao mudar)
// TODO: INCREMENTAR SISTEMAS DE NÍVEIS (3) PARA ITENS
export function Inventory (): ReactElement {
    const { control, getValues } = useFormContext<Charsheet>()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    // Observa os valores relevantes do formulário
    const inventory = useWatch({ control, name: 'inventory' })
    const expertises = useWatch({ control, name: 'expertises' })
    const capacity = useWatch({ control, name: 'capacity' })

    // Unidade de peso do sistema customizado (ex: "kg", "slots", "" = simbólico)
    const { system: customSystem } = useCharsheetSystem(getValues('systemId'))
    const weightUnit = customSystem ? (customSystem.weightConfig?.unit ?? '') : 'kg'
    
    const [ modalOpen, setModalOpen ] = useState<boolean>(false)

    // Calcula estatísticas do inventário
    const inventoryStats = useMemo(() => {
        if (!inventory) return { totalItems: 0, weapons: 0, armors: 0, items: 0 }
        
        // Conta exatamente o que é mostrado (objetos com nome), para o número bater com os cards
        const weapons = listEntries(inventory.weapons).length
        const armors = listEntries(inventory.armors).length
        const items = listEntries(inventory.items).length

        return { totalItems: weapons + armors + items, weapons, armors, items }
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

    // Renderiza as armas
    const weapons = useMemo(() => {
        return listEntries<Weapon>(inventory?.weapons).map(({ entry: weapon, index }) => {
            const rarityValues = rarityArmorBonuses[weapon.rarity]
            const bonus = rarityValues || 0;

            return (
                <Grid key={entryKey(weapon, index)} item xs={12} sm={6} md={4} lg={3}>
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
        return listEntries<Armor>(inventory?.armors).map(({ entry: armor, index }) => (
            <Grid key={entryKey(armor, index)} item xs={12} sm={6} md={4} lg={3}>
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
        return listEntries<Item>(inventory?.items).map(({ entry: item, index }) => (
            <Grid key={entryKey(item, index)} item xs={12} sm={6} md={4} lg={3}>
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
                        bgcolor: 'background.default',
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
                                        {`${formatWeight(capacity?.cargo)}/${formatWeight(capacity?.max)}${weightUnit ? ` ${weightUnit}` : ''}`}
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
                                        px: 3
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
                                <Typography variant="h6" fontWeight="bold" color="error.main">
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
                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                        border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`
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
                                <Shield sx={{ color: color.ap }} />
                                <Typography variant="h6" fontWeight="bold" color={color.ap}>
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
                                        bgcolor: alpha(color.ap, 0.05),
                                        border: `1px dashed ${alpha(color.ap, 0.3)}`
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
                                <ShoppingBag sx={{ color: 'success.main' }} />
                                <Typography variant="h6" fontWeight="bold" color="success.main">
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
                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                        border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`
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