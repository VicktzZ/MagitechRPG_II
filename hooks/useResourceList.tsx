/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useCallback, useMemo, useState, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Close } from '@mui/icons-material';
import { toastDefault } from '@constants';
import { useDebounce } from '@uidotdev/usehooks';
import type { UseResourceListOptions, UseResourceListReturn } from '@models/types/hooks';

export const useResourceList = <T extends Record<string, any>>(
    options: UseResourceListOptions<T>
): UseResourceListReturn<T> => {
    const {
        initialSearch = '',
        initialFilter = '',
        initialSort = { value: 'Nível', order: 'ASC' as const },
        pageSize = 20,
        queryKey,
        fetchFunction,
        addFunction,
        validateAdd,
        successMessage = (item) => `Item ${item['name'] || item['nome']} adicionado com sucesso!`,
        errorMessage = (error) => error.message || 'Ocorreu um erro ao adicionar o item.'
    } = options;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const [ search, setSearch ] = useState(initialSearch);
    // Aumentando o tempo de debounce para evitar chamadas excessivas
    // e permitir que o usuário termine de digitar antes de fazer a busca
    const debouncedSearch = useDebounce(search, 600);

    const [ filter, setFilter ] = useState(initialFilter);
    const [ sort, setSort ] = useState(initialSort);
    const [ buttonSelected, setButtonSelected ] = useState({
        add: true,
        create: false,
        remove: false
    });

    // Quando houver filtro aplicado, buscam-se todos os itens de uma vez
    const isAllMode = useMemo(() => Boolean(filter && filter !== 'Nenhum'), [ filter ]);

    const fetchItems = useCallback(
        async ({ pageParam = null }: { pageParam?: string | null }) => {
            const params = {
                queryParams: {
                    search: debouncedSearch,
                    filter,
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
        [ debouncedSearch, filter, sort, pageSize, fetchFunction ]
    );

    // Modo sem paginação: busca todos os itens de uma vez quando existir filtro
    const allQuery = useQuery({
        queryKey: [ queryKey, { search: debouncedSearch, filter, sort, mode: 'all' } ],
        queryFn: async () => {
            const params = {
                queryParams: {
                    search: debouncedSearch,
                    filter,
                    sort: sort.value,
                    order: sort.order,
                    limit: '100'
                }
            };
            const data = await fetchFunction(params);
            return data?.data?.sort((a, b) => (a['nível'] || 0) - (b['nível'] || 0)) || [];
        },
        enabled: isAllMode,
        staleTime: 60000,
        gcTime: 300000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    // Configuração da query infinita (usada apenas quando não há filtro)
    const {
        data: infData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: infLoading,
        isError: infIsError,
        error: infError
    } = useInfiniteQuery({
        queryKey: [ queryKey, { search: debouncedSearch, filter, sort } ],
        queryFn: fetchItems,
        staleTime: 60000, // Aumentado para 1 minuto para evitar consultas desnecessárias
        gcTime: 300000, // 5 minutos de cache
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: null,
        refetchOnWindowFocus: false, // Evita refetch quando a janela ganha foco
        refetchOnMount: false, // Evita refetch quando o componente é montado
        enabled: !isAllMode
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

    // Achatando a lista de páginas para facilitar o uso e removendo duplicatas
    const items = useMemo(() => {
        // Modo ALL: retorna os dados diretamente
        if (isAllMode) {
            return Array.isArray(allQuery.data) ? allQuery.data : [];
        }

        if (!infData?.pages) return [];
        
        // Extrai todos os itens e remove duplicatas por ID
        const allItems = infData.pages.flatMap((page) => page.data || []);
        const uniqueMap = new Map();
        
        // Processa os itens em ordem reversa para garantir que os mais recentes tenham prioridade
        // (itens da primeira página substituem itens duplicados de páginas posteriores)
        for (let i = allItems.length - 1; i >= 0; i--) {
            const item = allItems[i];
            const id = item.id || item.id;
            if (id) {
                uniqueMap.set(id, item);
            }
        }
        
        // Converte o Map em array e ordena conforme a ordenação atual
        const uniqueItems = Array.from(uniqueMap.values());
        
        // Aplica ordenação consistente com a API
        if (sort.value && sort.value !== 'Nenhum') {
            const sortField = sort.value === 'Alfabética' ? 'nome' : 
                sort.value === 'Nível' ? 'nível' : 
                    sort.value === 'Custo' ? 'custo' : 
                        sort.value === 'Elemento' ? 'elemento' : 'nome';
            
            uniqueItems.sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];
                
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sort.order === 'ASC' ? valA - valB : valB - valA;
                }
                
                const strA = String(valA || '');
                const strB = String(valB || '');
                
                return sort.order === 'ASC' ? 
                    strA.localeCompare(strB, 'pt-BR') : 
                    strB.localeCompare(strA, 'pt-BR');
            });
        }
        
        return uniqueItems;
    }, [ isAllMode, allQuery.data, infData, sort.value, sort.order ]);

    // Referência para controlar o tempo da última chamada
    const lastFetchRef = useRef(0);
    
    const loadMore = useCallback(() => {
        if (isAllMode) return; // Desabilita carregamento infinito quando buscando tudo
        // Verifica se passou tempo suficiente desde a última chamada (500ms)
        const now = Date.now();
        if (now - lastFetchRef.current < 500) {
            return;
        }
        
        // Atualiza o timestamp da última chamada
        lastFetchRef.current = now;
        
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [ isAllMode, fetchNextPage, hasNextPage, isFetchingNextPage ]);

    return {
        // Estados
        search,
        filter,
        sort,
        buttonSelected,

        // Dados
        items,
        isLoading: isAllMode ? allQuery.isLoading : infLoading,
        isError: isAllMode ? allQuery.isError : infIsError,
        error: (isAllMode ? allQuery.error : infError) as any,
        hasNextPage: isAllMode ? false : hasNextPage,
        isFetchingNextPage: isAllMode ? false : isFetchingNextPage,

        // Ações
        setSearch,
        setFilter,
        setSort,
        setButtonSelected,
        addItem,
        loadMore
    };
};
