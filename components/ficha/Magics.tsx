/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Close, Edit } from '@mui/icons-material'
import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material'
import type { Ficha } from '@types'
import { useFormikContext, type FormikContextType } from 'formik'
import { memo, useEffect, useMemo, useState } from 'react'
import { Magic } from '.';
import MagicsModal from './MagicsModal'
import { useSnackbar } from 'notistack';
import { toastDefault } from '@constants';

const Magics = memo(({ disabled }: { disabled?: boolean }) => {
    const formikValues = !disabled ? 'values' : 'initialValues'
    const [ open, setOpen ] = useState(false)    
    
    const f: FormikContextType<Ficha> = useFormikContext()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const theme = useTheme()
    
    const magics = useMemo(() => {
        return f.values.magics.map((magic: any) => (
            <Magic
                as='magic-spell'
                id={magic?._id ?? ''}
                key={magic?._id ?? ''}
                magic={magic}
                onIconClick={() => {
                    const magicsArr: any[] = f.values.magics
                    const m: number = f.values.magics.findIndex((mg: any) => mg._id === magic._id)

                    magicsArr.splice(m, 1)

                    f.setFieldValue('points.magics', f.values.points.magics + 1)
                    f.setFieldValue('magicsSpace', f.values.magicsSpace + 1)
                    f.setFieldValue('magics', magicsArr)

                    enqueueSnackbar(`Magia ${magic.nome} removida!`, {
                        ...toastDefault('itemDeleted', 'success'),
                        action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar(magic.nome) }} />
                    })
                }}
            />
        ))
    }, [ f.values ])

    useEffect(() => {
        // Magic Spaces
        let magicSpaceValue = f[formikValues].attributes.log * 2 + 2
        if (magicSpaceValue <= 0) magicSpaceValue = 1
        !disabled ?
            f.setFieldValue('magicsSpace', magicSpaceValue)
            : f.initialValues.magicsSpace = magicSpaceValue
            
        // Magic Points
        let magicPointsValue = f[formikValues].attributes.foc + 1
        if (magicPointsValue <= 0) magicPointsValue = 1

        !disabled ?
            f.setFieldValue('points.magics', magicPointsValue)
            : f.initialValues.points.magics = magicPointsValue
    }, [ f[formikValues].attributes.foc, f[formikValues].attributes.log ])

    return (
        <>
            <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between' gap={2}>
                    <Box display='flex' alignItems='center' gap={3}>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Typography fontFamily='Sakana' variant='h5'>Magias</Typography>
                            <IconButton onClick={() => { setOpen(true) }} sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25 }}>
                                <Edit />
                            </IconButton>
                        </Box>
                        <Box display='flex' gap={1} alignItems='center'>
                            <Typography>Limite de magias:</Typography>
                            <Typography color='primary' fontWeight='900'>{disabled ? f.initialValues.magicsSpace : f.values.magicsSpace}</Typography>
                        </Box>
                    </Box>
                    <Box display='flex' gap={1} alignItems='center'>
                        <Typography>Pontos de Magia:</Typography>
                        <Typography color='primary' fontWeight='900'>{disabled ? f.initialValues.points.magics : f.values.points.magics}</Typography>
                    </Box>
                </Box>
                <Box
                    display='flex'
                    width='100%' 
                    borderRadius={2} 
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    border={`1px solid ${theme.palette.primary.main}`}
                    p={5}
                    gap={10}
                >
                    <Grid justifyContent='center' gap={5} container>
                        {magics}
                    </Grid>
                </Box>
            </Box>
            {open && (
                <MagicsModal 
                    open={open}
                    onClose={() => { setOpen(false) }}
                />
            )}
        </>
    )
})

Magics.displayName = 'Magics'
export default Magics