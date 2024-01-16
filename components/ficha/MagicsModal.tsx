/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { Alert, Backdrop, Box, CircularProgress, Grid, IconButton, Modal, TextField, Typography } from '@mui/material';
import { memo, useEffect, useMemo, useState } from 'react';
import { type Ficha, type Magia as MagicType } from '@types';
import { useIntersection } from '@mantine/hooks'
import { Close } from '@mui/icons-material';
import { useFormikContext } from 'formik';
import Magic from './Magic';
import { Snackbar } from '@mui/material';

const MagicsModal = memo(({ open, onClose }: { open: boolean, onClose: () => void}) => {
    const f = useFormikContext<Ficha>()

    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ magicsArr, setMagicsArr ] = useState<MagicType[]>([] as MagicType[])
    const [ page, setPage ] = useState<number>(1)
    const [ isInlimit, setIsInLimit ] = useState<boolean>(false)
    
    const { ref, entry } = useIntersection({ threshold: 1 })

    const [ snackbar, setSnackbar ] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success'
    })

    const setSnackbarOpen = (openParam: boolean): void => {
        setSnackbar({ open: openParam, message: '', severity: 'success' })
    }

    const fetchMagics = async (): Promise<MagicType[]> => {
        const data: MagicType[] = await fetch('/api/magia').then(async r => await r.json())
        console.log(data)

        const result = data.slice((page - 1) * 20, page * 20)

        setIsLoading(false)

        console.log(result);
        
        if (magicsArr.length >= data.length) {
            setIsInLimit(true)
            return []
        } else return result
    }

    const magics = useMemo(() => {
        return magicsArr?.map((magic) => (
            <Magic
                id={magic?._id ?? ''}
                key={magic?._id ?? ''}
                magic={magic}
                isAdding
                onIconClick={() => {
                    if (f.values.points.magics > 0 && f.values.magicsSpace > 0) {
                        setSnackbarOpen(true)

                        f.setFieldValue('magics', [ ...f.values.magics, magic ])
                        f.setFieldValue('points.magics', f.values.points.magics - 1)
                        f.setFieldValue('magicsSpace', f.values.magicsSpace - 1)

                        setSnackbar({ open: true, message: `Magia ${magic.nome} adicionada!`, severity: 'success' })
                    } else {
                        setSnackbar({ open: true, message: 'Você não possui pontos ou espaços de magia suficientes!', severity: 'error' })
                    }
                }}
            />
        ))
    }, [ magicsArr ])

    useEffect(() => {
        if (open) {
            (async () => {
                setPage(1)
                setIsLoading(true)
                const m = await fetchMagics()
    
                setMagicsArr(m)
                setPage(prevPage => prevPage + 1)
            })()
        }
    }, [ open ])

    useEffect(() => {
        (async () => {
            if (entry?.isIntersecting) {
                const m = await fetchMagics()
        
                setMagicsArr(prevMagics => [ ...prevMagics, ...m ])
                setPage(prevPage => prevPage + 1)
            }
        })()
    }, [ entry?.isIntersecting ])

    return (
        <>
            <Modal
                open={open && !isLoading}
                onClose={onClose}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >   
                <Box
                    sx={{
                        height: '95%',
                        width: '95%',
                        bgcolor: 'background.paper3',
                        borderRadius: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        p={3}
                        display='flex'
                        width='100%'
                        flexDirection='column'
                        gap={2}
                    >
                        <Box display='flex' justifyContent='space-between'>
                            <Box display='flex' gap={5} alignItems='center'>
                                <Box display='flex' gap={1} alignItems='center'>
                                    <Typography>Pontos de Magia:</Typography>
                                    <Typography color='primary' fontWeight='900'>{f.values.points.magics}</Typography>
                                </Box>
                                <Box display='flex' gap={1} alignItems='center'>
                                    <Typography>Espaços de Magia:</Typography>
                                    <Typography color='primary' fontWeight='900'>{f.values.magicsSpace}</Typography>
                                </Box>
                            </Box>
                            <Box>
                                <IconButton onClick={onClose}>
                                    <Close />
                                </IconButton>
                            </Box>
                        </Box>
                        <Box
                            display='flex'
                            width='100%'
                            justifyContent='space-between'
                            gap={2}
                        >
                            <Box>
                                <TextField 
                                    placeholder='Pesquisar...'
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            bgcolor: 'background.paper3',
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column'
                        }}
                    >
                        <Grid container
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 5,
                                overflow: 'auto',
                                height: '85%',
                                p: 3
                            }}
                        >
                            {magics}
                            { !isInlimit && <CircularProgress ref={ref} /> }
                        </Grid>
                    </Box>
                </Box>
            </Modal>
            <Backdrop open={open}>
                <CircularProgress />
            </Backdrop>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => { setSnackbarOpen(false) }}>
                <Alert onClose={() => { setSnackbarOpen(false) }} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
})

MagicsModal.displayName = 'MagicsModal'
export default MagicsModal