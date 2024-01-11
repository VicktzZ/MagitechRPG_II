/* eslint-disable react-hooks/exhaustive-deps */
import { Edit } from '@mui/icons-material'
import { Box, IconButton, Typography, useTheme } from '@mui/material'
import type { Ficha } from '@types'
import { useFormikContext, type FormikContextType } from 'formik'
import { memo, useCallback, useEffect, useState } from 'react'
import MagicsModal from './MagicsModal'

const Magics = memo(() => {
    const f: FormikContextType<Ficha> = useFormikContext()
    
    const theme = useTheme()

    const [ open, setOpen ] = useState(false)

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
                    border={`1px solid ${theme.palette.primary.main}`}
                    p={5}
                    gap={10}
                >
                    
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