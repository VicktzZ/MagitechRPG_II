import { InputLabel, MenuItem, Select, TextField, Box, FormControl, Typography, Grid, type ComponentsProps, ListSubheader, useMediaQuery, Button } from '@mui/material'
import { type ReactElement } from 'react'
import type { Armor, Ficha, Item, MergedItems, Weapon } from '@types'
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
    weaponDamageType 
} from '@constants/dataTypes'
import { useSnackbar } from 'notistack'

export default function ItemModal({ 
    item,
    setItem,
    itemType,
    onClose
}: {
    item: Partial<MergedItems<'Leve' | 'Pesada'>>,
    setItem: React.Dispatch<React.SetStateAction<Partial<MergedItems<'Leve' | 'Pesada'>>>>
    itemType: 'weapon' | 'armor' | 'item',
    onClose: () => void
}): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const f: FormikContextType<Ficha> = useFormikContext()

    const { enqueueSnackbar } = useSnackbar()

    function SelectForm(props: ComponentsProps['MuiSelect'] & {
        prop: keyof MergedItems<'Leve' | 'Pesada'>,
        label: string,
        noLabel?: boolean
    }): ReactElement {
        return (
            <FormControl sx={props?.sx}>
                <InputLabel id={props.prop}>{!props.noLabel && props.label}</InputLabel>
                <Select
                    labelId={props.prop}
                    id={props.prop + 'Select'}
                    value={item[props.prop] ?? props.value}
                    onChange={props?.onChange ?? (e => { setItem(state => ({ ...state, [props.prop]: e.target.value as any })) })}
                >
                    {props.children}
                </Select>
            </FormControl>
        )
    }

    function createItem(): void {
        try {    
            if (itemType === 'weapon') {
                f.initialValues.inventory.weapons = [ ...f.initialValues.inventory.weapons, item as Weapon<'Leve' | 'Pesada'> ]
            }

            if (itemType === 'armor') {
                f.initialValues.inventory.armors = [ ...f.initialValues.inventory.armors, item as unknown as Armor ]
            } else {
                f.initialValues.inventory.items = [ ...f.initialValues.inventory.items, item as unknown as Item ]
            }
            
            enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 })
            onClose()
        } catch (error: any) {
            enqueueSnackbar(`ERRO: ${error.message}`, { variant: 'error', autoHideDuration: 3000 })
            onClose()
        }
    }

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
            >
                <TextField
                    label="Nome"
                    value={item.name}
                    onChange={e => { setItem(state => ({ ...state, name: e.target.value })) }}
                    sx={{
                        width: '30%'
                    }}
                />
                <SelectForm
                    label='Raridade'
                    prop="rarity"
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
                    value={item.description}
                    onChange={e => { setItem(state => ({ ...state, description: e.target.value })) }}
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
                {itemType === 'weapon' && (
                    <>
                        <SelectForm
                            label='Arma'
                            prop="kind"
                            noLabel
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
                            label='Atributo base'
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
                            multiple
                            sx={{
                                width: '20%'
                            }}
                        >   
                            <MenuItem value=''>Nenhum</MenuItem>
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
                            value={item.effect?.value}
                            label="Dano"
                            placeholder='EX: 2d4'
                            onChange={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, value: e.target.value } })) }}
                            sx={{ width: '10%' }}
                        />
                        <TextField
                            value={item.effect?.critValue}
                            label="Dano Crítico"
                            placeholder='EX: 4d4'
                            onChange={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, critValue: e.target.value } })) }}
                            sx={{ width: '10%' }}
                        />
                        <TextField
                            value={item.effect?.value}
                            label="Chance crítica"
                            type='number'
                            placeholder='EX: 18'
                            onChange={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, critChance: e.target.value } })) }}
                            sx={{ width: '10%' }}
                        />
                        <SelectForm
                            label='Tipo de Dano'
                            prop="effect"
                            value={item.effect?.effectType}
                            onChange={e => { setItem((state: any) => ({ ...state, effect: { ...state.effect, effectType: e.target.value } })) }}
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
            </Grid>
            <Box
                display='flex'
                alignItems='center'
                gap={2}
                mt={3}
            >
                <TextField
                    label="Quantidade"
                    value={item.quantity}
                    defaultValue={1}
                    type='number'
                    onChange={e => { setItem(state => ({ ...state, quantity: Number(e.target.value) })) }}
                />
                <Box display='flex' alignItems='center' gap={1}>
                    <TextField
                        label="Peso"
                        type='number'
                        value={item.weight}
                        defaultValue={0}
                        onChange={e => { setItem(state => ({ ...state, weight: Number(e.target.value) })) }}
                    />
                    <Typography variant='h6'>KG</Typography>
                </Box>
                <Box width='100%' display='flex' justifyContent='flex-end' alignItems='flex-end'>
                    <Button onClick={createItem} variant='contained' color={'terciary' as any}>Criar Item</Button>
                </Box>
            </Box>
        </Box>
    )
}