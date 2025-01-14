/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    type ComponentsProps,
    Select,
    Box,
    useTheme,
    Grid,
    Chip,
    OutlinedInput,
    ListSubheader,
    Button,
    type SxProps,
    FormHelperText
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { MenuItem } from '@mui/material';
import { TextField } from '@mui/material';
import { FormControl, InputLabel } from '@mui/material';
import type { Ficha, MergedItems } from '@types';
import { type Dispatch, type SetStateAction, type ReactElement, useState } from 'react';
import { type SubmitHandler, useForm, type UseFormRegister, type FieldErrors, type UseFormGetValues, UseFormProps, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
    armorKind,
    armorMagicalAccessories,
    armorScientificAccessories,
    ballisticWeaponAmmo,
    damages,
    energyWeaponAmmo,
    ranges,
    rarities,
    weaponBonuses,
    weaponCateg,
    weaponHit,
    weaponKind,
    weaponMagicalAccessories,
    weaponScientificAccessories
} from '@constants/dataTypes';

import { Typography } from '@mui/material';
import { type FormikContextType } from '@node_modules/formik/dist';
import { useSnackbar } from '@node_modules/notistack';

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

const defaultValidationSchema = {
    name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
    rarity: z.string().min(1, { message: 'Raridade é obrigatória' }).default('Comum'),
    description: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
    weight: z.coerce.number().min(0, { message: 'Peso é obrigatório' }),
    kind: z.string().min(1, { message: 'Tipo é obrigatório' }).default('Padrão'),
    quantity: z.coerce.number().min(1, { message: 'Quantidade deve ser maior que 0' })
};

interface ModalProps { 
    closeModal: () => void
    formik: FormikContextType<Ficha>;
}

function SelectFormComponent(
    props: ComponentsProps['MuiSelect'] & {
        prop?: keyof MergedItems<'Leve' | 'Pesada'>;
        label?: string;
        noLabel?: boolean;
        item?: MergedItems<any>;
        setItem?: Dispatch<SetStateAction<MergedItems<any>>>;
        selectStyle?: SxProps;
        helperText?: string;
    }
): ReactElement {
    return (
        <FormControl sx={props?.sx}>
            <InputLabel sx={{ color: props.error ? 'error.main' : '' }} id={props.prop}>{!props.noLabel && props.label}</InputLabel>
            <Select
                {...props}
                sx={props.selectStyle}
                labelId={props.prop ?? props.id}
                id={(props.prop ?? props.id) + 'Select'}
                // value={(props.item?.[props.prop!] ?? props.value) || ''}
                defaultValue={props?.defaultValue ?? ''}
                onChange={props?.onChange ?? (e => { props.setItem?.(state => ({ ...state, [props.prop!]: e.target.value as any })) })}
                input={props.input}
                multiple={props.multiple}
                renderValue={props.renderValue as any}
                MenuProps={props.MenuProps}
            >
                {props.children}
            </Select>
            { props.helperText && <FormHelperText sx={{ color: props.error ? 'error.main' : '' }}>{props.helperText}</FormHelperText>}
        </FormControl>
    );
}

function ItemModalForm({
    form,
    action,
    children
}: {
    form: UseFormReturn<any, any>;
    action: (data: z.infer<any>) => void;
    children: ReactElement
}): ReactElement {
    const { register, handleSubmit, formState: { errors }, getValues } = form;

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    // TODO: Arrumar fomulário no celular
    return (
        <>
            <Box display={!matches ? 'flex' : 'column'} gap={2} component='form' noValidate onSubmit={handleSubmit(action)}>
                <TextField
                    label='Nome'
                    {...register('name')}
                    error={errors?.['name'] && true}
                    helperText={errors?.['name']?.message?.toString()}
                    sx={{
                        width: '30%'
                    }}
                />
                <SelectFormComponent
                    label='Raridade'
                    {...register('rarity')}
                    defaultValue='Comum'
                    error={errors?.['rarity'] && true}
                    helperText={errors?.['rarity']?.message?.toString()}
                    sx={{
                        width: '20%'
                    }}>
                    {rarities.map(rarity => (
                        <MenuItem key={rarity} value={rarity}>
                            {rarity}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <TextField 
                    label='Descrição' 
                    {...register('description')} 
                    error={errors?.['description'] && true}
                    helperText={errors?.['description']?.message?.toString()}
                    fullWidth
                />
            </Box>
            {children}
            <Box display='flex' alignItems='center' gap={2} mt={3}>
                <TextField 
                    label='Quantidade' 
                    type='number' 
                    {...register('quantity')}
                    error={errors?.['quantity'] && true}
                    helperText={errors?.['quantity']?.message?.toString()}
                />
                <Box display='flex' alignItems='center' gap={1}>
                    <TextField 
                        label='Peso' 
                        type='number' 
                        {...register('weight')}
                        error={errors?.['weight'] && true}
                        helperText={errors?.['weight']?.message?.toString()}
                    />
                    <Typography variant='h6'>KG</Typography>
                    <Typography variant='h6'>x</Typography>
                    <Typography variant='h6'>{getValues('quantity')}</Typography>
                </Box>
                <Box width='100%' display='flex' justifyContent='flex-end' alignItems='flex-end'>
                    <Button
                        onClick={handleSubmit(action)}
                        type='submit'
                        variant='contained'
                        color={'terciary' as any}
                    >
                        Criar Item
                    </Button>
                </Box>
            </Box>
        </>
    );
}

function WeaponModal({ closeModal, formik }: ModalProps): ReactElement {
    const { enqueueSnackbar } = useSnackbar()
    const validationSchema = z.object({
        ...defaultValidationSchema,
        ammo: z.string().min(1, { message: 'Munição é obrigatória' }).default('Não consome'),
        categ: z.string().min(1, { message: 'Categoria de arma é obrigatória' }),
        bonus: z.string().min(1, { message: 'Bonus de arma é obrigatória' }),
        hit: z.string().min(1, { message: 'Dano de arma é obrigatório' }),
        range: z.string().min(1, { message: 'Alcance é obrigatório' }),
        accessories: z.string({ required_error: 'Este campo é obrigatório' }).array(),
        effect: z.object({
            effectType: z.string().min(1, { message: 'Tipo de dano é obrigatório' }),
            critChance: z.coerce.number()
                .min(0, { message: 'Chance crítica deve ser maior ou igual a 0' })
                .max(20, { message: 'Chance crítica deve ser menor ou igual a 20' }),
            critValue: z.string()
                .min(1, { message: 'Dano crítico é obrigatório' })
                .regex(/^(?:\d+d(?:\d+)(?:[-+]\d+)?)$/i, { message: 'Formato de dano deve ser XdY(+/-Z)' }),
            value: z.string()
                .min(1, { message: 'Dano é obrigatório' })
                .regex(/^(?:\d+d(?:\d+)(?:[-+]\d+)?)$/i, { message: 'Formato de dano deve ser XdY(+/-Z)' })
        })
    });

    type WeaponFormFields = z.infer<typeof validationSchema>;

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    const [ weaponCategParam, setWeaponCategParam ] = useState<'Leve' | 'Pesada'>();

    const form = useForm<WeaponFormFields>({
        defaultValues: {
            name: '',
            description: '',
            rarity: 'Comum',
            weight: 0,
            quantity: 1,
            accessories: [ 'Não possui acessórios' ],
            ammo: 'Não consome'
        },
        resolver: zodResolver(validationSchema)
    });

    const { register, formState: { errors, touchedFields } } = form;

    const create = (data: WeaponFormFields) => {
        formik.setFieldValue('inventory.weapons', [ ...formik.values.inventory.weapons, data ]);
        enqueueSnackbar(`${data.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 });
        closeModal();
    };

    return (
        <ItemModalForm
            form={form}
            action={create}
        >
            <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                <SelectFormComponent
                    label='Tipo'
                    prop='kind'
                    defaultValue='Padrão'
                    {...register('kind')}
                    error={errors?.['kind'] && true}
                    helperText={errors?.['kind']?.message?.toString()}
                    sx={{
                        width: '12%'
                    }}>
                    {weaponKind.map(kind => (
                        <MenuItem key={kind} value={kind}>
                            {kind}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
                    label='Categoria'
                    prop='categ'
                    {...register('categ')}
                    error={errors?.['categ'] && true}
                    helperText={errors?.['categ']?.message?.toString()}
                    sx={{
                        width: '16%'
                    }}>
                    {weaponCateg.map(categ => (
                        <MenuItem key={categ} value={categ}>
                            {categ}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
                    noLabel
                    id='weaponCategParam'
                    value={weaponCategParam}
                    error={(touchedFields.categ && !weaponCategParam) && true}
                    helperText={(touchedFields.categ && !weaponCategParam) ? 'Tipo é obrigatório' : ''}
                    onChange={e => {
                        setWeaponCategParam(e.target.value as 'Leve' | 'Pesada');
                    }}
                    sx={{
                        width: '10%',
                        ml: -1
                    }}>
                    <MenuItem value='Leve'>Leve</MenuItem>
                    <MenuItem value='Pesada'>Pesada</MenuItem>
                </SelectFormComponent>
                <SelectFormComponent
                    label='Alcance'
                    prop='range'
                    {...register('range')}
                    error={errors?.['range'] && true}
                    helperText={errors?.['range']?.message?.toString()}
                    sx={{
                        width: '15%'
                    }}>
                    {ranges.map(range => (
                        <MenuItem key={range} value={range}>
                            {range}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
                    label='Teste de Acerto'
                    prop='hit'
                    {...register('hit')}
                    error={errors?.['hit'] && true}
                    helperText={errors?.['hit']?.message?.toString()}
                    sx={{
                        width: '10%'
                    }}>
                    {weaponHit.map(baseAttribute => (
                        <MenuItem key={baseAttribute} value={baseAttribute}>
                            {baseAttribute.toUpperCase()}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
                    label='Municão'
                    prop='ammo'
                    {...register('ammo')}
                    error={errors?.['ammo'] && true}
                    helperText={errors?.['ammo']?.message?.toString()}
                    defaultValue='Não consome'
                    sx={{
                        width: '32%'
                    }}>
                    <MenuItem value='Não consome'>Não consome</MenuItem>
                    <ListSubheader>Balísticas</ListSubheader>
                    {ballisticWeaponAmmo.map(ballisticAmmo => (
                        <MenuItem key={ballisticAmmo} value={ballisticAmmo}>
                            {ballisticAmmo}
                        </MenuItem>
                    ))}
                    <ListSubheader>Energia</ListSubheader>
                    {energyWeaponAmmo.map(energyAmmo => (
                        <MenuItem key={energyAmmo} value={energyAmmo}>
                            {energyAmmo}
                        </MenuItem>
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
                    {...register('accessories')}
                    error={errors?.['accessories'] && true}
                    helperText={errors?.['accessories']?.message?.toString()}
                    sx={{
                        minWidth: '20%'
                    }}
                    input={<OutlinedInput id='select-multiple-chip' label='Chip' />}
                    renderValue={(selected) =>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map(value => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    }
                >
                    <MenuItem value='Não possui acessórios'>Não possui acessórios</MenuItem>
                    <ListSubheader>Científicos</ListSubheader>
                    {weaponScientificAccessories.map(acc => (
                        <MenuItem key={acc} value={acc}>
                            {acc}
                        </MenuItem>
                    ))}
                    <ListSubheader>Mágicos</ListSubheader>
                    {weaponMagicalAccessories.map(acc => (
                        <MenuItem key={acc} value={acc}>
                            {acc}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
                    label='Bônus para Acerto'
                    prop='bonus'
                    {...register('bonus')}
                    error={errors?.['bonus'] && true}
                    helperText={errors?.['bonus']?.message?.toString()}
                    sx={{
                        width: '15%'
                    }}>
                    {weaponBonuses.map(bonus => (
                        <MenuItem key={bonus} value={bonus}>
                            {bonus}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <TextField
                    label='Dano'
                    {...register('effect.value')}
                    error={errors?.effect?.value && true}
                    helperText={errors?.effect?.value?.message?.toString()}
                    placeholder='EX: 2d4'
                    sx={{ width: '10%' }}
                />
                <TextField
                    label='Dano Crítico'
                    {...register('effect.critValue')}
                    error={errors?.effect?.critValue && true}
                    helperText={errors?.effect?.critValue?.message?.toString()}
                    placeholder='EX: 4d4'
                    sx={{ width: '10%' }}
                />
                <TextField
                    label='Chance crítica'
                    type='number'
                    {...register('effect.critChance')}
                    error={errors?.effect?.critChance && true}
                    helperText={errors?.effect?.critChance?.message?.toString()}
                    placeholder='EX: 18'
                    sx={{ width: '10%' }}
                />
                <SelectFormComponent
                    label='Tipo de Dano'
                    {...register('effect.effectType')}
                    error={errors?.effect?.effectType && true}
                    helperText={errors?.effect?.effectType?.message?.toString()}
                    sx={{
                        width: '29.5%'
                    }}>
                    {damages.map(damageType => (
                        <MenuItem key={damageType} value={damageType}>
                            {damageType}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
            </Grid>
        </ItemModalForm>
    );
}

function ArmorModal({ closeModal, formik }: ModalProps): ReactElement {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    const validationSchema = z.object({
        ...defaultValidationSchema,
        categ: z.string().min(1, { message: 'Categoria é obrigatória' }),
        value: z.coerce.number().min(1, { message: 'Valor de AP é obrigatório' }).max(100, { message: 'Valor deve ser menor ou igual a 100' }),
        displacementPenalty: z.coerce.number().min(1, { message: 'Penalidade de Deslocamento é obrigatório' }).max(100, { message: 'Penalidade deve ser menor ou igual a 100' }),
        accessories: z.string().min(1, { message: 'Acessórios é obrigatório' }).array()
    });

    type ArmorFormFields = z.infer<typeof validationSchema>;

    const form = useForm<ArmorFormFields>({
        defaultValues: {
            name: '',
            description: '',
            weight: 0,
            quantity: 1,
            accessories: [ 'Não possui acessórios' ]
        },
        resolver: zodResolver(validationSchema)
    });

    const { register, formState: { errors } } = form

    const create = (data: ArmorFormFields) => {
        formik.setFieldValue('inventory.armors', [ ...formik.values.inventory.armors, data ]);
        enqueueSnackbar(`${data.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 });
        closeModal();
    }

    return (
        <ItemModalForm
            form={form}
            action={create}
        >
            <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                <SelectFormComponent
                    label='Tipo'
                    prop='kind'
                    defaultValue='Padrão'
                    {...register('kind')}
                    error={errors?.['kind'] && true}
                    helperText={errors?.['kind']?.message?.toString()}
                    sx={{
                        width: '12%'
                    }}>
                    {armorKind.map(kind => (
                        <MenuItem key={kind} value={kind}>
                            {kind}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <SelectFormComponent
                    label='Categoria'
                    id='armorCategParam'
                    {...register('categ')}
                    error={errors?.['categ'] && true}
                    helperText={errors?.['categ']?.message?.toString()}
                    sx={{
                        width: '10%',
                        ml: -1
                    }}>
                    <MenuItem value='Leve'>Leve</MenuItem>
                    <MenuItem value='Pesada'>Pesada</MenuItem>
                </SelectFormComponent>
                <SelectFormComponent
                    label='Acessórios'
                    prop='accessories'
                    defaultValue={[ 'Não possui acessórios' ]}
                    MenuProps={MenuProps}
                    {...register('accessories')}
                    error={errors?.['accessories'] && true}
                    helperText={errors?.['accessories']?.message?.toString()}
                    multiple
                    sx={{
                        minWidth: '20%'
                    }}
                    input={<OutlinedInput id='select-multiple-chip' label='Chip' />}
                    renderValue={selected => {
                        const s: string[] = selected as string[];

                        return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {s?.map(value => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        );
                    }}>
                    <MenuItem value='Não possui acessórios'>Não possui acessórios</MenuItem>
                    <ListSubheader>Científicos</ListSubheader>
                    {armorScientificAccessories.map(acc => (
                        <MenuItem key={acc} value={acc}>
                            {acc}
                        </MenuItem>
                    ))}
                    <ListSubheader>Mágicos</ListSubheader>
                    {armorMagicalAccessories.map(acc => (
                        <MenuItem key={acc} value={acc}>
                            {acc}
                        </MenuItem>
                    ))}
                </SelectFormComponent>
                <TextField 
                    label='Valor de AP' 
                    type='number' 
                    {...register('value')}
                    error={errors?.['value'] && true}
                    helperText={errors?.['value']?.message?.toString()}
                />
                <TextField
                    label='Penalidade de Deslocamento' 
                    type='number' 
                    {...register('displacementPenalty')}
                    error={errors?.['displacementPenalty'] && true}
                    helperText={errors?.['displacementPenalty']?.message?.toString()}
                />
            </Grid>
        </ItemModalForm>
    );
}

function ItemModal({ formik, closeModal }: ModalProps): ReactElement {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    const validationSchema = z.object({
        ...defaultValidationSchema,
        effects: z.coerce.string()
            .min(1, { message: 'Efeitos/Descrição é obrigatório' })
            .default(''),
        level: z.coerce.number().optional()
    });

    type ItemFormFields = z.infer<typeof validationSchema>;

    const form = useForm<ItemFormFields>({
        defaultValues: {
            name: '',
            description: '',
            weight: 0,
            quantity: 1
        },
        resolver: zodResolver(validationSchema)
    });

    const { register, formState: { errors } } = form

    const create = async (data: ItemFormFields): Promise<void> => {
        data.effects = [ data.effects ] as unknown as string;
        formik.setFieldValue('inventory.items', [ ...formik.values.inventory.items, data ]);

        enqueueSnackbar(`${data.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 });

        closeModal();
    }

    return (
        <ItemModalForm
            form={form}
            action={create}
        >
            <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                <TextField 
                    label='Nível' 
                    type='number' 
                    {...register('level')}
                    error={errors?.['level'] && true}
                    helperText={errors?.['level']?.message?.toString()}
                />
                <TextField 
                    label='Efeitos/Descrição' 
                    type='text' 
                    {...register('effects')}
                    error={errors?.['effects'] && true}
                    helperText={errors?.['effects']?.message?.toString()}
                />
            </Grid>            
        </ItemModalForm>
    );
}

export { WeaponModal, ArmorModal, ItemModal };