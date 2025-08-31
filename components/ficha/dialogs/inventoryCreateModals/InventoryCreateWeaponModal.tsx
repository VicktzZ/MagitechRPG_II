/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { toastDefault } from '@constants';
import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';
import { FormMultiSelect, FormSelect, FormTextField } from './fields';
import InventoryCreateModalWrapper, { mapArrayToOptions, type ItemFormData } from './InventoryCreateModalWrapper';
import { deafultWeapons, defaultWeapon } from '@constants/defaultWeapons';
import { zodResolver } from '@hookform/resolvers/zod';
import { weaponSchema,  type WeaponFormFields  } from '@schemas/itemsSchemas';
import { useFichaForm } from '@contexts/FichaFormProvider';
import { useAudio } from '@hooks';
import {
    weaponCateg,
    weaponKind,
    weaponMagicalAccessories,
    weaponScientificAccessories,
    damages,
    ranges,
    weaponBonuses,
    weaponHit,
    ballisticWeaponAmmo,
    energyWeaponAmmo,
    otherWeaponAmmo
} from '@constants/dataTypes';
import type { Weapon } from '@types';
import { useCampaignContext } from '@contexts';

export const InventoryCreateWeaponModal = memo(({
    action,
    disableDefaultCreate = false,
    onConfirm
}: { 
    action: () => void, 
    disableDefaultCreate?: boolean, 
    onConfirm?: (item: Weapon) => void 
}): ReactElement => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();
    const fichaForm = useFichaForm();
    const audio = useAudio('/sounds/sci-fi-interface-zoom.wav');
    const { campaign } = useCampaignContext()
    console.log(campaign)

    const weaponForm = useForm<WeaponFormFields>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultWeapon,
        resolver: zodResolver(weaponSchema)
    });
    const { register, formState: { errors }  } = weaponForm;

    // Memoizar as opções para os selects
    const weaponKindOptions = useMemo(() => mapArrayToOptions(weaponKind), []);
    const weaponCategoryOptions = useMemo(() => mapArrayToOptions(weaponCateg), []);
    const damageTypeOptions = useMemo(() => mapArrayToOptions(damages), []);
    const rangeOptions = useMemo(() => mapArrayToOptions(ranges), []);
    const bonusOptions = useMemo(() => mapArrayToOptions(weaponBonuses), []);
    const hitOptions = useMemo(() => weaponHit.map(item => ({ value: item, label: item.toUpperCase() })), []);
  
    // Memoizar as opções de acessórios agrupadas
    const accessoriesOptions = useMemo(() => [
        { header: 'Geral', options: [ { value: 'Não possui acessórios', label: 'Não possui acessórios' } ] },
        { header: 'Científicos', options: mapArrayToOptions(weaponScientificAccessories) },
        { header: 'Mágicos', options: mapArrayToOptions(weaponMagicalAccessories) }
    ], []);

    // Memoizar as opções de munição agrupadas
    const ammoOptions = useMemo(() => [
        { header: 'Geral', options: [ { value: 'Não consome', label: 'Não consome' } ] },
        { header: 'Balística', options: mapArrayToOptions(ballisticWeaponAmmo) },
        { header: 'Energia', options: mapArrayToOptions(energyWeaponAmmo) },
        { header: 'Outros', options: mapArrayToOptions(otherWeaponAmmo) }
    ], []);

    // Memoizar as opções de armas bases agrupadas
    const baseWeaponOptions = useMemo(() => [
        { header: 'Geral', options: [ { value: 'Nenhum', label: 'Nenhum' } ] },
        { header: 'Corpo a corpo', options: mapArrayToOptions(deafultWeapons.melee.map(item => item.name).sort()) },
        { header: 'Longo alcance', options: mapArrayToOptions(deafultWeapons.ranged.map(item => item.name).sort()) },
        { header: 'Mágico', options: mapArrayToOptions(deafultWeapons.magic.map(item => item.name).sort()) },
        { header: 'Balística', options: mapArrayToOptions(deafultWeapons.ballistic.map(item => item.name).sort()) },
        { header: 'Energia', options: mapArrayToOptions(deafultWeapons.energy.map(item => item.name).sort()) },
        { header: 'Especial', options: mapArrayToOptions(deafultWeapons.special.map(item => item.name).sort()) }
    ], []);

    const setDefaultWeapon = (weaponName: string) => {
        const allWeapons = Object.values(deafultWeapons).flat();
        const weapon = allWeapons.find(item => item.name === weaponName);

        if (weapon) {
            const newValues = {
                ...weapon,
                categ: (weapon.categ ?? '').split('(')[0].trim(),
                kind: (weapon.kind as string).split('(')[0].trim()
            };
            weaponForm.reset(newValues);
        } else if (weaponName === 'Nenhum') {
            weaponForm.reset(defaultWeapon);
        }
        audio.play();
    };

    const create = useCallback((data: WeaponFormFields & ItemFormData) => {
        const w = data;
        const composedKind = w.kind === 'Arremessável' && w.range
            ? `Arremessável (${w.range})`
            : w.kind;

        const payload = { ...w, kind: composedKind } as WeaponFormFields;
        const current = fichaForm.getValues('inventory.weapons') ?? [];
        fichaForm.setValue('inventory.weapons', [ ...current, payload ], { shouldValidate: true, shouldDirty: true });
        
        enqueueSnackbar(`${payload.name} criado com sucesso!`, toastDefault('itemCreated', 'success'));
        action();
    }, [ enqueueSnackbar, action, fichaForm ]);

    return (
        <FormProvider {...weaponForm}>
            <InventoryCreateModalWrapper 
                action={!disableDefaultCreate ? create : onConfirm} 
                submitLabel='Adicionar Arma'
                headerComponent={
                    <FormSelect
                        label="Arma base"
                        options={baseWeaponOptions}
                        defaultValue='Nenhum'   
                        onChange={(e) => setDefaultWeapon(e.target.value as string)}
                        sx={{ minWidth: matches ? '100%' : '20%' }}
                        fullWidth
                        hasGroups
                        menuStyle={{ maxHeight: 8 }}
                    />
                }
            >
                <Stack spacing={2}>
                    {/* Seção: Classificação */}
                    <Stack>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Classificação</Typography>
                        <Stack direction={matches ? 'column' : 'row'} spacing={2}>
                            <FormSelect
                                name='categ'
                                label='Categoria'
                                registration={register('categ')}
                                error={errors?.categ}
                                options={weaponCategoryOptions}
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                            />
                            <FormSelect
                                name='kind'
                                label='Tipo'
                                registration={register('kind')}
                                error={errors?.kind}
                                options={weaponKindOptions}
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                            />
                            <FormSelect
                                name='range'
                                label='Alcance'
                                registration={register('range')}
                                error={errors?.range}
                                options={rangeOptions}
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                            />
                            <FormMultiSelect
                                name='accessories'
                                label='Acessórios'
                                registration={register('accessories')}
                                error={errors?.accessories as any}
                                options={accessoriesOptions}
                                hasGroups
                                sx={{ minWidth: matches ? '100%' : '30%' }}
                            />
                        </Stack>
                    </Stack>

                    {/* Seção: Dano */}
                    <Stack>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Dano</Typography>
                        <Stack direction={matches ? 'column' : 'row'} spacing={2}>
                            <FormTextField 
                                name='effect.value'
                                label='Dano' 
                                type='text' 
                                registration={register('effect.value')}
                                error={errors?.effect?.value as any}
                                placeholder='Ex: 1d6'
                            />
                            <FormTextField 
                                name='effect.critValue'
                                label='Dano Crítico' 
                                type='text' 
                                registration={register('effect.critValue')}
                                error={errors?.effect?.critValue as any}
                                placeholder='Ex: 2d6'
                            />
                            <FormTextField 
                                name='effect.critChance'
                                label='Chance Crítica' 
                                type='number' 
                                registration={register('effect.critChance')}
                                error={errors?.effect?.critChance as any}
                                inputProps={{ min: 1, step: 1, max: 20 }}
                                sx={{ minWidth: matches ? '100%' : '10%' }}
                                placeholder='Ex: 19'
                            />
                            <FormSelect 
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                                name='effect.effectType'
                                label='Tipo do dano' 
                                registration={register('effect.effectType')}
                                error={errors?.effect?.effectType as any}
                                options={damageTypeOptions}
                            />
                            <FormSelect 
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                                name='hit'
                                label='Atributo' 
                                registration={register('hit')}
                                error={errors?.hit as any}
                                options={hitOptions}
                            />
                            <FormSelect 
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                                name='bonus'
                                label='Bônus' 
                                registration={register('bonus')}
                                error={errors?.bonus as any}
                                options={bonusOptions}
                            />
                        </Stack>
                    </Stack>

                    { /* Seção: Outros */ }
                    <Stack>
                        <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Outros</Typography>
                        <Stack direction={matches ? 'column' : 'row'} spacing={2}>
                            <FormSelect 
                                sx={{ minWidth: matches ? '100%' : '20%' }}
                                name='ammo'
                                label='Munição' 
                                registration={register('ammo')}
                                error={errors?.ammo as any}
                                options={ammoOptions}
                                hasGroups
                            />
                            {weaponForm.watch('ammo') !== 'Não consome' && (
                                <FormTextField 
                                    name='magazineSize'
                                    label='Tamanho do carregador' 
                                    type='number'
                                    registration={register('magazineSize')}
                                    error={errors?.magazineSize as any}
                                    inputProps={{ min: 1, step: 1 }}
                                    sx={{ minWidth: matches ? '100%' : '20%' }}
                                    placeholder='Ex: 30'
                                />
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </InventoryCreateModalWrapper>
        </FormProvider>
    );
});

InventoryCreateWeaponModal.displayName = 'InventoryCreateWeaponModal';