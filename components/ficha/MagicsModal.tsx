/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { Backdrop, Box, CircularProgress, Grid, IconButton, MenuItem, Modal, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { type MouseEvent, type ReactElement, memo, useEffect, useMemo, useState } from 'react';
import { type Ficha, type Magia as MagicType } from '@types';
import { useIntersection } from '@mantine/hooks'
import { ArrowDropDown, ArrowDropUp, Close } from '@mui/icons-material';
import { useFormikContext } from 'formik';
import Magic from './Magic';
import { useSnackbar } from 'notistack';
import { CustomMenu } from '@layout';
import useDebounce from '@hooks/useDebounce';

const MagicsModal = memo(({ open, onClose }: { open: boolean, onClose: () => void}) => {
    const f = useFormikContext<Ficha>()
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ isLoadingRefetch, setIsLoadingRefetch ] = useState<boolean>(false)
    const [ magicsArr, setMagicsArr ] = useState<MagicType[]>([] as MagicType[])
    const [ page, setPage ] = useState<number>(1)
    const [ isInlimit, setIsInLimit ] = useState<boolean>(false)

    const [ anchorEl, setAnchorEl ] = useState<EventTarget & HTMLDivElement | null>(null)
    const [ menuOpen, setMenuOpen ] = useState<boolean>(false)
    const [ menuContent, setMenuContent ] = useState<ReactElement[]>([])

    const [ fetchOptions, setFetchOptions ] = useState({
        search: '',
        filter: '',
        sort: 'Nível'
    })
    
    const debouncedSearch = useDebounce(fetchOptions.search, 500)

    const { ref, entry } = useIntersection({ threshold: 1 })

    const fetchMagics = async (): Promise<MagicType[]> => {
        const url = `/api/magia?${fetchOptions ? Object.keys(fetchOptions).map((key) => `${key}=${fetchOptions[key as keyof typeof fetchOptions]}`).join('&') : ''}`

        console.log(url);

        const data: MagicType[] = await fetch(url).then(async r => await r.json())
        console.log(data)

        let result = data.slice((page - 1) * 20, page * 20)

        setIsLoading(false)

        console.log(result);
        
        if (magicsArr.length >= data.length) {
            setIsInLimit(true)
            result = []
        }
        
        return result
    }

    const magics = useMemo(() => {
        return magicsArr?.map((magic) => (
            <Magic
                as='magic-spell'
                id={magic?._id ?? ''}
                key={magic?._id ?? ''}
                magic={magic}
                isAdding
                onIconClick={() => {
                    if (f.values.ORMLevel >= Number(magic.nível)) {
                        if (f.values.points.magics > 0 && f.values.magicsSpace > 0) {
                            f.setFieldValue('magics', [ ...f.values.magics, magic ])
                            f.setFieldValue('points.magics', f.values.points.magics - 1)
                            f.setFieldValue('magicsSpace', f.values.magicsSpace - 1)
    
                            enqueueSnackbar(
                                `Magia ${magic?.nome} adicionada!`,
                                {
                                    variant: 'success',
                                    action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar(magic?.nome) }} />,
                                    key: magic?.nome,
                                    autoHideDuration: 3000
                                }
                            )
                        } else {
                            enqueueSnackbar(
                                'Você não possui pontos ou espaços de magia suficientes!',
                                {
                                    variant: 'error',
                                    action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar('insufficientPointsError') }} />,
                                    preventDuplicate: true,
                                    key: 'insufficientPointsError',
                                    autoHideDuration: 3000
                                }
                            )
                        }
                    } else {
                        enqueueSnackbar(
                            'Seu nível de ORM não é suficiente!',
                            {
                                variant: 'error',
                                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar('ORMLevelError') }} />,
                                preventDuplicate: true,
                                key: 'ORMLevelError',
                                autoHideDuration: 3000
                            }
                        )
                    }
                }}
            />
        ))
    }, [ magicsArr, f.values.magics ])

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
            if (!fetchOptions.filter && !fetchOptions.search) return
            const url = `/api/magia?${fetchOptions ? Object.keys(fetchOptions).map((key) => `${key}=${fetchOptions[key as keyof typeof fetchOptions]}`).join('&') : ''}`
            const data: MagicType[] = await fetch(url).then(async r => await r.json())

            setMagicsArr(data)
            setIsLoadingRefetch(false)
        })()
    }, [ fetchOptions.filter, fetchOptions.sort ])

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setPage(0)
                
            const url = `/api/magia?${fetchOptions ? Object.keys(fetchOptions).map((key) => `${key}=${fetchOptions[key as keyof typeof fetchOptions]}`).join('&') : ''}`
            const data: MagicType[] = await fetch(url).then(async r => await r.json())

            setMagicsArr(data)
            setPage(prevPage => prevPage + 1)
            setIsLoadingRefetch(false)
        }

        console.log(debouncedSearch);        

        if (debouncedSearch) fetchData()
    }, [ debouncedSearch ])

    useEffect(() => {
        if (fetchOptions.search) {
            setIsLoadingRefetch(true)
        }
    }, [ fetchOptions.search ])

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
                            alignItems='center'
                            gap={5}
                            flexDirection={matches ? 'column' : 'row'}
                        >
                            <Box width='100%'>
                                <TextField 
                                    placeholder='Pesquisar...'
                                    fullWidth
                                    value={fetchOptions.search}
                                    onChange={e => {
                                        setFetchOptions({ ...fetchOptions, search: e.target.value })
                                    }}
                                />
                            </Box>
                            <Box display='flex' gap={2}>
                                <Box 
                                    display='flex' 
                                    border={`solid 1px ${theme.palette.primary.main}`} 
                                    borderRadius={1}
                                    p={1.5} 
                                    gap={1}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={e => {
                                        const menuItemOnClick = (ev: MouseEvent<HTMLLIElement> & { target: { innerText: string } }): void => {
                                            setFetchOptions({
                                                ...fetchOptions,
                                                filter: ev.target.innerText
                                            })
                                            
                                            setMenuOpen(false)
                                            setIsLoadingRefetch(true)
                                        }

                                        setMenuContent([
                                            <MenuItem onClick={menuItemOnClick} key='FOGO_FILTER' value='FOGO'>FOGO</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='ÁGUA_FILTER' value='ÁGUA'>ÁGUA</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='AR_FILTER' value='AR'>AR</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='TERRA_FILTER' value='TERRA'>TERRA</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='PLANTA_FILTER' value='PLANTA'>PLANTA</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='GELO_FILTER' value='GELO'>GELO</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='METAL_FILTER' value='METAL'>METAL</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='ELETRICIDADE_FILTER' value='ELETRICIDADE'>ELETRICIDADE</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='PSÍQUICO_FILTER' value='PSÍQUICO'>PSÍQUICO</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='TREVAS_FILTER' value='TREVAS'>TREVAS</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='LUZ_FILTER' value='LUZ'>LUZ</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='TOXINA_FILTER' value='TOXINA'>TOXINA</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='NÃO-ELEMENTAL_FILTER' value='NÃO-ELEMENTAL'>NÃO-ELEMENTAL</MenuItem>,
                                            <MenuItem 
                                                onClick={() => { 
                                                    setMenuOpen(false)
                                                    setFetchOptions({ ...fetchOptions, filter: '' });
                                                    setIsLoadingRefetch(true)
                                                }} 
                                                key='NENHUM_FILTER' 
                                                value=''
                                            >Nenhum</MenuItem>
                                        ])
                                        setAnchorEl(e.currentTarget)
                                        setMenuOpen(true)
                                    }}
                                >
                                    <Typography>Filtro: </Typography>
                                    <Typography>{fetchOptions.filter || 'Nenhum'}</Typography>
                                    {fetchOptions.filter ? (
                                        <ArrowDropUp />
                                    ) : (
                                        <ArrowDropDown />
                                    )}
                                </Box>
                                <Box
                                    display='flex' 
                                    border={`solid 1px ${theme.palette.primary.main}`} 
                                    borderRadius={1}
                                    p={1.5} 
                                    gap={1}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={e => {
                                        const menuItemOnClick = (ev: MouseEvent<HTMLLIElement> & { target: { innerText: string } }): void => {
                                            setFetchOptions({
                                                ...fetchOptions,
                                                sort: ev.target.innerText
                                            })

                                            setMenuOpen(false)
                                            setIsLoadingRefetch(true)
                                        }

                                        setMenuContent([
                                            <MenuItem onClick={menuItemOnClick} key='Nível_SORT' value='Nível'>Nível</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='Custo_SORT' value='Custo'>Custo</MenuItem>,
                                            <MenuItem onClick={menuItemOnClick} key='Alfabéticao_SORT' value='Alfabéticao'>Alfabética</MenuItem>,
                                            <MenuItem
                                                onClick={() => { 
                                                    setMenuOpen(false)
                                                    setFetchOptions({ ...fetchOptions, sort: '' });
                                                    setIsLoadingRefetch(true)
                                                }} 
                                                key='NENHUM_SORT' 
                                                value=''
                                            >Nenhum</MenuItem>
                                        ])
                                        setAnchorEl(e.currentTarget)
                                        setMenuOpen(true)
                                    }}
                                >
                                    <Typography>Organização: </Typography>
                                    <Typography>{fetchOptions.sort || 'Nenhum'}</Typography>
                                    <ArrowDropDown />
                                </Box>
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
                            {
                                !isLoadingRefetch ? (
                                    <>
                                        {magics}
                                        { !isInlimit && <CircularProgress ref={ref} /> }
                                    </>
                                ) : (
                                    <CircularProgress />
                                )
                            }
                        </Grid>
                    </Box>
                </Box>
            </Modal>
            <Backdrop open={open}>
                <CircularProgress />
            </Backdrop>
            <CustomMenu 
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => { setMenuOpen(false) }}
            >
                {menuContent}
            </CustomMenu>
        </>
    )
})

MagicsModal.displayName = 'MagicsModal'
export default MagicsModal