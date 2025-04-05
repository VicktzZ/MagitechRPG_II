/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable react-hooks/exhaustive-deps */
import { useIntersection, useDebouncedCallback } from '@mantine/hooks';
import { Backdrop, Box, Button, CircularProgress, Grid, MenuItem, Modal, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type ReactElement, type MouseEvent, useMemo, useEffect } from 'react';
import type { Ficha, MagicPower } from '@types';
import { useSnackbar } from 'notistack';
import { ArrowDropDown, ArrowDropUp, Close } from '@mui/icons-material';
import { CustomMenu } from '@layout';
import { type FormikContextType, useFormikContext } from 'formik';
import { Magic } from '.';
import { poderService } from '@services';
import { toastDefault } from '@constants';

export default function SkillsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const f: FormikContextType<Ficha> = useFormikContext()
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ isLoadingRefetch, setIsLoadingRefetch ] = useState<boolean>(false)
    const [ magicPowerArr, setMagicPowerArr ] = useState<MagicPower[]>([] as MagicPower[])
    const [ page, setPage ] = useState<number>(1)
    const [ isInlimit, setIsInLimit ] = useState<boolean>(false)

    const [ anchorEl, setAnchorEl ] = useState<EventTarget & HTMLDivElement | null>(null)
    const [ menuOpen, setMenuOpen ] = useState<boolean>(false)
    const [ menuContent, setMenuContent ] = useState<ReactElement[]>([])

    const [ buttonSelected, setButtonSelected ] = useState({
        add: true,
        create: false,
        remove: false
    })

    const [ fetchOptions, setFetchOptions ] = useState({
        search: '',
        filter: '',
        sort: {
            value: 'Nivel',
            order: 'ASC'
        }
    })

    const debouncedSearch = useDebouncedCallback(() => fetchOptions.search, 500)

    const { ref, entry } = useIntersection({ threshold: 1 })

    const btnClick = (ev: MouseEvent<HTMLButtonElement>): void => {
        const btnName = ev.currentTarget.innerText.toLowerCase() as keyof typeof buttonSelected
        setButtonSelected({
            add: false,
            create: false,
            remove: false,
            [btnName]: true
        })
    }

    const fetchMagicPowers = async (): Promise<MagicPower[]> => {
        const params = {
            search: fetchOptions.search,
            filter: fetchOptions.filter,
            sort: fetchOptions.sort.value,
            order: fetchOptions.sort.order
        }

        const data = await poderService.fetch(params)
        console.log(data)

        let result = data.slice((page - 1) * 20, page * 20)

        setIsLoading(false)

        console.log(result);

        if (magicPowerArr.length >= data.length) {
            setIsInLimit(true)
            result = []
        }

        return result
    }

    useEffect(() => {
        if (open) {
            (async () => {
                setPage(1)

                setIsLoading(true)

                const m = await fetchMagicPowers()

                setMagicPowerArr(m)
                setPage(prevPage => prevPage + 1)
            })()
        }
    }, [ open ])

    useEffect(() => {
        (async () => {
            setIsLoadingRefetch(true)

            const params = {
                search: fetchOptions.search,
                filter: fetchOptions.filter,
                sort: fetchOptions.sort.value,
                order: fetchOptions.sort.order
            }

            const data = await poderService.fetch(params)

            setMagicPowerArr(data)
            setIsLoadingRefetch(false)
        })()
    }, [ fetchOptions.filter, fetchOptions.sort, fetchOptions.search, open ])

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setPage(0)

            const params = {
                search: fetchOptions.search,
                filter: fetchOptions.filter,
                sort: fetchOptions.sort.value,
                order: fetchOptions.sort.order
            }

            const data = await poderService.fetch(params)

            setMagicPowerArr(data)
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
                const m = await fetchMagicPowers()

                setMagicPowerArr(prevMagics => [ ...prevMagics, ...m ])
                setPage(prevPage => prevPage + 1)
            }
        })()
    }, [ entry?.isIntersecting ])

    const magicPowers = useMemo(() => {
        return magicPowerArr?.map((magicPower) => (
            <Magic
                as='magic-power'
                id={magicPower?._id ?? ''}
                key={magicPower?._id ?? ''}
                magicPower={magicPower}
                isAdding
                onIconClick={() => {
                    if (f.values.ORMLevel >= Number(magicPower['pré-requisito']?.split(' ')[2]?.replace(',', '') ?? 0)) {
                        f.values.skills.powers = [
                            ...f.values.skills.powers,
                            {
                                name: magicPower.nome,
                                description: `${magicPower.descrição}\n\nPré-requisitos: ${magicPower['pré-requisito'] ?? 'Nenhum'}`,
                                type: 'Poder Mágico'
                            }
                        ]

                        enqueueSnackbar(`Poder Mágico ${magicPower?.nome} adicionado!`,{
                            ...toastDefault(magicPower?.nome, 'success'),
                            action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar(magicPower?.nome) }} />
                        })
                    } else {
                        enqueueSnackbar('Seu nível de ORM não é suficiente!', {
                            ...toastDefault('ORMLevelError', 'error'),
                            action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar('ORMLevelError') }} />
                        })
                    }
                }}
            />
        ))
    }, [ magicPowerArr, f.values.magics ])

    const menuItemOnClick = (ev: MouseEvent<HTMLLIElement> & { target: { innerText: string } }, filterType: 'filter' | 'sort' | 'sort-order'): void => {
        let value: any = ev.target.innerText

        if (filterType === 'sort-order') {
            value = {
                value: fetchOptions.sort.value,
                order: value
            }
        } else if (filterType === 'sort') {
            value = {
                value,
                order: fetchOptions.sort.order
            }
        }

        filterType = filterType === 'sort-order' ? 'sort' : filterType

        console.log({
            ...fetchOptions,
            [filterType]: value
        })

        setFetchOptions({
            ...fetchOptions,
            [filterType]: value
        })

        setMenuOpen(false)
        setIsLoadingRefetch(true)
    }

    return (
        <>
            <Modal
                open={open && !isLoading}
                onClose={onClose}
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Box
                    display='flex'
                    flexDirection='column'
                    height='90%'
                    width='90%'
                    bgcolor='background.paper3'
                    borderRadius={2}
                    p={2}
                    gap={2}
                >
                    <Box display='flex' flexDirection='column' gap={2}>
                        <Box>
                            <Typography variant='h6'>Habilidades</Typography>
                        </Box>
                        <Box display='flex' gap={2}>
                            <Button onClick={btnClick} variant={buttonSelected.add ? 'contained' : 'outlined'}>Adicionar</Button>
                            <Button onClick={btnClick} variant={buttonSelected.create ? 'contained' : 'outlined'}>Criar</Button>
                            <Button onClick={btnClick} variant={buttonSelected.remove ? 'contained' : 'outlined'}>Remover</Button>
                        </Box>
                    </Box>
                    <Box>
                        {
                            buttonSelected.add ? (
                                <Box
                                    display='flex'
                                    width='100%'
                                    justifyContent='space-between'
                                    alignItems='center'
                                    gap={5}
                                    flexDirection='column'
                                >
                                    <Box display='flex' width='100%' gap={2}>
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
                                        <Box sx={{
                                            display: 'flex',
                                            gap: matches ? 1 : 2,
                                            width: matches ? '100%' : 'auto',
                                            ...( matches && { overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } } )
                                        }}>
                                            <Box
                                                display='flex'
                                                border={`solid 1px ${theme.palette.primary.main}`}
                                                borderRadius={1}
                                                p={1.5}
                                                gap={1}
                                                sx={{ cursor: 'pointer' }}
                                                onClick={e => {
                                                    const onClick = (ev: MouseEvent<HTMLLIElement> & { target: { innerText: string } }) => { menuItemOnClick(ev, 'filter'); }

                                                    setMenuContent([
                                                        <MenuItem onClick={onClick} key='FOGO_FILTER' value='FOGO'>FOGO</MenuItem>,
                                                        <MenuItem onClick={onClick} key='ÁGUA_FILTER' value='ÁGUA'>ÁGUA</MenuItem>,
                                                        <MenuItem onClick={onClick} key='AR_FILTER' value='AR'>AR</MenuItem>,
                                                        <MenuItem onClick={onClick} key='TERRA_FILTER' value='TERRA'>TERRA</MenuItem>,
                                                        <MenuItem onClick={onClick} key='ELETRICIDADE_FILTER' value='ELETRICIDADE'>ELETRICIDADE</MenuItem>,
                                                        <MenuItem onClick={onClick} key='TREVAS_FILTER' value='TREVAS'>TREVAS</MenuItem>,
                                                        <MenuItem onClick={onClick} key='LUZ_FILTER' value='LUZ'>LUZ</MenuItem>,
                                                        <MenuItem onClick={onClick} key='NÃO-ELEMENTAL_FILTER' value='NÃO-ELEMENTAL'>NÃO-ELEMENTAL</MenuItem>,
                                                        <MenuItem onClick={onClick} key='NENHUM_FILTER' value=''>Nenhum</MenuItem>
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
                                                    const onClick = (ev: MouseEvent<HTMLLIElement> & { target: { innerText: string } }) => { menuItemOnClick(ev, 'sort'); }

                                                    setMenuContent([
                                                        <MenuItem onClick={onClick} key='Nível_SORT' value='Nível'>Nível</MenuItem>,
                                                        <MenuItem onClick={onClick} key='Alfabética_SORT' value='Alfabética'>Alfabética</MenuItem>,
                                                        <MenuItem onClick={onClick} key='Nenhum_SORT' value=''>Nenhum</MenuItem>
                                                    ])
                                                    setAnchorEl(e.currentTarget)
                                                    setMenuOpen(true)
                                                }}
                                            >
                                                <Typography>Organização: </Typography>
                                                <Typography>{fetchOptions.sort.value || 'Nenhum'}</Typography>
                                                <ArrowDropDown />
                                            </Box>
                                            {fetchOptions.sort.value && fetchOptions.sort.value !== 'Nenhum' && (
                                                <Box
                                                    display='flex'
                                                    border={`solid 1px ${theme.palette.primary.main}`}
                                                    borderRadius={1}
                                                    p={1.5}
                                                    gap={1}
                                                    sx={{ cursor: 'pointer' }}
                                                    onClick={e => {
                                                        const onClick = (ev: MouseEvent<HTMLLIElement> & { target: { innerText: string } }) => { menuItemOnClick(ev, 'sort-order'); }

                                                        setMenuContent([
                                                            <MenuItem onClick={onClick} key='ASC_SORT-ORDER' value='ASC'>ASC</MenuItem>,
                                                            <MenuItem onClick={onClick} key='DESC_SORT-ORDER' value='DESC'>DESC</MenuItem>
                                                        ])
                                                        setAnchorEl(e.currentTarget)
                                                        setMenuOpen(true)
                                                    }}
                                                >
                                                    <Typography>Ordem: </Typography>
                                                    <Typography>{fetchOptions.sort.order}</Typography>
                                                    <ArrowDropDown />
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    <Grid container
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 5,
                                            overflow: 'auto',
                                            height: '65vh',
                                            p: 3
                                        }}
                                    >
                                        {
                                            !isLoadingRefetch ? (
                                                <>
                                                    {magicPowers}
                                                    {!isInlimit && <CircularProgress ref={ref} />}
                                                </>
                                            ) : (
                                                <CircularProgress />
                                            )
                                        }
                                    </Grid>
                                </Box>
                            ) : buttonSelected.create ? (
                                <Box>
                                    <TextField />
                                </Box>
                            ) : (
                                <Box display='flex' flexDirection='column' gap={2}>
                                    {Object.values(f.initialValues.skills).map((skill, index) => {
                                        console.log(skill);

                                        return (
                                            <Box p={2} key={skill[index]?.name}>
                                                <Typography>{skill[index]?.name}</Typography>
                                                <Typography>{skill[index]?.type}</Typography>
                                            </Box>
                                        )
                                    })}
                                </Box>
                            )
                        }
                        <CustomMenu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={() => { setMenuOpen(false) }}
                        >
                            {menuContent}
                        </CustomMenu>
                    </Box>
                </Box>
            </Modal>
            <Backdrop open={open && isLoading}>
                <CircularProgress />
            </Backdrop>
        </>
    )
}