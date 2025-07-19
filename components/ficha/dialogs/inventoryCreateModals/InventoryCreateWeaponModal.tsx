import { toastDefault } from '@constants';
import { weaponCateg, weaponKind, weaponMagicalAccessories, weaponScientificAccessories, damages } from '@constants/dataTypes';
import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';
import { FormMultiSelect, FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions, type ItemFormData } from './InventoryCreateModalWrapper';

/**
 * Modal para criação de armas de inventário
 */
export const InventoryCreateWeaponModal = memo(({ action }: { action: () => void }): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    type WeaponFormFields = ItemFormData & {
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
        specialProperties: string[];
        hit: string;
    };

    const formContext = useFormContext<WeaponFormFields>();
    const { register, formState: { errors } } = formContext;
    
    // Memoizar as opções para os selects
    const weaponKindOptions = useMemo(() => mapArrayToOptions(weaponKind), []);
    const weaponCategoryOptions = useMemo(() => mapArrayToOptions(weaponCateg), []);
    const damageTypeOptions = useMemo(() => mapArrayToOptions(damages), []);
    
    // Memoizar as opções de acessórios agrupadas
    const accessoriesOptions = useMemo(() => [
        { header: 'Geral', options: [ { value: 'Não possui acessórios', label: 'Não possui acessórios' } ] },
        { header: 'Científicos', options: mapArrayToOptions(weaponScientificAccessories) },
        { header: 'Mágicos', options: mapArrayToOptions(weaponMagicalAccessories) }
    ], []);

    const create = useCallback((data: WeaponFormFields) => {
        
        // Aqui você precisaria acessar o contexto da ficha principal para adicionar a arma
        // Por enquanto, vamos apenas mostrar o sucesso
        enqueueSnackbar(`${data.name} criado com sucesso!`, toastDefault('itemCreated', 'success'));
        action();
    }, [ enqueueSnackbar, action ]);

    return (
        <InventoryCreateModalWrapper action={create}>
            <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                <FormSelect
                    name='kind'
                    label='Tipo'
                    registration={register('kind')}
                    error={errors?.kind as any}
                    options={weaponKindOptions}
                    defaultValue='Padrão'
                    sx={{ minWidth: '12%' }}
                />
                
                <FormSelect
                    name='categ'
                    label='Categoria'
                    registration={register('categ')}
                    error={errors?.categ as any}
                    options={weaponCategoryOptions}
                    sx={{ minWidth: '12%' }}
                />
                
                <FormMultiSelect
                    name='accessories'
                    label='Acessórios'
                    registration={register('accessories')}
                    error={errors?.accessories as any}
                    options={accessoriesOptions}
                    hasGroups={true}
                    defaultValue={[ 'Não possui acessórios' ]}
                    sx={{ minWidth: '15%' }}
                />

                {/* Seção de Bônus */}
                <Grid container>
                    <Grid item xs={12}>
                        <h2>Bônus</h2>
                    </Grid>
                    <Grid container gap={2}>
                        <FormTextField 
                            name='bonus.dex'
                            label='Dextreza' 
                            type='number' 
                            registration={register('bonus.dex')}
                            error={errors?.bonus as any}
                        />
                        
                        <FormTextField 
                            name='bonus.str'
                            label='Forca' 
                            type='number' 
                            registration={register('bonus.str')}
                            error={errors?.bonus as any}
                        />
                        
                        <FormTextField 
                            name='bonus.weakpoint'
                            label='Ponto Fraco' 
                            type='number' 
                            registration={register('bonus.weakpoint')}
                            error={errors?.bonus as any}
                        />
                    </Grid>
                </Grid>
                
                {/* Seção de Dano */}
                <Grid container>
                    <Grid item xs={12}>
                        <h2>Dano</h2>
                    </Grid>
                    <Grid container gap={2}>
                        <FormTextField 
                            name='damage.dices'
                            label='Quantidade de Dados' 
                            type='number' 
                            registration={register('damage.dices')}
                            error={errors?.damage as any}
                        />
                        
                        <FormTextField 
                            name='damage.sides'
                            label='Lados' 
                            type='number' 
                            registration={register('damage.sides')}
                            error={errors?.damage as any}
                        />
                        
                        <FormTextField 
                            name='damage.mod'
                            label='Modificador' 
                            type='number' 
                            registration={register('damage.mod')}
                            error={errors?.damage as any}
                        />
                        
                        <FormSelect
                            name='criticalDamage'
                            label='Dano Crítico'
                            registration={register('criticalDamage')}
                            error={errors?.criticalDamage as any}
                            options={[ { value: '1d6', label: '1d6' }, { value: '2d6', label: '2d6' } ]}
                        />
                        
                        <FormSelect
                            name='damageType'
                            label='Tipo de Dano'
                            registration={register('damageType')}
                            error={errors?.damageType as any}
                            options={damageTypeOptions}
                        />
                        
                        <FormMultiSelect
                            name='specialProperties'
                            label='Propriedades Especiais'
                            registration={register('specialProperties')}
                            error={errors?.specialProperties as any}
                            options={[ { value: 'Nenhuma', label: 'Nenhuma' } ]}
                            sx={{ minWidth: '15%' }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </InventoryCreateModalWrapper>
    );
});

InventoryCreateWeaponModal.displayName = 'InventoryCreateWeaponModal';