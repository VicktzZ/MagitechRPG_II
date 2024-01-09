/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, type ReactElement, useMemo } from 'react'
import type { Ficha, LineageNames } from '@types'
import type { FormikContextType } from 'formik'
import { Item } from '@components/ficha'
import { lineageItems } from '@constants/lineageitems'

export default function Inventory({ formik }: { formik: FormikContextType<Ficha> }): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const capacity = useMemo(() => {
        const weaponsWeight = formik.values.inventory.weapons.map((weapon) => weapon.weight).reduce((a, b) => a + b, 0)
        const armorsWeight = formik.values.inventory.armors.map((armor) => armor.weight).reduce((a, b) => a + b, 0)
        const itemsWeight = formik.values.inventory.items.map((item) => {
            if (item.kind !== 'Capacidade') {
                return item.weight * (item?.quantity ?? 1)
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const maxCargo = formik.values.inventory.items.map((item) => {
            if (item.kind === 'Capacidade') {
                return item.weight
            } else return 0
        }).reduce((a, b) => a + b, 0)

        const cargo = (weaponsWeight + armorsWeight + itemsWeight)?.toFixed(1)

        return {
            cargo,
            maxCargo
        }
    }, [ formik.values.inventory, formik.values.attributes.vig ])

    const itemsOfLineage = useMemo(() => {
        formik.values.inventory = formik.initialValues.inventory

        const items = lineageItems[formik.values.lineage as unknown as LineageNames]
        const itemArr: any[] = []
        const weaponArr: any[] = []

        items?.forEach((item) => {
            if (item.type === 'item') itemArr.push(item) 
            if (item.type === 'weapon') weaponArr.push(item)
        })

        return {
            itemArr,
            weaponArr
        }
    }, [ formik.values.lineage ])

    useEffect(() => {
        const { cargo, maxCargo } = capacity
        
        formik.setFieldValue('capacity.cargo', cargo)
        formik.setFieldValue('capacity.max', (5 + (formik.values.attributes.vig * 2.5) + maxCargo).toFixed(1))
    }, [ capacity ])
    
    useEffect(() => {
        const { weaponArr, itemArr } = itemsOfLineage

        formik.setFieldValue('inventory.weapons', [
            ...formik.initialValues.inventory.weapons,
            ...weaponArr
        ])
        
        formik.setFieldValue('inventory.items', [
            ...formik.initialValues.inventory.items,
            ...itemArr
        ])
    }, [ itemsOfLineage ])

    return (
        <Box
            display='flex'
            width='100%' 
            borderRadius={2} 
            flexDirection='column'
            border={`1px solid ${theme.palette.primary.main}`}
            // bgcolor='background.paper3'
            p={5}
            gap={10}
        >
            <Box display='flex' flexDirection='column' gap={5}>
                <Typography>Armas</Typography>
                <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                    {formik.values.inventory.weapons.map((weapon) => (
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
                                accesories={weapon?.accesories}
                                kind={weapon.kind}
                                bonus={weapon.bonus}
                                description={weapon.description}
                                hit={weapon.hit}
    
                                bonusValue={[ formik.values.expertises[weapon.bonus].value ]}
                                isDisadvantage={formik.values.attributes[weapon.hit] < 0}
                                diceQuantity={Math.floor((formik.values.attributes[weapon.hit] / 2) ?? 0) + 1}
    
                                effect={{
                                    kind: weapon.effect.kind,
                                    effectType: weapon.effect.effectType,
                                    critValue: weapon.effect.critValue,
                                    critChance: weapon.effect.critChance,
                                    value: weapon.effect.value
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box display='flex' flexDirection='column' gap={5}>
                <Typography>Armaduras</Typography>
                <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                    {formik.values.inventory.armors.map((armor) => (
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
                    ))}
                </Grid>
            </Box>
            <Box display='flex' flexDirection='column' gap={5}>
                <Typography>Itens</Typography>
                <Grid container justifyContent={matches ? 'center' : 'inherit'} spacing={2}>
                    {formik.values.inventory.items.map((item) => (
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
                    ))}
                </Grid>
            </Box>
        </Box>    
    )
}