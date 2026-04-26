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
import { useSnackbar } from 'notistack';
import { type ReactElement, useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useInView } from 'react-intersection-observer';

import { toastDefault } from '@constants';
import { useResourceList } from '@hooks/useResourceList';
import { CustomMenu } from '@layout';
import type { ResourceListModalProps } from '@models/types/components';

function ResourceListModal({
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
}: ResourceListModalProps<any>): ReactElement {
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
        addItem,
        loadMore,
        search,
        filter,
        sort,
        buttonSelected
    } = useResourceList({
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
        threshold: 0.5, // Aumentado para evitar carregamentos prematuros
        triggerOnce: false,
        delay: 300 // Adiciona um delay para evitar múltiplos disparos
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        
        if (inView && hasNextPage && !isFetchingNextPage) {
            // Usa um timeout para evitar múltiplas chamadas em sequência
            timeoutId = setTimeout(() => {
                loadMore();
            }, 200);
        }
        
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
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

    const sortMenuItems = useMemo(() => {
        return [
            ...sortOptions.map(option => (
                <MenuItem key={option} onClick={() => handleSortSelect(option)}>{option}</MenuItem>
            )),
            <MenuItem key="Nenhum" onClick={() => handleSortSelect('')}>Nenhum</MenuItem>
        ];
    }, [ sortOptions, handleSortSelect ]);
    
    const sortOrderMenuItems = useMemo(() => {
        return [
            <MenuItem key="ASC" onClick={() => handleSortOrderSelect('ASC')}>ASC</MenuItem>,
            <MenuItem key="DESC" onClick={() => handleSortOrderSelect('DESC')}>DESC</MenuItem>
        ];
    }, [ handleSortOrderSelect ]);

    const filterMenuItems = useMemo(() => {
        return filterOptions.map(option => (
            <MenuItem key={option} onClick={() => handleFilterSelect(option)}>{option}</MenuItem>
        ));
    }, [ filterOptions, handleFilterSelect ]);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, type: 'filter' | 'sort' | 'sort-order') => {
        switch (type) {
        case 'filter':
            setMenuContent(filterMenuItems);
            break;

        case 'sort':
            setMenuContent(sortMenuItems);
            break;

        case 'sort-order':
            setMenuContent(sortOrderMenuItems);
            break;
        }

        setMenuAnchor(event.currentTarget);
    }, [ filterMenuItems, sortMenuItems, sortOrderMenuItems ]);

    const handleAddItem = useCallback((item: any) => {
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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" gap={1} alignItems="center">
                            <TextField
                                label="Buscar"
                                variant="outlined"
                                size="small"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                                sx={{ minWidth: '200px' }}
                                autoComplete="off"
                                id="resource-search-field"
                            />
                            
                            {filterOptions?.length > 0 && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, 'filter')}
                                    endIcon={<ArrowDropDown />}
                                >
                                    {filter || 'Filtro'}
                                </Button>
                            )}
                            
                            {sortOptions?.length > 0 && (
                                <Box display="flex" gap={1} alignItems="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, 'sort')}
                                        endIcon={<ArrowDropDown />}
                                    >
                                        {sort.value || 'Ordenar por'}
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, 'sort-order')}
                                        endIcon={<ArrowDropDown />}
                                    >
                                        {sort.order}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    
                    {items.length === 0 && !isLoading ? (
                        <Box textAlign="center" py={4}>
                            <Typography variant="body1" color="text.secondary">
                                Nenhum item encontrado.
                            </Typography>
                        </Box>
                    ) : (
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
                            <Grid container spacing={2}>
                                {items.map((item, index) => {
                                    const itemId = item.id || index;
                                    
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={itemId}>
                                            {renderResource({
                                                item,
                                                handleAddItem: () => handleAddItem(item)
                                            })}
                                        </Grid>
                                    );
                                })}
                                
                                {/* Elemento de referência para carregar mais */}
                                {hasNextPage && (
                                    <Grid item xs={12} ref={loadMoreRef}>
                                        <Box display="flex" justifyContent="center" p={2}>
                                            {isFetchingNextPage ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Carregando mais...
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
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

    // Memoiza o conteúdo do modal para evitar re-renderizações desnecessárias
    const modalContent = useMemo(() => {
        return renderContent();
    }, [ renderContent, buttonSelected.add, items, isLoading, hasNextPage, isFetchingNextPage ]);
    
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
                        modalContent
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

export default memo(ResourceListModal);
