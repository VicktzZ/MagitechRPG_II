import { toastDefault } from '@constants';
import { weaponCateg, weaponKind, weaponMagicalAccessories, weaponScientificAccessories, damages } from '@constants/dataTypes';
import { Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';
import { FormMultiSelect, FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions, type ItemFormData } from './InventoryCreateModalWrapper';

interface WeaponFormFields extends ItemFormData {
    kind: string;
    categ: string;
    accessories: string[];
    bonus: {
        dex: number;
        str: number;
        weakpoint: number;
    };
    damage: {
        dices: number;
        sides: number;
        mod: number;
    };
    criticalDamage: string;
    damageType: string;
    hit: string;
    // Campo auxiliar para compor WeaponType quando for Arremessável
    throwableRange?: '3m' | '9m' | '18m' | '30m' | '90m' | 'Visível' | 'Ilimitado';
};

export const InventoryCreateWeaponModal = memo(({ action }: { action: () => void }): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    const formContext = useFormContext<WeaponFormFields>();
    const { register, formState: { errors }, watch } = formContext;
    
    // Memoizar as opções para os selects
    const weaponKindOptions = useMemo(() => mapArrayToOptions(weaponKind), []);
    const weaponCategoryOptions = useMemo(() => mapArrayToOptions(weaponCateg), []);
    const damageTypeOptions = useMemo(() => mapArrayToOptions(damages), []);
    const throwableRangeOptions = useMemo(() => mapArrayToOptions([ '3m', '9m', '18m', '30m', '90m', 'Visível', 'Ilimitado' ]), []);
    
    // Memoizar as opções de acessórios agrupadas
    const accessoriesOptions = useMemo(() => [
        { header: 'Geral', options: [ { value: 'Não possui acessórios', label: 'Não possui acessórios' } ] },
        { header: 'Científicos', options: mapArrayToOptions(weaponScientificAccessories) },
        { header: 'Mágicos', options: mapArrayToOptions(weaponMagicalAccessories) }
    ], []);

    const create = useCallback((data: ItemFormData) => {
        const w = data as unknown as WeaponFormFields;
        const composedKind = w.kind === 'Arremessável' && w.throwableRange
            ? `Arremessável (${w.throwableRange})`
            : w.kind;

        // Caso futuramente seja necessário enviar o objeto, já deixamos o valor composto
        const payload = { ...w, kind: composedKind } as WeaponFormFields;

        enqueueSnackbar(`${payload.name} criado com sucesso!`, toastDefault('itemCreated', 'success'));
        action();
    }, [ enqueueSnackbar, action ]);

    return (
        <InventoryCreateModalWrapper onSubmit={create} submitLabel='Criar Arma'>
            <Stack spacing={2}>
                {/* Seção: Classificação */}
                <Stack>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Classificação</Typography>
                    <Stack direction={matches ? 'column' : 'row'} spacing={2}>
                        <FormSelect
                            name='kind'
                            label='Tipo'
                            registration={register('kind')}
                            error={errors?.kind as any}
                            options={weaponKindOptions}
                            defaultValue='Padrão'
                            sx={{ minWidth: matches ? '100%' : '20%' }}
                        />
                        {/* Quando o tipo for Arremessável, exibe seletor de alcance (ThrowableRangeType) */}
                        {watch('kind') === 'Arremessável' && (
                            <FormSelect
                                name='throwableRange'
                                label='Alcance'
                                registration={register('throwableRange')}
                                error={errors?.throwableRange as any}
                                options={throwableRangeOptions}
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                            />
                        )}
                        <FormSelect
                            name='categ'
                            label='Categoria'
                            registration={register('categ')}
                            error={errors?.categ as any}
                            options={weaponCategoryOptions}
                            sx={{ minWidth: matches ? '100%' : '20%' }}
                        />
                        <FormMultiSelect
                            name='accessories'
                            label='Acessórios'
                            registration={register('accessories')}
                            error={errors?.accessories as any}
                            options={accessoriesOptions}
                            hasGroups={true}
                            defaultValue={[ 'Não possui acessórios' ]}
                            sx={{ minWidth: matches ? '100%' : '30%' }}
                        />
                    </Stack>
                </Stack>

                {/* Seção: Bônus */}
                <Stack>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Bônus</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormTextField 
                                name='bonus.dex'
                                label='Destreza' 
                                type='number' 
                                registration={register('bonus.dex')}
                                error={errors?.bonus as any}
                                placeholder='Ex: +1'
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormTextField 
                                name='bonus.str'
                                label='Força' 
                                type='number' 
                                registration={register('bonus.str')}
                                error={errors?.bonus as any}
                                placeholder='Ex: +2'
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormTextField 
                                name='bonus.weakpoint'
                                label='Ponto fraco' 
                                type='number' 
                                registration={register('bonus.weakpoint')}
                                error={errors?.bonus as any}
                                placeholder='Ex: +1'
                            />
                        </Grid>
                    </Grid>
                </Stack>

                {/* Seção: Dano */}
                <Stack>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Dano</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormTextField 
                                name='damage.dices'
                                label='Qtd. de dados' 
                                type='number' 
                                registration={register('damage.dices')}
                                error={errors?.damage as any}
                                placeholder='Ex: 1'
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormTextField 
                                name='damage.sides'
                                label='Lados' 
                                type='number' 
                                registration={register('damage.sides')}
                                error={errors?.damage as any}
                                placeholder='Ex: 6'
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormTextField 
                                name='damage.mod'
                                label='Modificador' 
                                type='number' 
                                registration={register('damage.mod')}
                                error={errors?.damage as any}
                                placeholder='Ex: +2'
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                name='criticalDamage'
                                label='Dano crítico'
                                registration={register('criticalDamage')}
                                error={errors?.criticalDamage as any}
                                options={[ { value: '1d6', label: '1d6' }, { value: '2d6', label: '2d6' } ]}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormSelect
                                name='damageType'
                                label='Tipo de dano'
                                registration={register('damageType')}
                                error={errors?.damageType as any}
                                options={damageTypeOptions}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Stack>
        </InventoryCreateModalWrapper>
    );
});

InventoryCreateWeaponModal.displayName = 'InventoryCreateWeaponModal';