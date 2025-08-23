import { toastDefault } from '@constants';
import { Stack, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';
import { FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions } from './InventoryCreateModalWrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemSchema, type ItemFormFields } from '@schemas/itemsSchemas';
import { useFichaForm } from '@contexts/FichaFormProvider';

export const InventoryCreateItemModal = memo(({ action }: {
    action: () => void;
}): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();
    const fichaForm = useFichaForm();

    const form = useForm<ItemFormFields>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            rarity: 'Comum',
            weight: 0,
            quantity: 1,
            level: 1,
            categ: 'Padrão'
        },
        resolver: zodResolver(itemSchema)
    });

    const { register, formState: { errors } } = form;

    const itemCategOptions = mapArrayToOptions([ 'Especial', 'Utilidade', 'Consumível', 'Item Chave', 'Munição', 'Capacidade', 'Padrão' ]);

    const create = useCallback((data: ItemFormFields) => {
        const payload = {
            name: data.name,
            description: data.description,
            rarity: data.rarity as any,
            weight: Number(data.weight) || 0,
            quantity: Number(data.quantity) || 1,
            kind: data.categ as any,
            level: Number(data.level) || 1
        };
        const current = fichaForm.getValues('inventory.items') ?? [];
        fichaForm.setValue('inventory.items', [ ...current, payload ], { shouldValidate: true, shouldDirty: true });
        enqueueSnackbar(`${data.name} criado com sucesso!`, toastDefault('itemCreated', 'success'));
        action();
    }, [ enqueueSnackbar, action, fichaForm ]);

    return (
        <FormProvider {...form}>
            <InventoryCreateModalWrapper 
                action={create}
                submitLabel='Criar Item'
            >
                <Stack spacing={2}>
                    {/* Categoria e Nível */}
                    <Stack direction={matches ? 'column' : 'row'} spacing={2}>
                        <FormSelect
                            name="categ"
                            label="Categoria"
                            registration={register('categ')}
                            error={errors?.categ as any}
                            options={itemCategOptions}
                            sx={{ minWidth: matches ? '100%' : '20%' }}
                            fullWidth
                        />
                        <FormTextField 
                            name="level"
                            label="Nível" 
                            type="number"
                            registration={register('level')}
                            error={errors?.level as any}
                            inputProps={{ min: 1, step: 1 }}
                            fullWidth
                        />
                    </Stack>
                </Stack>
            </InventoryCreateModalWrapper>
        </FormProvider>
    );
});

InventoryCreateItemModal.displayName = 'InventoryCreateItemModal';