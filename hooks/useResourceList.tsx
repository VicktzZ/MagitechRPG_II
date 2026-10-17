/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Close } from '@mui/icons-material';
import { toastDefault } from '@constants';
import { useDebounce } from '@uidotdev/usehooks';
import type { UseResourceListOptions, UseResourceListReturn } from '@models/types/hooks';
import { filterBySelections, type ClientFilter } from '@utils/filterSelection';

const DEFAULT_SORT_FIELD_MAP: Record<string, string> = {
    'Alfabética': 'name',
    'Nome': 'name',
    'Nível': 'level',
    'Custo': 'mpCost',
    'Elemento': 'element'
};

// Maior página que a API aceita (as rotas limitam `limit` a 100)
const MAX_PAGE_SIZE = 100;

// Identidade estável: um `[]` novo a cada renderização refaria a filtragem dos itens
const NO_CLIENT_FILTERS: Array<ClientFilter<any>> = [];

export const useResourceList = <T extends Record<string, any>>(
    options: UseResourceListOptions<T>
): UseResourceListReturn<T> => {
    const {
        initialSearch = '',
        initialFilters = [],
        initialClientSelections = {},
        initialSort = { value: 'Nível', order: 'ASC' as const },
        pageSize = 20,
        queryKey,
        fetchFunction,
        addFunction,
        validateAdd,
        successMessage = (item) => `Item ${item['name'] || item['nome']} adicionado com sucesso!`,
        errorMessage = (error) => error.message || 'Ocorreu um erro ao adicionar o item.',
        sortFieldMap,
        clientFilters = NO_CLIENT_FILTERS
    } = options;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const [ search, setSearch ] = useState(initialSearch);
    // Debounce para evitar chamadas excessivas enquanto o usuário digita
    const debouncedSearch = useDebounce(search, 600);

    const [ filters, setFilters ] = useState<string[]>(initialFilters);
    const [ clientSelections, setClientSelections ] = useState<Record<string, string[]>>(initialClientSelections);
    const [ sort, setSort ] = useState(initialSort);
    const [ buttonSelected, setButtonSelected ] = useState({
        add: true,
        create: false,
        remove: false
    });

    const toggleFilter = useCallback((value: string) => {
        setFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [ ...prev, value ]);
    }, []);

    const clearFilters = useCallback(() => setFilters([]), []);

    const toggleClientFilter = useCallback((key: string, value: string) => {
        setClientSelections(prev => {
            const current = prev[key] ?? [];
            return { ...prev, [key]: current.includes(value) ? current.filter(v => v !== value) : [ ...current, value ] };
        });
    }, []);

    const clearClientFilter = useCallback((key: string) => {
        setClientSelections(prev => ({ ...prev, [key]: [] }));
    }, []);

    const clearClientFilters = useCallback(() => setClientSelections({}), []);

    // Com qualquer filtro (busca, elemento, tipo, subtipo) o catálogo é carregado inteiro, em
    // páginas grandes encadeadas: os filtros de tipo/subtipo são resolvidos no cliente e, como
    // o catálogo é pequeno, não vale a pena paginar o resultado. Sem filtro, pagina (scroll infinito).
    const hasClientSelection = Object.values(clientSelections).some(selected => selected.length > 0);
    const isFiltering = debouncedSearch.trim() !== '' || filters.length > 0 || hasClientSelection;
    const requestPageSize = isFiltering ? MAX_PAGE_SIZE : pageSize;

    // Sempre pagina via cursor — o filtro de elemento(s) é resolvido no servidor (whereIn/whereEqualTo).
    const fetchItems = useCallback(
        async ({ pageParam = null }: { pageParam?: string | null }) => {
            const params = {
                queryParams: {
                    search: debouncedSearch,
                    elements: filters.join(','),
                    sort: sort.value,
                    order: sort.order,
                    limit: requestPageSize.toString(),
                    cursor: pageParam || undefined
                }
            };

            const data = await fetchFunction(params);

            return {
                data: data.data || [],
                nextPage: data.hasMore ? data.nextCursor : undefined
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ debouncedSearch, filters, sort, requestPageSize, fetchFunction ]
    );

    const {
        data: infData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetchNextPageError,
        isLoading,
        isError,
        error
    } = useInfiniteQuery({
        queryKey: [ queryKey, { search: debouncedSearch, filters, sort, isFiltering } ],
        queryFn: fetchItems,
        staleTime: 60000,
        gcTime: 300000,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: null,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    // Em modo filtrado, busca as páginas restantes assim que a anterior chega. Para se uma
    // página falhar, para não ficar repetindo a requisição.
    useEffect(() => {
        if (isFiltering && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
            fetchNextPage();
        }
    }, [ isFiltering, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage ]);

    const isLoadingAll = isFiltering && !isFetchNextPageError && (Boolean(hasNextPage) || isFetchingNextPage);

    // Mutação para adicionar um item
    const { mutate: addItem } = useMutation({
        mutationFn: async (item: T) => {
            if (validateAdd) {
                const validation = validateAdd(item, queryClient.getQueryData([ queryKey ]));
                if (!validation.isValid) {
                    throw new Error(validation.errorMessage ?? 'Não foi possível adicionar o item.');
                }
            }

            if (addFunction) {
                return addFunction(item);
            }

            return item;
        },
        onSuccess: (_, item) => {
            enqueueSnackbar(successMessage(item), {
                ...toastDefault(item['name'] || item['nome'] || 'success', 'success'),
                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => closeSnackbar(item['name'] || item['nome'])} />
            });

            // Atualiza o cache em vez de invalidar a query
            queryClient.setQueryData(
                [ queryKey ],
                (oldData: any) => {
                    if (!oldData) return oldData;
                    // Adiciona o novo item no início da primeira página
                    const newPages = [ ...oldData.pages ];
                    if (newPages[0]?.data) {
                        newPages[0] = {
                            ...newPages[0],
                            data: [ item, ...newPages[0].data ]
                        };
                    }
                    return { ...oldData, pages: newPages };
                }
            );
        },
        onError: (err) => {
            enqueueSnackbar(errorMessage(err), {
                ...toastDefault('error', 'error'),
                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => closeSnackbar('error')} />
            });
        }
    });

    // Achatando a lista de páginas, removendo duplicatas e ordenando. Esta é a lista
    // "carregada": as opções do segundo filtro e do subfiltro saem dela, para que marcar
    // uma opção não faça as demais sumirem do menu.
    const loadedItems = useMemo(() => {
        if (!infData?.pages) return [];

        const allItems = infData.pages.flatMap((page) => page.data || []);
        const uniqueMap = new Map();

        // Processa em ordem reversa para que itens de páginas mais recentes
        // (ex: adicionados via mutation) tenham prioridade
        for (let i = allItems.length - 1; i >= 0; i--) {
            const item = allItems[i];
            const id = item.id;
            if (id) {
                uniqueMap.set(id, item);
            }
        }

        let uniqueItems = Array.from(uniqueMap.values());

        if (sort.value && sort.value !== 'Nenhum') {
            const sortField = sortFieldMap?.[sort.value] ?? DEFAULT_SORT_FIELD_MAP[sort.value] ?? 'name';

            uniqueItems = [ ...uniqueItems ].sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sort.order === 'ASC' ? valA - valB : valB - valA;
                }

                const strA = String(valA ?? '');
                const strB = String(valB ?? '');

                return sort.order === 'ASC' ?
                    strA.localeCompare(strB, 'pt-BR') :
                    strB.localeCompare(strA, 'pt-BR');
            });
        }

        return uniqueItems;
    }, [ infData, sort.value, sort.order, sortFieldMap ]);

    // Filtros do cliente (ex: Tipo, Subtipo, Execução). Combinam por E; cada um é OU entre as
    // opções marcadas. Se só um deles estiver ativo, filtra sozinho.
    const items = useMemo(() => filterBySelections(loadedItems, clientFilters.map(filter => ({
        getValue: filter.getValue,
        selected: clientSelections[filter.key] ?? []
    }))), [ loadedItems, clientFilters, clientSelections ]);

    // Sem ressalvas de tempo: `isFetchingNextPage` já impede chamadas simultâneas
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [ fetchNextPage, hasNextPage, isFetchingNextPage ]);

    return {
        // Estados
        search,
        filters,
        clientSelections,
        sort,
        buttonSelected,

        // Dados
        items,
        loadedItems,
        isFiltering,
        isLoadingAll,
        isLoading,
        isError,
        error: error as any,
        hasNextPage: hasNextPage ?? false,
        isFetchingNextPage,

        // Ações
        setSearch,
        toggleFilter,
        clearFilters,
        toggleClientFilter,
        clearClientFilter,
        clearClientFilters,
        setSort,
        setButtonSelected,
        addItem,
        loadMore
    };
};
