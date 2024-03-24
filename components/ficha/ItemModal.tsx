import { InputLabel, MenuItem, Select, TextField, Box, FormControl, Typography, Grid, type ComponentsProps, ListSubheader, useMediaQuery, Button, Chip } from '@mui/material'
import { useEffect, type ReactElement, useState } from 'react'
import type { Armor, DamageType, Ficha, Item, MergedItems, Weapon } from '@types'
import { useTheme } from '@mui/material'
import { type FormikContextType, useFormikContext } from 'formik'
import { 
    armorKind,
    itemKind,
    rarities,
    weaponCateg,
    weaponKind,
    ranges,
    weaponHit,
    ballisticWeaponAmmo,
    energyWeaponAmmo,
    weaponScientificAccessories,
    weaponMagicalAccessories,
    weaponBonuses,
    weaponDamageType, 
    armorScientificAccessories,
    armorMagicalAccessories
} from '@constants/dataTypes'
import { useSnackbar } from 'notistack'
import { OutlinedInput } from '@mui/material'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

export default function ItemModal({ 
    itemType,
    onClose
}: {
    itemType: 'weapon' | 'armor' | 'item',
    onClose: () => void
}): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const f: FormikContextType<Ficha> = useFormikContext()

    const [ item, setItem ] = useState<Partial<MergedItems<'Leve' | 'Pesada'>>>({
        name: '',
        description: '',
        rarity: 'Comum',
        weight: 0,
        quantity: 1
    })
    
    const [ weaponCategParam, setWeaponCategParam ] = useState<'Leve' | 'Pesada'>()
    const [ effectType, setEffectType ] = useState<DamageType>()

    const [ closed, setClosed ] = useState<boolean>(false)

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        setItem({})
        setWeaponCategParam(undefined)
        setEffectType(undefined)
        setClosed(false)
    }, [ closed ])

    useEffect(() => {
        setItem({})
    }, [ itemType ])

    function SelectForm(props: ComponentsProps['MuiSelect'] & {
        prop?: keyof MergedItems<'Leve' | 'Pesada'>,
        label?: string,
        noLabel?: boolean
    }): ReactElement {
        return (
            <FormControl sx={props?.sx}>
                <InputLabel id={props.prop}>{!props.noLabel && props.label}</InputLabel>
                <Select
                    labelId={props.prop ?? props.id}
                    id={(props.prop ?? props.id) + 'Select'}
                    value={(item[props.prop!] ?? props.value) || ''}
                    defaultValue={props?.defaultValue ?? ''}
                    onChange={props?.onChange ?? (e => { setItem(state => ({ ...state, [props.prop!]: e.target.value as any })) })}
                    input={props.input}
                    multiple={props.multiple}
                    renderValue={props.renderValue as any}
                    MenuProps={props.MenuProps}
                >
                    {props.children}
                </Select>
            </FormControl>
        )
    }

    function createItem(): void {
        const isDefaultFieldsFilledIn = !!(
            item.name && item.description &&
            item.rarity && item.kind &&
            item.weight && item.quantity
        )

        console.log(item, isDefaultFieldsFilledIn);
        
        try { 
            if (itemType === 'weapon') {
                setItem(state => ({ ...state, effect: { ...state.effect, effectType } as any }))

                const regex = /^(\d+d\d+)(\+\d+d\d+|\+\d+)*$/
                
                const isAllWeaponFieldsFilledIn = !!(
                    isDefaultFieldsFilledIn && item.range && item.categ &&
                    item.hit && item.ammo && item.accessories &&
                    item.bonus && item.effect?.value &&
                    item.effect?.critChance && item.effect?.critValue &&
                    item.effect?.kind && item.effect?.effectType
                )

                if (!regex.test(item.effect?.value ?? '') ?? !regex.test(item.effect?.critValue ?? '')) {
                    enqueueSnackbar('O dano da arma precisa começar com um dado! EX: 2d4', { variant: 'error', autoHideDuration: 3000 })
                } else {
                    if (!isAllWeaponFieldsFilledIn) {
                        item.categ += ` (${weaponCategParam})` as any
    
                        f.values.inventory.weapons = [ ...f.values.inventory.weapons, item as Weapon<'Leve' | 'Pesada'> ]
                        enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 })
                        setClosed(true)
                        onClose()
                    } else {
                        enqueueSnackbar('Preencha todos os campos!', { variant: 'error', autoHideDuration: 3000 })
                    }
                }
            } else if (itemType === 'armor') {
                const isAllArmorFieldsFilledIn = !!(
                    isDefaultFieldsFilledIn && item.categ &&
                    item.displacementPenalty && item.value
                )
                
                if (isAllArmorFieldsFilledIn) {
                    f.values.inventory.armors = [ ...f.values.inventory.armors, item as Armor ]
                    enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 })
                    setClosed(true)
                    onClose()
                }
            } else {
                if (isDefaultFieldsFilledIn) {
                    f.values.inventory.items = [ ...f.values.inventory.items, item as unknown as Item ]
                    enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 })
                    setClosed(true)
                    onClose()
                } else {
                    enqueueSnackbar('Preencha todos os campos!', { variant: 'error', autoHideDuration: 3000 })
                }
            }
            
            console.log(item)
        } catch (error: any) {
            enqueueSnackbar(`ERRO: ${error.message}`, { variant: 'error', autoHideDuration: 3000 })
        }
    }

    useEffect(() => {
        console.log(item);
    }, [ item ])

    return (
        <Box
            display='flex'
            flexDirection='column'
            width='100%'
            gap={2}
        >
            <Box
                display='flex'
                gap={2}
                component='form'
                onSubmit={e => { e.preventDefault(); createItem() }}
            >
                <TextField
                    label="Nome"
                    defaultValue={item.name}
                    onBlur={e => { setItem(state => ({ ...state, name: e.target.value })) }}
                    sx={{
                        width: '30%'
                    }}
                />
                <SelectForm
                    label='Raridade'
                    prop="rarity"
                    defaultValue='Comum'
                    sx={{
                        width: '20%'
                    }}
                >
                    {rarities.map(rarity => (
                        <MenuItem key={rarity} value={rarity}>{rarity}</MenuItem>
                    ))}
                </SelectForm>
                <TextField 
                    label="Descrição"
                    defaultValue={item.description}
                    onBlur={e => { setItem(state => ({ ...state, description: e.target.value })) }}
                    fullWidth
                />
            </Box>
            <Grid
                container
                display='flex'
                flexDirection={matches ? 'column' : 'row'}
                gap={2}
            >
                <SelectForm
                    label='Tipo'
                    prop="kind"
                    sx={{
                        width: '12%'
                    }}
                >
                    {itemType === 'weapon' ? weaponKind.map(kind => (
                        <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                    )) : itemType === 'armor' ? armorKind.map(kind => (
                        <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                    )) : itemKind.map(kind => (
                        <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                    ))}
                </SelectForm>
                {itemType !== 'item' && (
                    <SelectForm
                        label='Categoria'
                        prop="categ"
                        sx={{
                            width: '16%'
                        }}
                    >
                        {itemType === 'weapon' ? weaponCateg.map(categ => (
                            <MenuItem key={categ} value={categ}>{categ}</MenuItem>
                        )) : armorKind.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        ))}
                    </SelectForm>
                )}
                {itemType === 'weapon' && (
                    <>
                        <SelectForm
                            noLabel
                            id="weaponCategParam"
                            value={weaponCategParam}
                            onChange={e => { setWeaponCategParam(e.target.value as 'Leve' | 'Pesada') }}
                            sx={{
                                width: '10%',
                                ml: -1
                            }}
                        >
                            <MenuItem value='Leve'>Leve</MenuItem>
                            <MenuItem value='Pesada'>Pesada</MenuItem>
                        </SelectForm>
                        <SelectForm
                            label='Alcance'
                            prop="range"
                            sx={{
                                width: '15%'
                            }}
                        >
                            {ranges.map((range) => (
                                <MenuItem key={range} value={range}>{range}</MenuItem>
                            ))}
                        </SelectForm>
                        <SelectForm
                            label='Teste de Acerto'
                            prop="hit"
                            sx={{
                                width: '10%'
                            }}
                        >
                            {weaponHit.map((baseAttribute) => (
                                <MenuItem 
                                    key={baseAttribute} 
                                    value={baseAttribute}
                                >{baseAttribute.toUpperCase()}</MenuItem>
                            ))}
                        </SelectForm>
                        <SelectForm
                            label='Municão'
                            prop="ammo"
                            sx={{
                                width: '32%'
                            }}
                        >
                            <MenuItem value='Não consome'>Não consome</MenuItem>
                            <ListSubheader>Balísticas</ListSubheader>
                            {ballisticWeaponAmmo.map(ballisticAmmo => (
                                <MenuItem key={ballisticAmmo} value={ballisticAmmo}>{ballisticAmmo}</MenuItem>
                            ))}
                            <ListSubheader>Energia</ListSubheader>
                            {energyWeaponAmmo.map(energyAmmo => (
                                <MenuItem key={energyAmmo} value={energyAmmo}>{energyAmmo}</MenuItem>
                            ))}
                        </SelectForm>
                        <SelectForm
                            label='Acessórios'
                            prop="accessories"
                            defaultValue='Não possui acessórios'
                            MenuProps={MenuProps}
                            value={[ item.accessories ?? 'Não possui acessórios' ]}
                            multiple
                            sx={{
                                minWidth: '20%'
                            }}
                            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                            renderValue={(selected) => {
                                const s: string[] = selected as string[]
                                
                                return (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {s.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )
                            }}

                        >   
                            <MenuItem value='Não possui acessórios'>Não possui acessórios</MenuItem>
                            <ListSubheader>Científicos</ListSubheader>
                            {weaponScientificAccessories.map(acc => (
                                <MenuItem key={acc} value={acc}>{acc}</MenuItem>
                            ))}
                            <ListSubheader>Mágicos</ListSubheader>
                            {weaponMagicalAccessories.map(acc => (
                                <MenuItem key={acc} value={acc}>{acc}</MenuItem>
                            ))}
                        </SelectForm>
                        <SelectForm
                            label='Bônus ou Modificador'
                            prop="bonus"
                            sx={{
                                width: '15%'
                            }}
                        >
                            {weaponBonuses.map(bonus => (
                                <MenuItem key={bonus} value={bonus}>{bonus}</MenuItem>
                            ))}
                        </SelectForm>
                        <TextField
                            defaultValue={item.effect?.value}
                            label="Dano"
                            placeholder='EX: 2d4'
                            onBlur={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, value: e.target.value } })) }}
                            sx={{ width: '10%' }}
                        />
                        <TextField
                            defaultValue={item.effect?.critValue}
                            label="Dano Crítico"
                            placeholder='EX: 4d4'
                            onBlur={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, critValue: e.target.value } })) }}
                            sx={{ width: '10%' }}
                        />
                        <TextField
                            defaultValue={item.effect?.value}
                            label="Chance crítica"
                            type='number'
                            InputProps={{ inputProps: { min: 1, max: 20 } }}
                            placeholder='EX: 18'
                            onBlur={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, critChance: e.target.value } })) }}
                            sx={{ width: '10%' }}
                        />
                        <SelectForm
                            label='Tipo de Dano'
                            value={effectType}
                            onChange={e => { setEffectType(e.target.value as DamageType) } }
                            sx={{
                                width: '29.5%'
                            }}
                        >
                            {weaponDamageType.map(damageType => (
                                <MenuItem key={damageType} value={damageType}>{damageType}</MenuItem>
                            ))}
                        </SelectForm>
                    </>
                )}
                {itemType === 'armor' && (
                    <>
                        <SelectForm
                            label='Acessórios'
                            prop="accessories"
                            defaultValue='Não possui acessórios'
                            MenuProps={MenuProps}
                            value={[ item.accessories ?? 'Não possui acessórios' ]}
                            multiple
                            sx={{
                                minWidth: '20%'
                            }}
                            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                            renderValue={(selected) => {
                                const s: string[] = selected as string[]
                                
                                return (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {s.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )
                            }}

                        >   
                            <MenuItem value='Não possui acessórios'>Não possui acessórios</MenuItem>
                            <ListSubheader>Científicos</ListSubheader>
                            {armorScientificAccessories.map(acc => (
                                <MenuItem key={acc} value={acc}>{acc}</MenuItem>
                            ))}
                            <ListSubheader>Mágicos</ListSubheader>
                            {armorMagicalAccessories.map(acc => (
                                <MenuItem key={acc} value={acc}>{acc}</MenuItem>
                            ))}
                        </SelectForm>
                        <TextField 
                            label='Valor de AP'
                            type='number'
                            defaultValue={item.value ?? 0}
                            onBlur={e => { setItem(state => ({ ...state, value: Number(e.target.value) })) }}
                        />
                        <TextField 
                            label='Penalidade de Deslocamento'
                            type='number'
                            defaultValue={item.displacementPenalty ?? 0}
                            onBlur={e => { setItem(state => ({ ...state, displacementPenalty: Number(e.target.value) })) }}
                        />
                    </>
                )}
            </Grid>
            <Box
                display='flex'
                alignItems='center'
                gap={2}
                mt={3}
            >
                <TextField
                    label="Quantidade"
                    defaultValue={item.quantity ?? 1}
                    type='number'
                    onChange={e => { setItem(state => ({ ...state, quantity: Number(e.target.value) })) }}
                />
                <Box display='flex' alignItems='center' gap={1}>
                    <TextField
                        label="Peso"
                        type='number'
                        value={item.weight}
                        defaultValue={0}
                        onBlur={e => { setItem(state => ({ ...state, weight: Number(e.target.value) })) }}
                    />
                    <Typography variant='h6'>KG</Typography>
                    <Typography variant='h6'>x</Typography>
                    <Typography variant='h6'>{item.quantity ?? 1}</Typography>
                </Box>
                <Box width='100%' display='flex' justifyContent='flex-end' alignItems='flex-end'>
                    <Button type='submit' onClick={createItem} variant='contained' color={'terciary' as any}>Criar Item</Button>
                </Box>
            </Box>
        </Box>
    )
}