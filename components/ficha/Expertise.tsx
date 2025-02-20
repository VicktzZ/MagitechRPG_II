'use client';

import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type ReactElement, useCallback } from 'react';
import type { Expertise as ExpertiseType, Expertises, Ficha } from '@types';
import { blue, green, grey, purple, yellow } from '@mui/material/colors';
import DiceRollModal from '@components/misc/DiceRollModal';
import { useFormikContext, type FormikContextType } from 'formik';
// import { useSnackbar } from '@node_modules/notistack';

export default function Expertise({ 
    name,
    expertise,
    diceQuantity,
    disabled,
    edit
}: { 
    name: keyof Expertises,
    expertise: ExpertiseType<any>,
    diceQuantity: number,
    disabled: boolean
    edit?: {
        isEditing: boolean,
        value: number,
        setEdit?: (param: typeof edit) => void
    } 
}): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    // const { enqueueSnackbar } = useSnackbar()

    const [ open, setOpen ] = useState<boolean>(false)

    const f: FormikContextType<Ficha> = useFormikContext()

    const determinateColor = (): string => {
        if (expertise.value < 2) {
            return grey[500]
        } else if (expertise.value < 5) {
            return green[500]
        } else if (expertise.value < 7) {
            return blue[500]
        } else if (expertise.value < 9) {
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

            if (
                (
                    (f.values.points.expertises > 0 && (f.values.expertises[name].value < 2 || disabled)) ||
                    (f.values.points.expertises >= 0 && edit.value < 0)
                ) &&
                    f.values.expertises[name].value + edit.value > -1
            ) {
                // if (disabled && (f.values.expertises[name].value + edit.value >= f.initialValues.expertises[name].value)) {
                f.setFieldValue('expertises', {
                    ...f.values.expertises,
                    [name]: {
                        ...f.values.expertises[name],
                        value: expertise.value + edit.value
                    }
                })    

                f.setFieldValue(
                    'points.expertises', 
                    edit.value > 0 ? f.values.points.expertises - 1 :
                        f.values.points.expertises + 1
                )
                // } else {
                //     enqueueSnackbar('Não é possível diminuir uma perícia para um valor menor que o inicial', { variant: 'warning', preventDuplicate: true })
                // }
            }
        }
    }, [ edit, f, name, expertise, disabled ])

    return (
        <>
            <Grid
                height={!matches ? '11rem' : '10rem'}
                width={!matches ? '9.75rem' : '8.5rem'}
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
                    p={matches ? 1 : 2} 
                    border={`1px solid ${edit?.isEditing ? yellow[500] : theme.palette.primary.main}75`} 
                    borderRadius={1}
                    sx={{ transition: '.3s' }}
                >
                    <Box display='flex' alignItems='center' gap={1}>
                        <Typography fontSize='3rem' fontFamily='D20'>-</Typography>
                        <Typography>+</Typography>
                        <Typography>{expertise.value}</Typography>
                    </Box>
                    <Typography 
                        fontSize={matches ? '.8rem' : ''} 
                        fontWeight={900} 
                        color={determinateColor} 
                        sx={{ 
                            borderRadius: 1,
                            backgroundColor: `${determinateColor()}30`,
                            p: 1,
                            minWidth: '80%',
                            textAlign: 'center'
                        }}
                    >{name}</Typography>
                </Box>
            </Grid>
            { open && (
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
                        quantity: diceQuantity || 0 + 1
                    }}
                />
            )}
        </>
    )
}