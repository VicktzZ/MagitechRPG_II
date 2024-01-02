'use client';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useState, type ReactElement } from 'react';
import type { Expertise } from '@types';
import { green } from '@mui/material/colors';
import DiceRollModal from '@components/misc/DiceRollModal';

export default function Test({ name, expertise, diceQuantity }: { name: string, expertise: Expertise<any>, diceQuantity: number }): ReactElement {
    const theme = useTheme()

    const [ open, setOpen ] = useState<boolean>(false)

    return (
        <>
            <Grid
                height='10rem'
                width='10rem'
                key={name} 
                item
                onClick={() => { setOpen(true) }}
                sx={{ 
                    cursor: 'pointer',
                    transition: '.3s',
                    ':hover': {
                        transform: 'scale(1.1)'
                    }
                }}
            >
                <Box
                    display='flex'
                    justifyContent={'center'}
                    alignItems='center'
                    flexDirection='column' 
                    p={1} 
                    border={`1px solid ${theme.palette.primary.main}75`} 
                    borderRadius={1}
                >
                    <Box display='flex' alignItems='center' gap={1}>
                        <Typography fontSize='3rem' fontFamily='D20'>-</Typography>
                        <Typography>+</Typography>
                        <Typography>{expertise.value}</Typography>
                    </Box>
                    <Typography fontWeight={900} color={green[500]}>{name}</Typography>
                </Box>
            </Grid>
            <DiceRollModal 
                open={open}
                onClose={() => { setOpen(false) }}
                bonus={[ expertise.value ]}
                isDisadvantage={expertise.value < 0 || diceQuantity < 0}
                visibleBaseAttribute
                roll={{
                    name,
                    dice: 20,
                    attribute: expertise.defaultAttribute,
                    quantity: Math.floor((diceQuantity / 2) ?? 0) + 1
                }}
            />
        </>
    )
}