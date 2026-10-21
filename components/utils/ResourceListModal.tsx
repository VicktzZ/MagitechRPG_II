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
import { type ReactElement, Fragment, useCallback, useEffect, useMemo, useState, memo } from 'react';
import { useInView } from 'react-intersection-observer';

import { toastDefault } from '@constants';
import { useResourceList } from '@hooks/useResourceList';
import { CustomMenu } from '@layout';
import type { ResourceListModalProps } from '@models/types/components';
import { collectFilterOptions, getClientFilters } from '@utils/filterSelection';
import { color } from '@themes/tokens';

/** Seção (lista de checkboxes) de um menu de filtro */
interface FilterSection {
    label: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    onClear: () => void;
}

/**
 * Botão de filtro com menu de múltipla seleção (checkboxes). Aceita mais de uma seção
 * no mesmo menu (ex: "Tipo" e "Subtipo"), lado a lado em telas largas e empilhadas nas
 * estreitas, cada uma com a sua rolagem; o contador do botão soma as marcadas.
 */
function MultiSelectFilter({
    label,
    sections
}: {
    label: string;
    sections: FilterSection[];
}): ReactElement {
    const [ anchorEl, setAnchorEl ] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const totalSelected = sections.reduce((total, section) => total + section.selected.length, 0);

    return (
        <>
            <Button
                variant={totalSelected > 0 ? 'contained' : 'outlined'}
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ArrowDropDown />}
            >
                {label}{totalSelected > 0 ? ` (${totalSelected})` : ''}
            </Button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1.5,
                        maxHeight: { xs: '70vh', sm: 'none' },
                        overflowY: { xs: 'auto', sm: 'visible' }
                    }}
                >
                    {sections.map((section, index) => (
                        <Fragment key={section.label}>
                            {index > 0 && (
                                <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', sm: 'block' } }} />
                            )}
                            <Box sx={{ minWidth: 200, maxHeight: { sm: 340 }, overflowY: { sm: 'auto' } }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5} gap={1}>
                                    <Typography variant="subtitle2">{section.label}</Typography>
                                    {section.selected.length > 0 && (
                                        <Button size="small" onClick={section.onClear} sx={{ minWidth: 'auto' }}>
                                            Limpar
                                        </Button>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 1 }} />
                                {section.options.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1 }}>
                                        Nenhuma opção disponível.
                                    </Typography>
                                ) : (
                                    <FormGroup>
                                        {section.options.map(option => (
                                            <FormControlLabel
                                                key={option}
                                                sx={{ mr: 0 }}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={section.selected.includes(option)}
                                                        onChange={() => section.onToggle(option)}
                                                    />
                                                }
                                                label={<Typography variant="body2">{option}</Typography>}
                                            />
                                        ))}
                                    </FormGroup>
                                )}
                            </Box>
                        </Fragment>
                    ))}
                </Box>
            </Popover>
        </>
    );
}

/** Quantos itens a grade desenha por vez; o resto entra conforme a rolagem se aproxima do fim */
const RENDER_STEP = 48;

/** Cores dos chips dos filtros do cliente, na ordem dos filtros (Tipo, Subtipo, Execução...) */
const CLIENT_FILTER_CHIP_COLORS = [ 'secondary', 'info', 'warning', 'success' ] as const;

/** Espaço entre os itens da grade, em px */
const GRID_GAP_PX = 12;

/**
 * Colunas da grade: quantas couberem com largura mínima `minWidth`, e no máximo `maxColumns` (em
 * telas muito largas os itens crescem em vez de a lista ganhar mais colunas)
 */
const getGridColumns = (minWidth: number, maxColumns?: number): string => {
    const min = `min(100%, ${minWidth}px)`;
    const columnWidth = maxColumns
        ? `max(${min}, calc((100% - ${(maxColumns - 1) * GRID_GAP_PX}px) / ${maxColumns}))`
        : min;

    return `repeat(auto-fill, minmax(${columnWidth}, 1fr))`;
};

/**
 * Célula da lista. É memoizada para que digitar na busca, marcar filtros ou chegar uma página nova
 * não redesenhe os itens que já estão na tela (cada item pode ser um cartão pesado).
 */
const ResourceCell = memo(function ResourceCell({
    item,
    renderResource,
    onAdd
}: {
    item: any;
    renderResource: ResourceListModalProps<any>['renderResource'];
    onAdd: (item: any) => void;
}): ReactElement {
    return renderResource({ item, handleAddItem: () => onAdd(item) });
});

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
    secondaryFilters: secondaryFilterMenus,
    title,
    renderResource,
    itemMinWidth,
    itemMaxColumns,
    pageSize = 20,
    initialSearch = '',
    initialFilters = [],
    initialSort
}: ResourceListModalProps<any>): ReactElement {
    const theme = useTheme();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ menuAnchor, setMenuAnchor ] = useState<HTMLElement | null>(null);
    const [ menuContent, setMenuContent ] = useState<ReactElement[]>([]);

    // Filtros dos menus extras (cada menu: o principal e, se houver, o subfiltro), na ordem de exibição
    const clientFilters = useMemo(() => getClientFilters(secondaryFilterMenus), [ secondaryFilterMenus ]);

    const {
        items,
        loadedItems,
        isFiltering,
        isLoadingAll,
        isLoading,
        isError,
        error,
        hasNextPage,
        isFetchingNextPage,
        setSearch,
        toggleFilter,
        clearFilters,
        toggleClientFilter,
        clearClientFilter,
        clearClientFilters,
        setSort,
        setButtonSelected,
        addItem,
        loadMore,
        search,
        filters,
        clientSelections,
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
        clientFilters
    });

    // As opções saem dos itens carregados (e não dos já filtrados), para que marcar uma
    // opção não faça as outras sumirem. As fixas vêm primeiro; as demais, achadas nos itens, depois.
    const clientFilterOptions = useMemo(() => Object.fromEntries(
        clientFilters.map(filter => [ filter.key, collectFilterOptions(loadedItems, filter.getValue, filter.options) ])
    ), [ clientFilters, loadedItems ]);

    // Seção do menu de um filtro do cliente
    const getFilterSection = (key: string, label: string): FilterSection => ({
        label,
        options: clientFilterOptions[key] ?? [],
        selected: clientSelections[key] ?? [],
        onToggle: (value) => toggleClientFilter(key, value),
        onClear: () => clearClientFilter(key)
    });

    // Rolagem da lista e janela de renderização: o fim da grade é observado com folga de 800px, então
    // os próximos itens já estão desenhados quando a rolagem chega neles
    const [ scrollEl, setScrollEl ] = useState<HTMLDivElement | null>(null);
    const [ renderLimit, setRenderLimit ] = useState(RENDER_STEP);

    const { ref: loadMoreRef, inView } = useInView({
        root: scrollEl,
        rootMargin: '0px 0px 800px 0px',
        threshold: 0
    });

    // Resultado diferente (busca, filtros, ordenação): volta ao topo e à primeira janela
    useEffect(() => {
        setRenderLimit(RENDER_STEP);
        if (scrollEl) scrollEl.scrollTop = 0;
    }, [ search, filters, clientSelections, sort, scrollEl ]);

    const hasHiddenItems = renderLimit < items.length;
    const visibleItems = hasHiddenItems ? items.slice(0, renderLimit) : items;

    // Com o fim da grade à vista: primeiro desenha os itens que faltam; depois, só sem filtro, busca a
    // próxima página (com filtro tudo já vem de uma vez). Repete a cada passo enquanto o fim seguir à vista.
    useEffect(() => {
        if (!inView) return undefined;

        const timeoutId = setTimeout(() => {
            if (hasHiddenItems) {
                setRenderLimit(limit => limit + RENDER_STEP);
            } else if (!isFiltering && hasNextPage && !isFetchingNextPage) {
                loadMore();
            }
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [ inView, renderLimit, hasHiddenItems, isFiltering, hasNextPage, isFetchingNextPage, loadMore ]);

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

    const hasActiveFilters = filters.length > 0 || Object.values(clientSelections).some(selected => selected.length > 0);

    const handleClearAllFilters = useCallback(() => {
        clearFilters();
        clearClientFilters();
    }, [ clearFilters, clearClientFilters ]);

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
                            sections={[ {
                                label: filterLabel,
                                options: filterOptions,
                                selected: filters,
                                onToggle: toggleFilter,
                                onClear: clearFilters
                            } ]}
                        />
                    )}

                    {secondaryFilterMenus?.map(menu => (
                        <MultiSelectFilter
                            key={menu.label}
                            label={menu.label}
                            sections={[
                                getFilterSection(menu.label, menu.label),
                                ...(menu.subFilter ? [ getFilterSection(`${menu.label}/${menu.subFilter.label}`, menu.subFilter.label) ] : [])
                            ]}
                        />
                    ))}

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
                        {clientFilters.flatMap((filter, index) => (clientSelections[filter.key] ?? []).map(value => (
                            <Chip
                                key={`${filter.key}-${value}`}
                                label={`${filter.label}: ${value}`}
                                size="small"
                                onDelete={() => toggleClientFilter(filter.key, value)}
                                color={CLIENT_FILTER_CHIP_COLORS[index % CLIENT_FILTER_CHIP_COLORS.length]}
                                variant="outlined"
                            />
                        )))}
                    </Stack>
                )}

                {/* Contador de cada busca (texto e/ou filtros). Com busca ativa tudo é carregado, então o número
                    é o total; enquanto carrega, mostra o andamento em vez de um número parcial. */}
                {isFiltering && (
                    <Box
                        role="status"
                        aria-live="polite"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        px={{ xs: 0, sm: 1 }}
                        data-testid="results-counter"
                    >
                        {isLoading || isLoadingAll ? (
                            <>
                                <CircularProgress size={14} />
                                <Typography variant="body2" color="text.secondary">Buscando resultados...</Typography>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Resultados encontrados: <Box component="strong" color="text.primary">{items.length}</Box>
                            </Typography>
                        )}
                    </Box>
                )}

                {items.length === 0 && !isLoading && !isLoadingAll ? (
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
                    <Box ref={setScrollEl} sx={{
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
                            background: color.inkFaint,
                            borderRadius: '3px'
                        }
                    }}>
                        {itemMinWidth ? (
                            // Grade densa: quantas colunas couberem, cada uma com no mínimo `itemMinWidth`
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: getGridColumns(itemMinWidth, itemMaxColumns),
                                    gap: `${GRID_GAP_PX}px`,
                                    alignItems: 'stretch'
                                }}
                            >
                                {visibleItems.map((item, index) => (
                                    <Box key={item.id || index} sx={{ display: 'flex', minWidth: 0 }}>
                                        <ResourceCell item={item} renderResource={renderResource} onAdd={handleAddItem} />
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Grid container spacing={2} justifyContent="center">
                                {visibleItems.map((item, index) => {
                                    const itemId = item.id || index;

                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={itemId} sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <ResourceCell item={item} renderResource={renderResource} onAdd={handleAddItem} />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}

                        {/* Com filtro ativo tudo é carregado de uma vez e o andamento aparece no contador. Sem
                            filtro, o elemento de referência abaixo dispara o scroll infinito. */}
                        {!isFiltering && isLoading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" gap={1} p={2}>
                                <CircularProgress size={18} />
                                <Typography variant="body2" color="text.secondary">Carregando...</Typography>
                            </Box>
                        ) : (hasHiddenItems || (!isFiltering && hasNextPage)) && (
                            <Box ref={loadMoreRef} display="flex" justifyContent="center" p={2} minHeight={56}>
                                {!isFiltering && !hasHiddenItems && (isFetchingNextPage ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Carregando mais...
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        );
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
                        borderRadius: 2,
                        boxShadow: theme.shadows[24],
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

                    {/* O carregamento aparece só na área da lista: trocar o conteúdo inteiro desmontava a
                        barra de filtros (fechando o menu aberto e tirando o foco da busca) a cada consulta nova. */}
                    {isError ? (
                        <Box p={2} bgcolor={alpha(theme.palette.error.main, 0.1)} color="error.main" borderRadius={1}>
                            <Typography>Erro ao carregar os itens: {error?.message}</Typography>
                        </Box>
                    ) : (
                        renderContent()
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
