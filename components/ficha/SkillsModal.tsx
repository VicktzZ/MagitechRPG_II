/* eslint-disable react-hooks/exhaustive-deps */
import useDebounce from '@hooks/useDebounce';
import { useIntersection } from '@mantine/hooks';
import { Backdrop, Box, Button, CircularProgress, Grid, MenuItem, Modal, TextField, Typography, useTheme } from '@mui/material';
import { useState, type ReactElement, type MouseEvent, useMemo, useEffect } from 'react';
import type { Ficha, MagicPower } from '@types';
import { useSnackbar } from 'notistack';
import { ArrowDropDown, ArrowDropUp, Close } from '@mui/icons-material';
import { CustomMenu } from '@layout';
import { type FormikContextType, useFormikContext } from 'formik';
import { Magic } from '.';

export default function SkillsModal({ open, onClose }: { open: boolean, onClose: () => void }): ReactElement {
    const f: FormikContextType<Ficha> = useFormikContext();

    const theme = useTheme();
    // const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ buttonSelected, setButtonSelected ] = useState({
        adicionar: true,
        criar: false,
        remover: false
    });

    const [ fetchOptions, setFetchOptions ] = useState({
        search: '',
        filter: '',
        sort: 'Nível'
    });

    const debouncedSearch = useDebounce(fetchOptions.search, 500);
    const { ref, entry } = useIntersection({ threshold: 1 });

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ isLoadingRefetch, setIsLoadingRefetch ] = useState<boolean>(false);
    const [ magicPowerArr, setMagicPowerArr ] = useState<MagicPower[]>([] as MagicPower[]);
    const [ page, setPage ] = useState<number>(1);
    const [ isInlimit, setIsInLimit ] = useState<boolean>(false);

    const [ anchorEl, setAnchorEl ] = useState<EventTarget & HTMLDivElement | null>(null);
    const [ menuOpen, setMenuOpen ] = useState<boolean>(false);
    const [ menuContent, setMenuContent ] = useState<ReactElement[]>([]);

    const btnClick = (ev: MouseEvent<HTMLButtonElement>): void => {
        const btnName = ev.currentTarget.innerText.toLowerCase() as keyof typeof buttonSelected;
        setButtonSelected({
            adicionar: false,
            criar: false,
            remover: false,
            [btnName]: true
        });
    };
    const fetchMagicPowers = async (): Promise<MagicPower[]> => {
        const url = `/api/poder?${fetchOptions ? Object.keys(fetchOptions).map((key) => `${key}=${fetchOptions[key as keyof typeof fetchOptions]}`).join('&') : ''}`;

        console.log(url);

        const data: MagicPower[] = await fetch(url).then(async r => await r.json());
        console.log(data);

        let result = data.slice((page - 1) * 20, page * 20);

        setIsLoading(false);

        console.log(result);
        
        if (magicPowerArr.length >= data.length) {
            setIsInLimit(true);
            result = [];
        }
        
        return result;
    };

    useEffect(() => {
        if (open) {
            (async () => {
                setPage(1);
                
                setIsLoading(true);
                
                const m = await fetchMagicPowers();
    
                setMagicPowerArr(m);
                setPage(prevPage => prevPage + 1);
            })();
        }
    }, [ open ]);

    useEffect(() => {
        (async () => {
            if (!fetchOptions.filter && !fetchOptions.search) return;
            const url = `/api/poder?${fetchOptions ? Object.keys(fetchOptions).map((key) => `${key}=${fetchOptions[key as keyof typeof fetchOptions]}`).join('&') : ''}`;
            const data: MagicPower[] = await fetch(url).then(async r => await r.json());

            setMagicPowerArr(data);
            setIsLoadingRefetch(false);
        })();
    }, [ fetchOptions.filter, fetchOptions.sort ]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setPage(0);
                
            const url = `/api/poder?${fetchOptions ? Object.keys(fetchOptions).map((key) => `${key}=${fetchOptions[key as keyof typeof fetchOptions]}`).join('&') : ''}`;
            const data: MagicPower[] = await fetch(url).then(async r => await r.json());

            setMagicPowerArr(data);
            setPage(prevPage => prevPage + 1);
            setIsLoadingRefetch(false);
        };

        console.log(debouncedSearch);        

        if (debouncedSearch) fetchData();
    }, [ debouncedSearch ]);

    useEffect(() => {
        if (fetchOptions.search) {
            setIsLoadingRefetch(true);
        }
    }, [ fetchOptions.search ]);

    useEffect(() => {
        (async () => {
            if (entry?.isIntersecting) {
                const m = await fetchMagicPowers();
        
                setMagicPowerArr(prevMagics => [ ...prevMagics, ...m ]);
                setPage(prevPage => prevPage + 1);
            }
        })();
    }, [ entry?.isIntersecting ]);

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
                        ];
                        
                        enqueueSnackbar(
                            `Poder Mágico ${magicPower?.nome} adicionado!`,
                            {
                                variant: 'success',
                                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar(magicPower?.nome); }} />,
                                key: magicPower?.nome,
                                autoHideDuration: 3000
                            }
                        );
                    } else {
                        enqueueSnackbar(
                            'Seu nível de ORM não é suficiente!',
                            {
                                variant: 'error',
                                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => { closeSnackbar('ORMLevelError'); }} />,
                                preventDuplicate: true,
                                key: 'ORMLevelError',
                                autoHideDuration: 3000
                            }
                        );
                    }
                }}
            />
        ));
    }, [ magicPowerArr, f.values.magics ]);

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
                            <Button onClick={btnClick} variant={buttonSelected.adicionar ? 'contained' : 'outlined'}>Adicionar</Button>
                            <Button onClick={btnClick} variant={buttonSelected.criar ? 'contained' : 'outlined'}>Criar</Button>
                            <Button onClick={btnClick} variant={buttonSelected.remover ? 'contained' : 'outlined'}>Remover</Button>
                        </Box>
                    </Box>
                    <Box>
                        {
                            buttonSelected.adicionar ? (
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
                                                    setFetchOptions({ ...fetchOptions, search: e.target.value });
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
                                                        });
                                                        
                                                        setMenuOpen(false);
                                                        setIsLoadingRefetch(true);
                                                    };

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
                                                                setMenuOpen(false);
                                                                setFetchOptions({ ...fetchOptions, filter: '' });
                                                                setIsLoadingRefetch(true);
                                                            }} 
                                                            key='NENHUM_FILTER' 
                                                            value=''
                                                        >Nenhum</MenuItem>
                                                    ]);
                                                    setAnchorEl(e.currentTarget);
                                                    setMenuOpen(true);
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
                                                        });

                                                        setMenuOpen(false);
                                                        setIsLoadingRefetch(true);
                                                    };

                                                    setMenuContent([
                                                        <MenuItem onClick={menuItemOnClick} key='Nível_SORT' value='Nível'>Nível</MenuItem>,
                                                        <MenuItem onClick={menuItemOnClick} key='Alfabéticao_SORT' value='Alfabéticao'>Alfabética</MenuItem>,
                                                        <MenuItem
                                                            onClick={() => { 
                                                                setMenuOpen(false);
                                                                setFetchOptions({ ...fetchOptions, sort: '' });
                                                                setIsLoadingRefetch(true);
                                                            }} 
                                                            key='NENHUM_SORT' 
                                                            value=''
                                                        >Nenhum</MenuItem>
                                                    ]);
                                                    setAnchorEl(e.currentTarget);
                                                    setMenuOpen(true);
                                                }}
                                            >
                                                <Typography>Organização: </Typography>
                                                <Typography>{fetchOptions.sort || 'Nenhum'}</Typography>
                                                <ArrowDropDown />
                                            </Box>
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
                                                    { !isInlimit && <CircularProgress ref={ref} /> }
                                                </>
                                            ) : (
                                                <CircularProgress />
                                            )
                                        }
                                    </Grid>
                                </Box>
                            ) : buttonSelected.criar ? (
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
                                        );
                                    })}
                                </Box>
                            )
                        }
                        <CustomMenu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={() => { setMenuOpen(false); }}
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
    );
}