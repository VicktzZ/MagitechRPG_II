// import { MenuItem, TextField, Box, Typography, Grid, ListSubheader, useMediaQuery, Button, Chip } from '@mui/material'
import { Box } from '@mui/material';
import { useEffect, type ReactElement, useState } from 'react';
import type { Armor, DamageType, Ficha, Item, MergedItems, Weapon } from '@types';
// import { useTheme } from '@mui/material'
import { type FormikContextType, useFormikContext } from 'formik';
import { useSnackbar } from 'notistack';
import { ArmorModal, ItemModal, WeaponModal } from './CreateModals';

export default function CreateItemModal({ 
    itemType,
    onClose
}: {
    itemType: 'weapon' | 'armor' | 'item',
    onClose: () => void
}): ReactElement {
    const defaultItem: Partial<MergedItems<'Leve' | 'Pesada'>> = {
        name: '',
        description: '',
        rarity: 'Comum',
        weight: 0,
        quantity: 1
    };

    // const theme = useTheme()
    // const matches = useMediaQuery(theme.breakpoints.down('md'))
    const f: FormikContextType<Ficha> = useFormikContext();

    const [ item, setItem ] = useState<Partial<MergedItems<'Leve' | 'Pesada'>>>(
        itemType === 'weapon' ? {
            ...defaultItem,
            kind: 'Padrão',
            accessories: undefined,
            ammo: undefined,            
            bonus: undefined,
            categ: undefined,
            hit: undefined,
            range: undefined,
            effect: {
                value: '',
                critChance: 20,
                critValue: '',
                kind: 'damage',
                effectType: 'Cortante'
            }

        } : itemType === 'armor' ? {
            kind: 'Padrão',
            accessories: undefined,
            categ: undefined,
            displacementPenalty: 0,
            value: 0
        } : defaultItem
    );
    
    const [ weaponCategParam, setWeaponCategParam ] = useState<'Leve' | 'Pesada'>();
    const [ effectType, setEffectType ] = useState<DamageType>();

    const [ closed, setClosed ] = useState<boolean>(false);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        setItem({});
        setWeaponCategParam(undefined);
        setEffectType(undefined);
        setClosed(false);
    }, [ closed ]);

    useEffect(() => {
        setItem({});
    }, [ itemType ]);

    function createItem(): void {
        const isDefaultFieldsFilledIn = !!(
            item.name && item.description &&
            item.rarity && item.kind &&
            item.weight && item.quantity
        );

        console.log(item, isDefaultFieldsFilledIn);
        
        try { 
            if (itemType === 'weapon') {
                setItem(state => ({ ...state, effect: { ...state.effect, effectType } as any }));

                const regex = /^(\d+d\d+)(\+\d+d\d+|\+\d+)*$/;
                
                const isAllWeaponFieldsFilledIn = !!(
                    isDefaultFieldsFilledIn && item.range && item.categ &&
                    item.hit && item.ammo && item.accessories &&
                    item.bonus && item.effect?.value &&
                    item.effect?.critChance && item.effect?.critValue &&
                    item.effect?.kind && item.effect?.effectType
                );

                if (!(!regex.test(item.effect?.value ?? '') ?? !regex.test(item.effect?.critValue ?? ''))) {
                    enqueueSnackbar('O dano da arma precisa começar com um dado! EX: 2d4', { variant: 'error', autoHideDuration: 3000 });
                } else {
                    if (!isAllWeaponFieldsFilledIn) {
                        item.categ += ` (${weaponCategParam})` as any;
    
                        f.values.inventory.weapons = [ ...f.values.inventory.weapons, item as Weapon<'Leve' | 'Pesada'> ];
                        enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 });
                        setClosed(true);
                        onClose();
                    } else {
                        enqueueSnackbar('Preencha todos os campos!', { variant: 'error', autoHideDuration: 3000 });
                    }
                }
            } else if (itemType === 'armor') {
                // const isAllArmorFieldsFilledIn = !!(
                //     isDefaultFieldsFilledIn && item.categ &&
                //     item.displacementPenalty && item.value
                // )
                
                // if (isAllArmorFieldsFilledIn) {
                f.values.inventory.armors = [ ...f.values.inventory.armors, item as Armor ];
                enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 });
                setClosed(true);
                onClose();
                // }
            } else {
                // if (isDefaultFieldsFilledIn) {
                f.values.inventory.items = [ ...f.values.inventory.items, item as unknown as Item ];
                enqueueSnackbar(`${item.name} criado com sucesso!`, { variant: 'success', autoHideDuration: 3000 });
                setClosed(true);
                onClose();
                // } else {
                // enqueueSnackbar('Preencha todos os campos!', { variant: 'error', autoHideDuration: 3000 })
                // }
            }
            
            console.log(item);
        } catch (error: any) {
            enqueueSnackbar(`ERRO: ${error.message}`, { variant: 'error', autoHideDuration: 3000 });
        }
    }

    return (
        <Box
            display='flex'
            flexDirection='column'
            width='100%'
            gap={2}
            {...createItem}
        >
            { 
                itemType === 'weapon' ? <WeaponModal create={createItem} /> :
                    itemType === 'armor' ? <ArmorModal /> :
                        <ItemModal />
            }
        </Box>
    );
}