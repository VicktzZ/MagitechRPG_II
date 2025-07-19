import { toastDefault } from '@constants';
import { armorKind, armorMagicalAccessories, armorScientificAccessories } from '@constants/dataTypes';
import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';
import { type z } from 'zod';
import { type Ficha } from '@types';
import { FormMultiSelect, FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions } from './InventoryCreateModalWrapper';
import { type armorSchema } from './validationSchemas';

/**
 * Modal para criação de armaduras de inventário
 */
export const InventoryCreateArmorModal = memo(({ action }: { action: () => void }): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    type ArmorFormFields = z.infer<typeof armorSchema>;

    const formContext = useFormContext<Ficha>();
    const { register, formState: { errors } } = formContext;
    
    // Memoizar as opções para os selects
    const armorKindOptions = useMemo(() => mapArrayToOptions(armorKind), []);
    const armorCategOptions = useMemo(() => [
        { value: 'Leve', label: 'Leve' },
        { value: 'Pesada', label: 'Pesada' }
    ], []);
    
    // Memoizar as opções de acessórios agrupadas
    const accessoriesOptions = useMemo(() => [
        { header: 'Geral', options: [ { value: 'Não possui acessórios', label: 'Não possui acessórios' } ] },
        { header: 'Científicos', options: mapArrayToOptions(armorScientificAccessories) },
        { header: 'Mágicos', options: mapArrayToOptions(armorMagicalAccessories) }
    ], []);

    const create = useCallback((data: ArmorFormFields) => {
        formContext.setValue('inventory.armors', [ ...formContext.getValues().inventory.armors, data ]);
        enqueueSnackbar(`${data.name} criado com sucesso!`, toastDefault('itemCreated', 'success'));
        action();
    }, [ formContext, enqueueSnackbar, action ]);

    return (
        <InventoryCreateModalWrapper action={create}>
            <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                <FormSelect
                    label='Tipo'
                    registration={register('kind')}
                    error={errors?.kind}
                    options={armorKindOptions}
                    defaultValue='Padrão'
                    sx={{ width: '12%' }}
                />
                
                <FormSelect
                    label='Categoria'
                    registration={register('categ')}
                    error={errors?.categ}
                    options={armorCategOptions}
                    sx={{ width: '10%', ml: -1 }}
                />
                
                <FormMultiSelect
                    label='Acessórios'
                    registration={register('accessories')}
                    error={errors?.accessories}
                    options={accessoriesOptions}
                    hasGroups={true}
                    defaultValue={[ 'Não possui acessórios' ]}
                    sx={{ minWidth: '20%' }}
                />
                
                <FormTextField 
                    label='Valor de AP' 
                    type='number' 
                    registration={register('value')}
                    error={errors?.value}
                />
                
                <FormTextField
                    label='Penalidade de Deslocamento' 
                    type='number' 
                    registration={register('displacementPenalty')}
                    error={errors?.displacementPenalty}
                />
            </Grid>
        </InventoryCreateModalWrapper>
    );
});

InventoryCreateArmorModal.displayName = 'InventoryCreateArmorModal';