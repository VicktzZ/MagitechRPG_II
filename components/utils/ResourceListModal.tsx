/* eslint-disable @typescript-eslint/no-shadow */
import { ArrowDropDown, Close, FilterAltOff, Search } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    MenuItem,
    Modal,
    Popover,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { type ReactElement, useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useInView } from 'react-intersection-observer';

import { toastDefault } from '@constants';
import { useResourceList } from '@hooks/useResourceList';
import { CustomMenu } from '@layout';
import type { ResourceListModalProps } from '@models/types/components';

/** Botão de filtro com menu de múltipla seleção (checkboxes) */
function MultiSelectFilter({
    label,
    options,
    selected,
    onToggle,
    onClear
}: {
    label: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    onClear: () => void;
}): ReactElement {
    const [ anchorEl, setAnchorEl ] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Button
                variant={selected.length > 0 ? 'contained' : 'outlined'}
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ArrowDropDown />}
            >
                {label}{selected.length > 0 ? ` (${selected.length})` : ''}
            </Button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
            >
                <Box sx={{ p: 1.5, minWidth: 220, maxHeight: 320, overflowY: 'auto' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5} gap={1}>
                        <Typography variant="subtitle2">{label}</Typography>
                        {selected.length > 0 && (
                            <Button size="small" onClick={onClear} sx={{ minWidth: 'auto' }}>
                                Limpar
                            </Button>
                        )}
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    {options.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
                            Nenhuma opção disponível.
                        </Typography>
                    ) : (
                        <FormGroup>
                            {options.map(option => (
                                <FormControlLabel
                                    key={option}
                                    sx={{ mr: 0 }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={selected.includes(option)}
                                            onChange={() => onToggle(option)}
                                        />
                                    }
                                    label={<Typography variant="body2">{option}</Typography>}
                                />
                            ))}
                        </FormGroup>
                    )}
                </Box>
            </Popover>
        </>
    );
}

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
    filterLabel = 'Filtro',
    sortOptions,
    sortFieldMap,
    secondaryFilter,
    title,
    renderResource,
    pageSize = 20,
    initialSearch = '',
    initialFilters = [],
    initialSort
}: ResourceListModalProps<any>): ReactElement {
    const theme = useTheme();
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
        toggleFilter,
        clearFilters,
        toggleSecondaryFilter,
        clearSecondaryFilters,
        setSort,
        setButtonSelected,
        addItem,
        loadMore,
        search,
        filters,
        secondaryFilters,
        sort,
        buttonSelected
    } = useResourceList({
        initialSearch,
        initialFilters,
        initialSort: initialSort ?? { value: sortOptions?.[0] ?? 'Nível', order: 'ASC' as const },
        pageSize,
        queryKey,
        fetchFunction,
        successMessage,
        errorMessage,
        addFunction,
        validateAdd,
        sortFieldMap,
        getSecondaryFilterValue: secondaryFilter?.getValue
    });

    const secondaryOptions = useMemo(() => {
        if (!secondaryFilter) return [];
        if (secondaryFilter.options) return secondaryFilter.options;

        const unique = new Set<string>();
        items.forEach(item => {
            const value = secondaryFilter.getValue(item);
            if (value) unique.add(value);
        });

        return Array.from(unique).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [ secondaryFilter, items ]);

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

    const handleButtonClick = useCallback((type: 'add' | 'create') => {
        setButtonSelected({
            add: type === 'add',
            create: type === 'create',
            remove: false
        });
    }, [ setButtonSelected ]);

    const handleSortSelect = useCallback((value: string) => {
        setSort(prev => ({ ...prev, value }));
        setMenuAnchor(null);
    }, [ setSort ]);

    const handleSortOrderSelect = useCallback((order: 'ASC' | 'DESC') => {
        setSort(prev => ({ ...prev, order }));
        setMenuAnchor(null);
    }, [ setSort ]);

    const sortMenuItems = useMemo(() => {
        return sortOptions.map(option => (
            <MenuItem key={option} onClick={() => handleSortSelect(option)}>{option}</MenuItem>
        ));
    }, [ sortOptions, handleSortSelect ]);

    const sortOrderMenuItems = useMemo(() => {
        return [
            <MenuItem key="ASC" onClick={() => handleSortOrderSelect('ASC')}>Crescente</MenuItem>,
            <MenuItem key="DESC" onClick={() => handleSortOrderSelect('DESC')}>Decrescente</MenuItem>
        ];
    }, [ handleSortOrderSelect ]);

    const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, type: 'sort' | 'sort-order') => {
        setMenuContent(type === 'sort' ? sortMenuItems : sortOrderMenuItems);
        setMenuAnchor(event.currentTarget);
    }, [ sortMenuItems, sortOrderMenuItems ]);

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

    const hasActiveFilters = filters.length > 0 || secondaryFilters.length > 0;

    const handleClearAllFilters = useCallback(() => {
        clearFilters();
        clearSecondaryFilters();
    }, [ clearFilters, clearSecondaryFilters ]);

    const renderContent = () => {
        if (buttonSelected.create) {
            return (
                <Box>
                    <Typography>Funcionalidade de criação em desenvolvimento</Typography>
                </Box>
            );
        }

        return (
            <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ width: '100%' }}
                >
                    <TextField
                        placeholder="Buscar..."
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur();
                            }
                        }}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        }}
                        sx={{ minWidth: '200px', flex: { xs: '1 1 100%', sm: '0 1 220px' } }}
                        autoComplete="off"
                        id="resource-search-field"
                    />

                    {filterOptions?.length > 0 && (
                        <MultiSelectFilter
                            label={filterLabel}
                            options={filterOptions}
                            selected={filters}
                            onToggle={toggleFilter}
                            onClear={clearFilters}
                        />
                    )}

                    {secondaryFilter && (
                        <MultiSelectFilter
                            label={secondaryFilter.label}
                            options={secondaryOptions}
                            selected={secondaryFilters}
                            onToggle={toggleSecondaryFilter}
                            onClear={clearSecondaryFilters}
                        />
                    )}

                    {sortOptions?.length > 0 && (
                        <Stack direction="row" gap={1} alignItems="center">
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
                                {sort.order === 'ASC' ? 'Crescente' : 'Decrescente'}
                            </Button>
                        </Stack>
                    )}

                    {hasActiveFilters && (
                        <Button
                            size="small"
                            color="inherit"
                            startIcon={<FilterAltOff fontSize="small" />}
                            onClick={handleClearAllFilters}
                            sx={{ ml: { sm: 'auto' } }}
                        >
                            Limpar filtros
                        </Button>
                    )}
                </Stack>

                {hasActiveFilters && (
                    <Stack direction="row" gap={0.75} flexWrap="wrap">
                        {filters.map(value => (
                            <Chip
                                key={`filter-${value}`}
                                label={value}
                                size="small"
                                onDelete={() => toggleFilter(value)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                        {secondaryFilters.map(value => (
                            <Chip
                                key={`secondary-${value}`}
                                label={value}
                                size="small"
                                onDelete={() => toggleSecondaryFilter(value)}
                                color="secondary"
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                )}

                {items.length === 0 && !isLoading ? (
                    <Box textAlign="center" py={6}>
                        <Typography variant="body1" color="text.secondary">
                            Nenhum item encontrado.
                        </Typography>
                        {hasActiveFilters && (
                            <Button size="small" sx={{ mt: 1 }} onClick={handleClearAllFilters}>
                                Limpar filtros
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box sx={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        maxHeight: '70vh',
                        width: '100%',
                        px: { xs: 0, sm: 1 },
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
                        <Grid container spacing={2} justifyContent="center">
                            {items.map((item, index) => {
                                const itemId = item.id || index;

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={itemId} sx={{ display: 'flex', justifyContent: 'center' }}>
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
    };

    // Memoiza o conteúdo do modal para evitar re-renderizações desnecessárias
    const modalContent = useMemo(() => {
        return renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        buttonSelected, items, isLoading, hasNextPage, isFetchingNextPage,
        search, filters, secondaryFilters, sort, secondaryOptions
    ]);

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
                        borderRadius: 2,
                        boxShadow: 24,
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight={600}>{title}</Typography>
                        <IconButton onClick={onClose} size="small" aria-label="Fechar">
                            <Close />
                        </IconButton>
                    </Box>

                    <Divider />

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
                        <Box p={2} bgcolor={alpha(theme.palette.error.main, 0.1)} color="error.main" borderRadius={1}>
                            <Typography>Erro ao carregar os itens: {error?.message}</Typography>
                        </Box>
                    ) : (
                        modalContent
                    )}
                </Box>
            </Modal>

            {/* Menu de Ordenação */}
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
