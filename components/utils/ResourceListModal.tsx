/* eslint-disable @typescript-eslint/no-shadow */
import { ArrowDropDown, Close } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    MenuItem,
    Modal,
    TextField,
    Typography
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useSnackbar } from 'notistack';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { toastDefault } from '@constants';
import { useResourceList } from '@hooks/useResourceList';
import { CustomMenu } from '@layout';
import type { Ficha, ResourceListModalProps } from '@types';

export default function ResourceListModal<T extends Record<string, any>>({
    open,
    onClose,
    queryKey,
    fetchFunction,
    addFunction,
    validateAdd,
    successMessage,
    errorMessage,
    filterOptions,
    sortOptions,
    title,
    renderResource
}: ResourceListModalProps<T>): ReactElement {
    const f = useFormikContext<Ficha>();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ menuAnchor, setMenuAnchor ] = useState<HTMLElement | null>(null);
    const [ menuContent, setMenuContent ] = useState<ReactElement[]>([]);

    const {
        items,
        isLoading,
        isError,
        error,
        hasNextPage,
        isFetchingNextPage,
        setSearch,
        setFilter,
        setSort,
        setButtonSelected,
        addItem,
        loadMore,
        search,
        filter,
        sort,
        buttonSelected
    } = useResourceList<T>({
        initialSearch: '',
        initialFilter: '',
        initialSort: { value: 'Nível', order: 'ASC' as const },
        pageSize: 20,
        queryKey,
        fetchFunction,
        successMessage,
        errorMessage,
        addFunction,
        validateAdd
    });

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            loadMore();
        }
    }, [ inView, hasNextPage, isFetchingNextPage, loadMore ]);

    const handleFilterSelect = useCallback((value: string) => {
        setFilter(value);
        setMenuAnchor(null);
    }, [ setFilter ]);

    const handleSortSelect = useCallback((value: string) => {
        setSort(prev => ({ ...prev, value }));
        setMenuAnchor(null);
    }, [ setSort ]);

    const handleSortOrderSelect = useCallback((order: 'ASC' | 'DESC') => {
        setSort(prev => ({ ...prev, order }));
        setMenuAnchor(null);
    }, [ setSort ]);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, type: 'filter' | 'sort' | 'sort-order') => {
        switch (type) {
        case 'filter':
            setMenuContent(filterOptions.map(option => (
                <MenuItem key={option} onClick={() => handleFilterSelect(option)}>{option}</MenuItem>
            )));
            break;

        case 'sort':
            setMenuContent([
                ...sortOptions.map(option => (
                    <MenuItem key={option} onClick={() => handleSortSelect(option)}>{option}</MenuItem>
                )),
                <MenuItem key="Nenhum" onClick={() => handleSortSelect('')}>Nenhum</MenuItem>
            ]);
            break;

        case 'sort-order':
            setMenuContent([
                <MenuItem key="ASC" onClick={() => handleSortOrderSelect('ASC')}>ASC</MenuItem>,
                <MenuItem key="DESC" onClick={() => handleSortOrderSelect('DESC')}>DESC</MenuItem>
            ]);
            break;
        }

        setMenuAnchor(event.currentTarget);
    }, []);

    const handleButtonClick = useCallback((type: 'add' | 'create' | 'remove') => {
        setButtonSelected({
            add: type === 'add',
            create: type === 'create',
            remove: type === 'remove'
        });
    }, [ setButtonSelected ]);

    const handleAddItem = useCallback((item: T) => {
        try {
            addItem(item);
        } catch (error: any) {
            enqueueSnackbar(error.message, {
                ...toastDefault('error', 'error'),
                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => closeSnackbar('error')} />
            });
        }
    }, [ addItem, enqueueSnackbar, closeSnackbar ]);

    const renderContent = () => {
        if (buttonSelected.add) {
            return (
                <Box display="flex" flexDirection="column" gap={2} width="100%">
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: '100%' }}>
                        <TextField
                            placeholder="Pesquisar..."
                            fullWidth
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ minWidth: { xs: '100%', sm: '200px' } }}
                        />

                        <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ArrowDropDown />}
                            onClick={(e) => handleMenuOpen(e, 'filter')}
                        >
                            {filter || 'Filtrar'}
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ArrowDropDown />}
                            onClick={(e) => handleMenuOpen(e, 'sort')}
                        >
                            {sort.value || 'Ordenar'}
                        </Button>

                        {sort.value && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => handleMenuOpen(e, 'sort-order')}
                            >
                                {sort.order}
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ 
                        overflowY: 'auto', 
                        overflowX: 'hidden', 
                        maxHeight: '70vh', 
                        width: '100%',
                        '&::-webkit-scrollbar': {
                            width: '6px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '3px'
                        }
                    }}>
                        <Grid 
                            container
                            gap={2}
                            spacing={{ xs: 2, sm: 2 }}
                            sx={{
                                justifyContent: 'center',
                                p: 1,
                                width: '100%',
                                m: 0,
                                '& > .MuiGrid-item': {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    p: '0 !important',
                                    width: '100%',
                                    maxWidth: '25rem'
                                }
                            }}
                        >
                            {items.map((item) => (
                                <Grid item xs={12} sm={6} md={3} lg={3} key={item['id']}>
                                    {renderResource({
                                        item,
                                        handleAddItem: () => handleAddItem(item)
                                    })}
                                </Grid>
                            ))}

                            <Box ref={loadMoreRef} sx={{ width: '100%', height: '20px', gridColumn: '1 / -1' }}>
                                {isFetchingNextPage && (
                                    <Box display="flex" justifyContent="center" p={2}>
                                        <CircularProgress size={24} />
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            );
        } else if (buttonSelected.create) {
            return (
                <Box>
                    <Typography>Funcionalidade de criação em desenvolvimento</Typography>
                </Box>
            );
        } else {
            return (
                <Box display="flex" flexDirection="column" gap={2}>
                    {f.values.skills.powers.map((power, index) => (
                        <Box key={index} p={2} border={1} borderColor="divider" borderRadius={1}>
                            <Typography variant="subtitle1">{power.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {power.type}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            );
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Box
                    sx={{
                        width: '95%',
                        maxWidth: '90vw',
                        maxHeight: '95vh',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">{title}</Typography>
                        <Button onClick={onClose} color="inherit">
                            Fechar
                        </Button>
                    </Box>

                    <Box 
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            '& .MuiButton-root': {
                                flex: { xs: '1 1 100px', sm: '0 1 auto' },
                                whiteSpace: 'nowrap',
                                minWidth: 'auto',
                                px: { xs: 1, sm: 2 },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }
                        }}
                    >
                        <Button
                            variant={buttonSelected.add ? 'contained' : 'outlined'}
                            onClick={() => handleButtonClick('add')}
                            size="small"
                        >
                            Adicionar
                        </Button>
                        <Button
                            variant={buttonSelected.create ? 'contained' : 'outlined'}
                            onClick={() => handleButtonClick('create')}
                            size="small"
                        >
                            Criar
                        </Button>
                        <Button
                            variant={buttonSelected.remove ? 'contained' : 'outlined'}
                            onClick={() => handleButtonClick('remove')}
                            size="small"
                        >
                            Remover
                        </Button>
                    </Box>

                    {isLoading && !items.length ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : isError ? (
                        <Box p={2} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
                            <Typography>Erro ao carregar os poderes: {error?.message}</Typography>
                        </Box>
                    ) : (
                        renderContent()
                    )}
                </Box>
            </Modal>

            {/* Menu de Filtros/Ordenação */}
            <CustomMenu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                {menuContent}
            </CustomMenu>
        </>
    );
}
