'use client';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useState, type ReactElement, useCallback } from 'react';
import type { Expertise as ExpertiseType, Expertises, Ficha } from '@types';
import { blue, green, grey, purple, yellow } from '@mui/material/colors';
import DiceRollModal from '@components/misc/DiceRollModal';
import type { FormikContextType } from 'formik';

export default function Expertise({ 
    name,
    expertise,
    diceQuantity,
    edit,
    formik
}: { 
    name: keyof Expertises,
    expertise: ExpertiseType<any>,
    diceQuantity: number,
    formik?: FormikContextType<Ficha>,
    edit?: {
        isEditing: boolean,
        value: number,
        setEdit?: (param: typeof edit) => void
    } 
}): ReactElement {
    const theme = useTheme()

    const [ open, setOpen ] = useState<boolean>(false)

    const determinateColor = (): string => {
        if (expertise.value < 2) {
            return grey[500]
        } else if (expertise.value < 5) {
            return green[500]
        } else if (expertise.value < 10) {
            return blue[500]
        } else if (expertise.value < 15) {
            return purple[500]
        } else {
            return yellow[500]
        }
    }

    const onClick = useCallback((): void => {
        if (!edit?.isEditing) {
            setOpen(true)
        } else {

            edit.setEdit?.({ isEditing: false, value: 0 })

            if (formik) {
                if (
                    (
                        (formik.values.points.expertises > 0 && formik.values.expertises[name].value < 2) ||
                        (formik.values.points.expertises >= 0 && edit.value < 0)
                    ) &&
                        formik.values.expertises[name].value + edit.value > -1
                ) {
                    formik.setFieldValue('expertises', {
                        ...formik.values.expertises,
                        [name]: {
                            ...formik.values.expertises[name],
                            value: expertise.value + edit.value
                        }
                    })    

                    formik.setFieldValue(
                        'points.expertises', 
                        edit.value > 0 ? formik.values.points.expertises - 1 :
                            formik.values.points.expertises + 1
                    )
                }
            }
        }
    }, [ edit, formik, name, expertise ])

    return (
        <>
            <Grid
                height='10rem'
                width='9.5rem'
                key={name} 
                item
                onClick={onClick}
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
                    border={`1px solid ${edit?.isEditing ? yellow[500] : theme.palette.primary.main}75`} 
                    // bgcolor={edit?.isEditing ? theme.palette.primary.dark : 'transparent'}
                    borderRadius={1}
                    sx={{ transition: '.3s' }}
                >
                    <Box display='flex' alignItems='center' gap={1}>
                        <Typography fontSize='3rem' fontFamily='D20'>-</Typography>
                        <Typography>+</Typography>
                        <Typography>{expertise.value}</Typography>
                    </Box>
                    <Typography fontWeight={900} color={determinateColor}>{name}</Typography>
                </Box>
            </Grid>
            <DiceRollModal 
                open={open}
                onClose={() => { setOpen(false) }}
                bonus={[ expertise.value ]}
                isDisadvantage={expertise.value < 0 || diceQuantity < 0}
                visibleBaseAttribute
                visibleDices
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