/* eslint-disable @typescript-eslint/no-shadow */
import { toastDefault } from '@constants';
import { Stack, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';
import { FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions } from './InventoryCreateModalWrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemSchema, type ItemFormFields } from '@schemas/itemsSchemas';
import { useFichaForm } from '@contexts/FichaFormProvider';
import { defaultItems, defaultItem } from '@constants/defaultItems';
import type { Item } from '@types';
import { useCampaignContext } from '@contexts';

export const InventoryCreateItemModal = memo(({
    action,
    disableDefaultCreate = false,
    onConfirm
}: { 
    action: () => void, 
    disableDefaultCreate?: boolean, 
    onConfirm?: (item: Item) => void 
}): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();
    const fichaForm = useFichaForm();
    const { campaign } = useCampaignContext();

    const form = useForm<ItemFormFields>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultItem,
        resolver: zodResolver(itemSchema)
    });

    const { register, formState: { errors } } = form;

    const itemKindOptions = mapArrayToOptions([ 'Especial', 'Utilidade', 'Consumível', 'Item Chave', 'Munição', 'Capacidade', 'Padrão' ]);
    const baseItemOptions = useMemo(() => [
        campaign.custom.items.item.length > 0 && { header: 'Personalizados', options: mapArrayToOptions(campaign.custom.items.item.map(item => item.name)) },
        { header: 'Geral', options: [ { value: 'Nenhum', label: 'Nenhum' } ] },
        { header: 'Científico', options: mapArrayToOptions(defaultItems.cientificos.map((item: Item) => item.name).sort()) },
        { header: 'Mágico', options: mapArrayToOptions(defaultItems.magicos.map((item: Item) => item.name).sort()) }
    ], [ campaign.custom.items.item ]);

    function setDefaultItem(itemName: string) {
        const allItems = Object.values(defaultItems).flat();
        const item = allItems.find((i: Item) => i.name === itemName);
        const campaignItem = campaign.custom.items.item?.find(item => item.name === itemName);
        const i = item ?? campaignItem;

        if (i) {
            form.reset(i);
        } else if (itemName === 'Nenhum') {
            form.reset(defaultItem);
        }
    }

    const create = useCallback((data: ItemFormFields) => {
        const payload = {
            name: data.name,
            description: data.description,
            rarity: data.rarity as any,
            weight: Number(data.weight) || 0,
            quantity: Number(data.quantity) || 1,
            kind: data.kind as any,
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
                action={!disableDefaultCreate ? create : onConfirm}
                submitLabel='Adicionar Item'
                headerComponent={
                    <FormSelect
                        label="Item base"
                        options={baseItemOptions}
                        defaultValue='Nenhum'
                        onChange={(e) => setDefaultItem(e.target.value as string)}
                        sx={{ minWidth: matches ? '100%' : '20%' }}
                        fullWidth
                        hasGroups
                        menuStyle={{ maxHeight: 8 }}
                    />
                }
            >
                <Stack spacing={2}>
                    {/* Categoria e Nível */}
                    <Stack direction={matches ? 'column' : 'row'} spacing={2}>
                        <FormSelect
                            name="kind"
                            label="Categoria"
                            registration={register('kind')}
                            error={errors?.kind as any}
                            options={itemKindOptions}
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