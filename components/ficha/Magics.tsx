/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Edit } from '@mui/icons-material'
import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material'
import type { Ficha } from '@types'
import { useFormikContext, type FormikContextType } from 'formik'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Magic } from '.';
import MagicsModal from './MagicsModal'

const Magics = memo(() => {
    const f: FormikContextType<Ficha> = useFormikContext()
    
    const theme = useTheme()

    const [ open, setOpen ] = useState(false)

    const magics = useMemo(() => {
        return f.values.magics.map((magic: any) => (
            <Magic 
                key={magic?._id ?? ''}
                id={magic?._id ?? ''}
                magic={magic}
                onIconClick={() => {
                    const magicsArr: any[] = f.values.magics
                    const m: number = f.values.magics.findIndex((mg: any) => mg._id === magic._id)

                    magicsArr.splice(m, 1)

                    f.setFieldValue('points.magics', f.values.points.magics + 1)
                    f.setFieldValue('magicsSpace', f.values.magicsSpace + 1)
                    f.setFieldValue('magics', magicsArr)
                }}
            />
        ))
    }, [ f.values ])

    const setMagicPoints = useCallback(() => {
        f.setFieldValue('points.magics', f.values.attributes.log + 2)
    }, [ f.values.attributes.log ])

    const setMagicsSpace = useCallback(() => {
        let value = (f.values.attributes.foc * 2) + 2
        if (value <= 0) value = 1

        f.setFieldValue('magicsSpace', value)
    }, [ f.values.attributes.foc ])

    useEffect(setMagicPoints, [ setMagicPoints ])
    useEffect(setMagicsSpace, [ setMagicsSpace ])

    return (
        <>
            <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between' gap={2}>
                    <Box display='flex' alignItems='center' gap={3}>
                        <Box display='flex' alignItems='center' gap={1}>
                            <Typography variant='h6'>Magias</Typography>
                            <IconButton onClick={() => { setOpen(true) }} sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25 }}>
                                <Edit />
                            </IconButton>
                        </Box>
                        <Box display='flex' gap={1} alignItems='center'>
                            <Typography>Limite de magias:</Typography>
                            <Typography color='primary' fontWeight='900'>{f.values.magicsSpace}</Typography>
                        </Box>
                    </Box>
                    <Box display='flex' gap={1} alignItems='center'>
                        <Typography>Pontos de Magia:</Typography>
                        <Typography color='primary' fontWeight='900'>{f.values.points.magics}</Typography>
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
            <MagicsModal 
                open={open}
                onClose={() => { setOpen(false) }}
            />
        </>
    )
})

Magics.displayName = 'Magics'
export default Magics