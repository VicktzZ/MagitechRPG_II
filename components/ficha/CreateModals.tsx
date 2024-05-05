import { type ComponentsProps, Select, Box, useTheme, Grid, Chip, OutlinedInput, ListSubheader, Button, type SxProps } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { MenuItem } from '@mui/material';
import { TextField } from '@mui/material';
import { FormControl, InputLabel } from '@mui/material';
import type { MergedItems } from '@types';
import { type Dispatch, type SetStateAction, type ReactElement, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { 
    ballisticWeaponAmmo,
    energyWeaponAmmo,
    ranges,
    rarities,
    weaponBonuses,
    weaponCateg,
    weaponDamageType,
    weaponHit,
    weaponKind,
    weaponMagicalAccessories,
    weaponScientificAccessories 
} from '@constants/dataTypes';
import { Typography } from '@mui/material';

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

function SelectFormComponent(props: ComponentsProps['MuiSelect'] & {
    prop?: keyof MergedItems<'Leve' | 'Pesada'>,
    label?: string,
    noLabel?: boolean,
    item?: MergedItems<any>
    setItem?: Dispatch<SetStateAction<MergedItems<any>>>
    selectStyle?: SxProps
}): ReactElement {
    return (
        <FormControl sx={props?.sx}>
            <InputLabel id={props.prop}>{!props.noLabel && props.label}</InputLabel>
            <Select
                {...props}
                sx={props.selectStyle}
                // labelId={props.prop ?? props.id}
                // id={(props.prop ?? props.id) + 'Select'}
                // value={(props.item[props.prop!] ?? props.value) || ''}
                // defaultValue={props?.defaultValue ?? ''}
                // onChange={props?.onChange ?? (e => { props.setItem(state => ({ ...state, [props.prop!]: e.target.value as any })) })}
                // input={props.input}
                // multiple={props.multiple}
                // renderValue={props.renderValue as any}
                // MenuProps={props.MenuProps}
            >
                {props.children}
            </Select>
        </FormControl>
    );
}

function WeaponModal(): ReactElement {
    const validationSchema = z.object({
        name: z.string({ required_error: 'Este campo é obrigatório' }),
        rarity: z.string(),
        description: z.string(),
        ammo: z.string(),
        kind: z.string(),
        bonus: z.string(),
        categ: z.string(),
        hit: z.string(),
        range: z.string(),
        weight: z.number(),
        quantity: z.number(),
        accessories: z.string({ required_error: 'Este campo é obrigatório' }).array(),
        effect: z.object({
            kind: z.string(),
            effectType: z.string(),
            critValue: z.string(),
            critChance: z.string(),
            value: z.string()
        })
    });

    type WeaponFormFields = z.infer<typeof validationSchema>

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    const [ weaponCategParam, setWeaponCategParam ] = useState<'Leve' | 'Pesada'>();

    const { register, handleSubmit, formState: { errors }, getValues } = useForm<WeaponFormFields>({
        defaultValues: {
            name: '',
            description: '',
            weight: 0,
            quantity: 1,
            accessories: [ 'Não possui acessórios' ]
        },
        resolver: zodResolver(validationSchema)
    });

    const onSubmit: SubmitHandler<WeaponFormFields> = (data): void => {
        console.log(data);
        console.log(errors);
    };

    return (
        <>
            <Box
                display='flex'
                gap={2}
                component='form'
                onSubmit={handleSubmit(onSubmit)}
            >
                <TextField
                    label="Nome"
                    inputProps={register('name')}
                    error={errors?.name && true}
                    helperText={errors.name?.message}
                    sx={{
                        width: '30%'
                    }}
                />
                <SelectFormComponent
                    label='Raridade'
                    inputProps={register('rarity')}
                    defaultValue='Comum'
                    sx={{
                        width: '20%'
                    }}
                >
                    {rarities.map(rarity => (
                        <MenuItem key={rarity} value={rarity}>{rarity}</MenuItem>
                    ))}
                </SelectFormComponent>
                <TextField 
                    label="Descrição"
                    inputProps={register('description')}
                    fullWidth
                />
            </Box>
            <Grid
                container
                display='flex'
                flexDirection={matches ? 'column' : 'row'}
                gap={2}
            >
                <SelectFormComponent
                    label='Tipo'
                    prop="kind"
                    sx={{
                        width: '12%'
                    }}
                >
                    {
                        weaponKind.map(kind => (
                            <MenuItem key={kind} value={kind}>{kind}</MenuItem>
                        ))
                    }
                </SelectFormComponent>
                <SelectFormComponent
                    label='Categoria'
                    prop="categ"
                    sx={{
                        width: '16%'
                    }}
                >
                    {
                        weaponCateg.map(categ => (
                            <MenuItem key={categ} value={categ}>{categ}</MenuItem>
                        ))
                    }
                </SelectFormComponent>
                <SelectFormComponent
                    noLabel
                    id="weaponCategParam"
                    value={weaponCategParam}
                    onChange={e => { setWeaponCategParam(e.target.value as 'Leve' | 'Pesada'); }}
                    sx={{
                        width: '10%',
                        ml: -1
                    }}
                >
                    <MenuItem value='Leve'>Leve</MenuItem>
                    <MenuItem value='Pesada'>Pesada</MenuItem>
                </SelectFormComponent>
                <SelectFormComponent
                    label='Alcance'
                    prop="range"
                    sx={{
                        width: '15%'
                    }}
                >
                    {ranges.map((range) => (
                        <MenuItem key={range} value={range}>{range}</MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
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
                </SelectFormComponent>
                <SelectFormComponent
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
                    <ListSubheader>Outros</ListSubheader>
                    <MenuItem value='Flechas'>Flechas</MenuItem>
                    <MenuItem value='Dardos'>Dardos</MenuItem>
                    <MenuItem value='Pedras'>Pedras</MenuItem>
                </SelectFormComponent>
                <SelectFormComponent
                    label='Acessórios'
                    defaultValue={[ 'Não possui acessórios' ]}
                    MenuProps={MenuProps}
                    multiple
                    sx={{
                        minWidth: '20%'
                    }}
                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                    renderValue={(selected) => {
                        const s: string[] = selected as string[];
                        
                        return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {s.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        );
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
                </SelectFormComponent>
                <SelectFormComponent
                    label='Bônus para Acerto'
                    prop="bonus"
                    inputProps={register('hit')}
                    sx={{
                        width: '15%'
                    }}
                >
                    {weaponBonuses.map(bonus => (
                        <MenuItem key={bonus} value={bonus}>{bonus}</MenuItem>
                    ))}
                </SelectFormComponent>
                <TextField
                    label="Dano"
                    inputProps={register('effect.value')}
                    placeholder='EX: 2d4'
                    sx={{ width: '10%' }}
                />
                <TextField
                    label="Dano Crítico"
                    inputProps={register('effect.critValue')}
                    placeholder='EX: 4d4'
                    sx={{ width: '10%' }}
                />
                <TextField
                    label="Chance crítica"
                    type='number'
                    inputProps={register('effect.critChance')}
                    placeholder='EX: 18'
                    sx={{ width: '10%' }}
                />
                <SelectFormComponent
                    label='Tipo de Dano'
                    inputProps={register('effect.effectType')}
                    sx={{
                        width: '29.5%'
                    }}
                >
                    {weaponDamageType.map(damageType => (
                        <MenuItem key={damageType} value={damageType}>{damageType}</MenuItem>
                    ))}
                </SelectFormComponent>
                {/* {itemType === 'armor' && (
                    <>
                        <SelectFormComponent
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
                        </SelectFormComponent>
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
                )} */}
            </Grid>
            <Box
                display='flex'
                alignItems='center'
                gap={2}
                mt={3}
            >
                <TextField
                    label="Quantidade"
                    type='number'
                    inputProps={register('quantity')}
                />
                <Box display='flex' alignItems='center' gap={1}>
                    <TextField
                        label="Peso"
                        type='number'
                        inputProps={register('weight')}
                    />
                    <Typography variant='h6'>KG</Typography>
                    <Typography variant='h6'>x</Typography>
                    <Typography variant='h6'>{getValues('quantity')}</Typography>
                </Box>
                <Box width='100%' display='flex' justifyContent='flex-end' alignItems='flex-end'>
                    <Button 
                        type='submit' 
                        onClick={handleSubmit(onSubmit)} 
                        variant='contained' 
                        color={'terciary' as any}
                    >Criar Item</Button>
                </Box>
            </Box>
            {/* <pre>{JSON.stringify(getValues(), null, 2)}</pre> */}
        </>
    );
}

function ArmorModal(): ReactElement {
    return (
        <></>
    );
}

function ItemModal(): ReactElement {
    return (
        <></>
    );
}

export { WeaponModal, ArmorModal, ItemModal };