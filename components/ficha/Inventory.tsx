/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Grid, Typography, useMediaQuery, useTheme, Modal, Button } from '@mui/material';
import React, { useEffect, type ReactElement, useMemo, useState } from 'react';
import { useFormikContext, type FormikContextType } from 'formik';
import { Item, ItemModal } from '@components/ficha';
import { lineageItems, occupationItems } from '@constants/lineageitems';
import { red, yellow } from '@mui/material/colors';
import { CustomIconButton } from '@layout';
import { Add } from '@mui/icons-material';
import type { Ficha } from '@types';
import { RPGIcon } from '@components/misc';
import { rarityArmorBonuses } from '@constants/dataTypes';

type ItemName = 'weapon' | 'item' | 'armor'

export default function Inventory ({ disabled }: { disabled?: boolean }): ReactElement {
    const f: FormikContextType<Ficha> = useFormikContext()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ modalOpen, setModalOpen ] = useState<boolean>(false)
    const [ modalContent, setModalContent ] = useState<ReactElement>(
        <ItemModal 
            itemType={'weapon'}
            onClose={() => { setModalOpen(false) }}
        />
    )
    
    const [ addButtonsStyle, setAddButtonsStyle ] = useState<Record<ItemName, 'outlined' | 'contained'>>({
        weapon: 'contained',
        armor: 'outlined',
        item: 'outlined'
    })

    const changeModalContent = (itemName: ItemName): void => {
        setAddButtonsStyle({
            weapon: 'outlined',
            armor: 'outlined',
            item: 'outlined',
            [itemName]: 'contained'
        })

        setModalContent(
            <ItemModal 
                itemType={itemName}
                onClose={() => { setModalOpen(false) }}
            />
        )
    }

    const capacity = useMemo(() => {
        const weaponsWeight = f.values.inventory.weapons?.map((weapon) => weapon.weight).reduce((a, b) => a + b, 0)
        const armorsWeight = f.values.inventory.armors?.map((armor) => armor.weight).reduce((a, b) => a + b, 0)
        const itemsWeight = f.values.inventory.items?.map((item) => {
            if (item.kind !== 'Capacidade') {
                return item.weight * (item?.quantity ?? 1)
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const maxCargo = f.values.inventory.items.map((item) => {
            if (item.kind === 'Capacidade') {
                return item.weight
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const cargo = (Number(weaponsWeight) + Number(armorsWeight) + Number(itemsWeight))?.toFixed(1)

        return {
            cargo: cargo || 0,
            maxCargo: maxCargo || 0
        }
    }, [ f.values.inventory, f.values.attributes.vig ])

    const itemsOfLineage = useMemo(() => {
        let itemArr: any[] = []
        let weaponArr: any[] = []

        if (!disabled) {
            f.values.inventory = f.values.mode === 'Classic' ? f.initialValues.inventory : {
                items: [],
                weapons: [],
                armors: [],
                money: 0
            }

            const lineageOrOccupationItems = f.values.mode === 'Classic' ? lineageItems : occupationItems
    
            const items = lineageOrOccupationItems[f.values.lineage as unknown as keyof typeof lineageOrOccupationItems]
    
            items?.forEach((item) => {
                if (item.type === 'item') itemArr.push(item) 
                if (item.type === 'weapon') weaponArr.push(item)
            })            
        } else {
            itemArr = f.initialValues.inventory.items || []
            weaponArr = f.initialValues.inventory.weapons || []
        }

        return {
            itemArr,
            weaponArr
        }
    }, [ f.values.lineage ])

    const weapons = useMemo(() => {
        console.log(f.values)

        return f.values.inventory.weapons?.map((weapon) => (
            <Grid 
                item
                key={weapon.name}
            >
                <Item
                    as='weapon'
                    name={weapon.name}
                    ammo={weapon.ammo}
                    rarity={weapon.rarity}
                    categ={weapon.categ}
                    range={weapon.range}
                    weight={weapon.weight}
                    accessories={weapon?.accessories}
                    kind={weapon.kind}
                    bonus={weapon.bonus}
                    description={weapon.description}
                    hit={weapon.hit}

                    bonusValue={[ f.values.expertises[weapon.bonus]?.value ]}
                    isDisadvantage={f.values.attributes[weapon.hit] < 0}
                    diceQuantity={Math.floor((f.values.attributes[weapon.hit] / 2) || 0) + 1}

                    effect={{
                        effectType: weapon?.effect?.effectType,
                        critValue: weapon?.effect?.critValue,
                        critChance: weapon?.effect?.critChance,
                        value: weapon?.effect?.value
                    }}
                />
            </Grid>
        )) || 'Vazio'
    }, [ f.values.inventory.weapons ])

    const armors = useMemo(() => {
        return f.values.inventory.armors?.map((armor) => (
            <Grid 
                item
                key={armor.name}
            >
                <Item
                    as='armor'
                    name={armor.name}
                    categ={armor.categ}
                    weight={armor.weight}
                    rarity={armor.rarity}
                    kind={armor.kind}
                    displacementPenalty={armor.displacementPenalty}
                    value={armor.value + rarityArmorBonuses[armor.rarity]}
                    description={armor.description}
                />
            </Grid>
        )) || 'Vazio'
    }, [ f.values.inventory.armors ])

    const items = useMemo(() => {
        return f.values.inventory.items?.map((item) => (
            <Grid 
                item
                key={item.name}
            >
                <Item
                    as='item'
                    name={item.name}
                    weight={item.weight}
                    kind={item.kind}
                    rarity={item.rarity}
                    description={item.description}
                    level={item?.level}
                    quantity={item?.quantity ?? 1}
                    effects={item?.effects}
                />
            </Grid>
        )) || 'Vazio'
    }, [ f.values.inventory.items ])

    useEffect(() => {
        const { cargo, maxCargo } = capacity

        f.setFieldValue('capacity.cargo', Number(cargo === 'NaN' ? 0 : cargo).toFixed(1))
        f.setFieldValue('capacity.max', Number(Number(f.values.attributes.vig * 1.5 + maxCargo + 5)).toFixed(1))
    }, [ capacity ])
    
    useEffect(() => {
        const { weaponArr, itemArr } = itemsOfLineage

        if (f.values.mode !== 'Apocalypse') {
            f.setFieldValue('inventory.weapons', [
                ...f.initialValues.inventory.weapons,
                ...weaponArr
            ])
            
            f.setFieldValue('inventory.items', [
                ...f.initialValues.inventory.items,
                ...itemArr
            ])
        } else {
            f.setFieldValue('inventory.weapons', weaponArr)
            f.setFieldValue('inventory.items', itemArr)
        }
    }, [ itemsOfLineage ])

    return (
        <>
            <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' alignItems='center' gap={2}>
                    <Typography fontFamily='Sakana' variant='h5'>Inventário</Typography>
                    <Typography 
                        fontWeight={900} 
                        variant='h5'
                        color={
                            f.values.capacity.cargo / f.values.capacity.max >= 1 ? red[500] :
                                f.values.capacity.cargo / f.values.capacity.max >= .75 ? yellow[500] : 'white'
                        }
                    >
                        {f.values.capacity.cargo}/{f.values.capacity.max}
                    </Typography>
                    <CustomIconButton onClick={() => { setModalOpen(true); }}>
                        <Add />
                    </CustomIconButton>
                </Box>
                <Box
                    display='flex'
                    width='100%' 
                    borderRadius={2} 
                    flexDirection='column'
                    border={`1px solid ${theme.palette.primary.main}`}
                    p={5}
                    gap={10}
                >
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Box display='flex' gap={2}>
                            <Typography>Armas</Typography>
                            <RPGIcon icon='crossbow' />
                        </Box>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {weapons}
                        </Grid>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Box display='flex' gap={2}>
                            <Typography>Armaduras</Typography>
                            <RPGIcon icon='shield' />
                        </Box>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {armors}
                        </Grid>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Box display='flex' gap={2}>
                            <Typography>Itens</Typography>
                            <RPGIcon icon='potion' />
                        </Box>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {items}
                        </Grid>
                    </Box>
                </Box>    
            </Box>
            <Modal
                open={modalOpen}
                onClose={e => { setModalOpen(false) }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    display='flex'
                    flexDirection='column'
                    minHeight='50%'
                    width='80%'
                    bgcolor='background.paper3'
                    borderRadius={2}
                    gap={2}
                    p={2}
                >
                    <Box>
                        <Typography variant='h6'>Adicionar Item</Typography>
                    </Box>
                    <Box display='flex' gap={2}>
                        <Button onClick={() => { changeModalContent('weapon') }} variant={addButtonsStyle.weapon}>Arma</Button>
                        <Button onClick={() => { changeModalContent('armor') }} variant={addButtonsStyle.armor}>Armadura</Button>
                        <Button onClick={() => { changeModalContent('item') }} variant={addButtonsStyle.item}>Item</Button>
                    </Box>
                    <Box width='100%'>
                        {modalContent}
                    </Box>
                </Box>
            </Modal>
        </>
    )
}