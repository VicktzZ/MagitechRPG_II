/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Grid, Typography, useMediaQuery, useTheme, Modal, Button } from '@mui/material'
import React, { useEffect, type ReactElement, useMemo, memo, useState } from 'react'
import { useFormikContext, type FormikContextType } from 'formik'
import { Item, ItemModal } from '@components/ficha'
import { lineageItems } from '@constants/lineageitems'
import { red, yellow } from '@mui/material/colors'
import { CustomIconButton } from '@layout'
import { Add } from '@mui/icons-material'
import type { Ficha, LineageNames } from '@types'

type ItemName = 'weapon' | 'item' | 'armor'

const Inventory = memo(({ disabled }: { disabled?: boolean }): ReactElement => {
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
        const weaponsWeight = f.values.inventory.weapons.map((weapon) => weapon.weight).reduce((a, b) => a + b, 0)
        const armorsWeight = f.values.inventory.armors.map((armor) => armor.weight).reduce((a, b) => a + b, 0)
        const itemsWeight = f.values.inventory.items.map((item) => {
            if (item.kind !== 'Capacidade') {
                return item.weight * (item?.quantity ?? 1)
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const maxCargo = f.values.inventory.items.map((item) => {
            if (item.kind === 'Capacidade') {
                return item.weight
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const cargo = (weaponsWeight + armorsWeight + itemsWeight)?.toFixed(1)

        return {
            cargo,
            maxCargo
        }
    }, [ f.values.inventory, f.values.attributes.vig ])

    const itemsOfLineage = useMemo(() => {
        const itemArr: any[] = []
        const weaponArr: any[] = []

        if (!disabled) {
            f.values.inventory = f.initialValues.inventory
    
            const items = lineageItems[f.values.lineage as unknown as LineageNames]
    
            items?.forEach((item) => {
                if (item.type === 'item') itemArr.push(item) 
                if (item.type === 'weapon') weaponArr.push(item)
            })            
        }

        return {
            itemArr,
            weaponArr
        }
    }, [ f.values.lineage ])

    const weapons = useMemo(() => {
        return f.values.inventory.weapons.map((weapon) => (
            <Grid 
                item
                key={weapon.name}
            >
                <Item
                    as='weapon'
                    name={weapon.name}
                    ammo={weapon.ammo}
                    categ={weapon.categ}
                    range={weapon.range}
                    weight={weapon.weight}
                    accessories={weapon?.accessories}
                    kind={weapon.kind}
                    bonus={weapon.bonus}
                    description={weapon.description}
                    hit={weapon.hit}

                    bonusValue={[ f.values.expertises[weapon.bonus].value ]}
                    isDisadvantage={f.values.attributes[weapon.hit] < 0}
                    diceQuantity={Math.floor((f.values.attributes[weapon.hit] / 2) ?? 0) + 1}

                    effect={{
                        kind: weapon.effect.kind,
                        effectType: weapon.effect.effectType,
                        critValue: weapon.effect.critValue,
                        critChance: weapon.effect.critChance,
                        value: weapon.effect.value
                    }}
                />
            </Grid>
        ))
    }, [ f.values.inventory.weapons ])

    const armors = useMemo(() => {
        return f.values.inventory.armors.map((armor) => (
            <Grid 
                item
                key={armor.name}
            >
                <Item
                    as='armor'
                    name={armor.name}
                    categ={armor.categ}
                    weight={armor.weight}
                    kind={armor.kind}
                    displacementPenalty={armor.displacementPenalty}
                    value={armor.value}
                    description={armor.description}
                />
            </Grid>
        ))
    }, [ f.values.inventory.armors ])

    const items = useMemo(() => {
        return f.values.inventory.items.map((item) => (
            <Grid 
                item
                key={item.name}
            >
                <Item
                    as='item'
                    name={item.name}
                    weight={item.weight}
                    kind={item.kind}
                    description={item.description}
                    level={item?.level}
                    quantity={item?.quantity ?? 1}
                    effects={item?.effects}
                />
            </Grid>
        ))
    }, [ f.values.inventory.items ])

    useEffect(() => {
        const { cargo, maxCargo } = capacity
        
        f.setFieldValue('capacity.cargo', cargo)
        f.setFieldValue('capacity.max', Number(Number(f.values.attributes.vig * 1.5 + maxCargo + 5)).toFixed(1))
    }, [ capacity ])
    
    useEffect(() => {
        const { weaponArr, itemArr } = itemsOfLineage

        f.setFieldValue('inventory.weapons', [
            ...f.initialValues.inventory.weapons,
            ...weaponArr
        ])
        
        f.setFieldValue('inventory.items', [
            ...f.initialValues.inventory.items,
            ...itemArr
        ])
    }, [ itemsOfLineage ])

    return (
        <>
            <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' alignItems='center' gap={2}>
                    <Typography variant='h6'>Inventário</Typography>
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
                    <CustomIconButton onClick={() => { setModalOpen(true) }}>
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
                        <Typography>Armas</Typography>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {weapons}
                        </Grid>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Typography>Armaduras</Typography>
                        <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                            {armors}
                        </Grid>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5}>
                        <Typography>Itens</Typography>
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
})

Inventory.displayName = 'Inventory'
export default Inventory
