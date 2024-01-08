import { Box, Grid, Typography, useTheme } from '@mui/material'
import React, { type ReactElement } from 'react'
import type { Ficha } from '@types'
import type { FormikContextType } from 'formik'
import { Item } from '@components/ficha'

export default function Inventory({ formik }: { formik: FormikContextType<Ficha> }): ReactElement {
    const theme = useTheme()
    
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
                <Grid container spacing={2}>
                    {formik.values.inventory.weapons.map((weapon) => (
                        <Item
                            as='weapon'
                            key={weapon.name}
                            name={weapon.name}
                            categ={weapon.categ}
                            range={weapon.range}
                            weight={weapon.weight}
                            kind={weapon.kind}
                            bonus={weapon.bonus}
                            description={weapon.description}
                            hit={weapon.hit}
                            effect={{
                                kind: weapon.effect.kind,
                                effectType: weapon.effect.effectType,
                                critValue: weapon.effect.critValue,
                                critChance: weapon.effect.critChance,
                                value: weapon.effect.value
                            }}
                        />
                    ))}
                </Grid>
            </Box>
            <Box display='flex' flexDirection='column' gap={5}>
                <Typography>Armaduras</Typography>
                <Grid container spacing={2}>
                    <Item 
                        title='Item1'
                        as='armor'

                    />
                </Grid>
            </Box>
            <Box display='flex' flexDirection='column' gap={5}>
                <Typography>Itens</Typography>
                <Grid container spacing={2}>
                    <Item 
                        title='Item1'
                        as='weapon'

                    />
                </Grid>
            </Box>
        </Box>    
    )
}