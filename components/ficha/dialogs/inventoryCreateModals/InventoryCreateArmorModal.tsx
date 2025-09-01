import { toastDefault } from '@constants';
import { armorKind, armorMagicalAccessories, armorScientificAccessories } from '@constants/dataTypes';
import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';
import { type z } from 'zod';
import { FormMultiSelect, FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions } from './InventoryCreateModalWrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import { armorSchema } from './validationSchemas';
import { useFichaForm } from '@contexts/FichaFormProvider';
import { deafultArmors, defaultArmor } from '@constants/defaultArmors';
import type { Armor } from '@types';
import { useCampaignContext } from '@contexts';

/**
 * Modal para criação de armaduras de inventário
 */
export const InventoryCreateArmorModal = memo(({
    action,
    disableDefaultCreate = false,
    onConfirm
}: { 
    action: () => void, 
    disableDefaultCreate?: boolean, 
    onConfirm?: (item: Armor) => void 
}): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();
    const fichaForm = useFichaForm();
    const { campaign } = useCampaignContext();

    type ArmorFormFields = z.infer<typeof armorSchema>;

    const armorForm = useForm<ArmorFormFields>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultArmor,
        resolver: zodResolver(armorSchema)
    });

    const { register, formState: { errors } } = armorForm;
    
    // Memoizar as opções para os selects
    const armorKindOptions = useMemo(() => mapArrayToOptions([ ...armorKind, 'Total' ]), []);
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
        const current = fichaForm.getValues('inventory.armors') ?? [];
        fichaForm.setValue('inventory.armors', [ ...current, data ], { shouldValidate: true, shouldDirty: true });
        enqueueSnackbar(`${data.name} criado com sucesso!`, toastDefault('itemCreated', 'success'));
        action();
    }, [ enqueueSnackbar, action, fichaForm ]);

    const baseArmorsOptions = useMemo(() => [
        campaign.custom.items.armor.length > 0 && { header: 'Personalizados', options: mapArrayToOptions(campaign.custom.items.armor.map(item => item.name)) },
        { header: 'Geral', options: [ { value: 'Nenhum', label: 'Nenhum' } ] },
        { header: 'Leve', options: mapArrayToOptions(deafultArmors.leve.map(item => item.name).sort()) },
        { header: 'Pesada', options: mapArrayToOptions(deafultArmors.pesada.map(item => item.name).sort()) }
    ], [ campaign.custom.items.armor ]);

    function setDefaultArmor(armorName: string) {
        const allArmors = Object.values(deafultArmors).flat();
        const armor = allArmors.find((a) => a.name === armorName);
        const campaignArmor = campaign.custom.items.armor?.find(item => item.name === armorName);
        const a = armor ?? campaignArmor;

        if (a) {
            armorForm.reset(a);
        } else if (armorName === 'Nenhum') {
            armorForm.reset(defaultArmor);
        }
    }

    return (
        <FormProvider {...armorForm}>
            <InventoryCreateModalWrapper
                action={!disableDefaultCreate ? create : onConfirm}
                submitLabel='Adicionar Armadura'
                headerComponent={
                    <FormSelect
                        label="Armadura base"
                        options={baseArmorsOptions}
                        defaultValue='Nenhum'
                        onChange={(e) => setDefaultArmor(e.target.value as string)}
                        sx={{ minWidth: matches ? '100%' : '20%' }}
                        fullWidth
                        hasGroups
                        menuStyle={{ maxHeight: 8 }}
                    />
                }
            >
                <Grid container display='flex' flexDirection={matches ? 'column' : 'row'} gap={2}>
                    <FormSelect
                        label='Tipo'
                        registration={register('kind')}
                        error={errors?.kind}
                        options={armorKindOptions}
                        sx={{ minWidth: '12%' }}
                    />
                    
                    <FormSelect
                        label='Categoria'
                        registration={register('categ')}
                        error={errors?.categ}
                        options={armorCategOptions}
                        sx={{ minWidth: '10%' }}
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

                    <FormMultiSelect
                        label='Acessórios'
                        registration={register('accessories')}
                        error={errors?.accessories}
                        options={accessoriesOptions}
                        hasGroups={true}
                        sx={{ minWidth: '20%' }}
                    />
                </Grid>
            </InventoryCreateModalWrapper>
        </FormProvider>
    );
});

InventoryCreateArmorModal.displayName = 'InventoryCreateArmorModal';