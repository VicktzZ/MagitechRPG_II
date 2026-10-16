/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useCallback, useMemo, useState, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Close } from '@mui/icons-material';
import { toastDefault } from '@constants';
import { useDebounce } from '@uidotdev/usehooks';
import type { UseResourceListOptions, UseResourceListReturn } from '@models/types/hooks';

const DEFAULT_SORT_FIELD_MAP: Record<string, string> = {
    'Alfabética': 'name',
    'Nome': 'name',
    'Nível': 'level',
    'Custo': 'mpCost',
    'Elemento': 'element'
};

export const useResourceList = <T extends Record<string, any>>(
    options: UseResourceListOptions<T>
): UseResourceListReturn<T> => {
    const {
        initialSearch = '',
        initialFilters = [],
        initialSecondaryFilters = [],
        initialSort = { value: 'Nível', order: 'ASC' as const },
        pageSize = 20,
        queryKey,
        fetchFunction,
        addFunction,
        validateAdd,
        successMessage = (item) => `Item ${item['name'] || item['nome']} adicionado com sucesso!`,
        errorMessage = (error) => error.message || 'Ocorreu um erro ao adicionar o item.',
        sortFieldMap,
        getSecondaryFilterValue
    } = options;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const [ search, setSearch ] = useState(initialSearch);
    // Debounce para evitar chamadas excessivas enquanto o usuário digita
    const debouncedSearch = useDebounce(search, 600);

    const [ filters, setFilters ] = useState<string[]>(initialFilters);
    const [ secondaryFilters, setSecondaryFilters ] = useState<string[]>(initialSecondaryFilters);
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

    const toggleSecondaryFilter = useCallback((value: string) => {
        setSecondaryFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [ ...prev, value ]);
    }, []);

    const clearSecondaryFilters = useCallback(() => setSecondaryFilters([]), []);

    // Sempre pagina via cursor, com ou sem filtro aplicado — o filtro de
    // elemento(s) é resolvido no servidor (whereIn/whereEqualTo).
    const fetchItems = useCallback(
        async ({ pageParam = null }: { pageParam?: string | null }) => {
            const params = {
                queryParams: {
                    search: debouncedSearch,
                    elements: filters.join(','),
                    sort: sort.value,
                    order: sort.order,
                    limit: pageSize.toString(),
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
        [ debouncedSearch, filters, sort, pageSize, fetchFunction ]
    );

    const {
        data: infData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfiniteQuery({
        queryKey: [ queryKey, { search: debouncedSearch, filters, sort } ],
        queryFn: fetchItems,
        staleTime: 60000,
        gcTime: 300000,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: null,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

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

    // Achatando a lista de páginas, removendo duplicatas, ordenando e
    // aplicando o segundo filtro (resolvido no cliente, ex: categoria da magia)
    const items = useMemo(() => {
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

        if (secondaryFilters.length > 0 && getSecondaryFilterValue) {
            uniqueItems = uniqueItems.filter(item => {
                const value = getSecondaryFilterValue(item);
                return value !== undefined && secondaryFilters.includes(value);
            });
        }

        return uniqueItems;
    }, [ infData, sort.value, sort.order, sortFieldMap, secondaryFilters, getSecondaryFilterValue ]);

    // Referência para controlar o tempo da última chamada
    const lastFetchRef = useRef(0);

    const loadMore = useCallback(() => {
        // Verifica se passou tempo suficiente desde a última chamada (500ms)
        const now = Date.now();
        if (now - lastFetchRef.current < 500) {
            return;
        }

        lastFetchRef.current = now;

        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [ fetchNextPage, hasNextPage, isFetchingNextPage ]);

    return {
        // Estados
        search,
        filters,
        secondaryFilters,
        sort,
        buttonSelected,

        // Dados
        items,
        isLoading,
        isError,
        error: error as any,
        hasNextPage: hasNextPage ?? false,
        isFetchingNextPage,

        // Ações
        setSearch,
        toggleFilter,
        clearFilters,
        toggleSecondaryFilter,
        clearSecondaryFilters,
        setSort,
        setButtonSelected,
        addItem,
        loadMore
    };
};
