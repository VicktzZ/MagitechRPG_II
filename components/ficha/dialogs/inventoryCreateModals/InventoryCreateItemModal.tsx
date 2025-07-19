import { toastDefault } from '@constants';
import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';
import { type Ficha } from '@types';
import { FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions } from './InventoryCreateModalWrapper';

export const InventoryCreateItemModal = memo(({ action }: {
    action: () => void;
}): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    const formContext = useFormContext<Ficha>();
    const { register, formState: { errors } } = formContext;

    // Definindo as opções para os selects
    const itemKindOptions = mapArrayToOptions([ 'Especial', 'Utilidade', 'Consumível', 'Item Chave', 'Munição', 'Capacidade', 'Padrão' ]);
    const rarityOptions = mapArrayToOptions([ 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico' ]);

    // Usar useCallback para evitar re-renderizações
    const create = useCallback(async (data: any): Promise<void> => {
        const currentItems = formContext.getValues().inventory.items || [];
        const newItem = {
            name: data.name,
            description: data.description,
            rarity: data.rarity,
            weight: Number(data.weight) || 0,
            quantity: Number(data.quantity) || 1,
            kind: data.categ,
            level: Number(data.level) || 1
        };
        
        formContext.setValue('inventory.items', [ ...currentItems, newItem ]);
        enqueueSnackbar(`${data.name} criado com sucesso!`, toastDefault(data.name, 'success'));
        action();
    }, [ formContext, enqueueSnackbar, action ]);

    return (
        <InventoryCreateModalWrapper action={create}>
            <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                {/* Nome */}
                <Grid item xs={12} md={8}>
                    <FormTextField 
                        name="name"
                        label="Nome do Item" 
                        registration={register('name')}
                        error={errors?.name as any}
                        required
                        fullWidth
                    />
                </Grid>
                
                {/* Raridade */}
                <Grid item xs={12} md={4}>
                    <FormSelect
                        name="rarity"
                        label="Raridade"
                        registration={register('rarity')}
                        error={errors?.rarity as any}
                        options={rarityOptions}
                        defaultValue="Comum"
                        fullWidth
                    />
                </Grid>
                
                {/* Categoria */}
                <Grid item xs={12} md={6}>
                    <FormSelect
                        name="categ"
                        label="Categoria"
                        registration={register('categ')}
                        error={errors?.categ as any}
                        options={itemKindOptions}
                        defaultValue="Padrão"
                        fullWidth
                    />
                </Grid>
                
                {/* Nível */}
                <Grid item xs={6} md={3}>
                    <FormTextField 
                        name="level"
                        label="Nível" 
                        type="number"
                        registration={register('level')}
                        error={errors?.level as any}
                        inputProps={{ min: 1, step: 1 }}
                        fullWidth
                    />
                </Grid>
                
                {/* Peso */}
                <Grid item xs={6} md={3}>
                    <FormTextField 
                        name="weight"
                        label="Peso (kg)" 
                        type="number"
                        registration={register('weight')}
                        error={errors?.weight as any}
                        inputProps={{ min: 0, step: 0.1 }}
                        fullWidth
                    />
                </Grid>
                
                {/* Quantidade */}
                <Grid item xs={6} md={3}>
                    <FormTextField 
                        name="quantity"
                        label="Quantidade" 
                        type="number"
                        registration={register('quantity')}
                        error={errors?.quantity as any}
                        inputProps={{ min: 1, step: 1 }}
                        fullWidth
                    />
                </Grid>
                
                {/* Descrição */}
                <Grid item xs={12}>
                    <FormTextField 
                        name="description"
                        label="Descrição" 
                        registration={register('description')}
                        error={errors?.description as any}
                        multiline
                        rows={3}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </InventoryCreateModalWrapper>
    );
});

InventoryCreateItemModal.displayName = 'InventoryCreateItemModal';