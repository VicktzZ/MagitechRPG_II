import { useCallback, useMemo, useState, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Close } from '@mui/icons-material';
import { toastDefault } from '@constants';
import { useDebounce } from '@uidotdev/usehooks';
import type { UseResourceListOptions, UseResourceListReturn } from '@types';

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

    const fetchItems = useCallback(
        async ({ pageParam = 1 }) => {
            const params = {
                queryParams: {
                    search: debouncedSearch,
                    filter,
                    sort: sort.value,
                    order: sort.order,
                    page: pageParam.toString(),
                    limit: pageSize.toString()
                }
            };

            const data = await fetchFunction(params);

            return {
                data,
                nextPage: data?.length === pageSize ? pageParam + 1 : undefined
            };
        },
        [ debouncedSearch, filter, sort, pageSize, fetchFunction ]
    );

    // Configuração da query infinita
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfiniteQuery({
        queryKey: [ queryKey, { search: debouncedSearch, filter, sort } ],
        queryFn: fetchItems,
        staleTime: 60000, // Aumentado para 1 minuto para evitar consultas desnecessárias
        gcTime: 300000, // 5 minutos de cache
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        refetchOnWindowFocus: false, // Evita refetch quando a janela ganha foco
        refetchOnMount: false // Evita refetch quando o componente é montado
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
        if (!data?.pages) return [];
        
        // Extrai todos os itens e remove duplicatas por ID
        const allItems = data.pages.flatMap((page) => page.data || []);
        const uniqueMap = new Map();
        
        // Processa os itens em ordem reversa para garantir que os mais recentes tenham prioridade
        // (itens da primeira página substituem itens duplicados de páginas posteriores)
        for (let i = allItems.length - 1; i >= 0; i--) {
            const item = allItems[i];
            const id = item._id || item.id;
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
                    sort.value === 'Custo' ? 'custo' : 'nome';
            
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
    }, [ data, sort.value, sort.order ]);

    // Referência para controlar o tempo da última chamada
    const lastFetchRef = useRef(0);
    
    const loadMore = useCallback(() => {
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
    }, [ fetchNextPage, hasNextPage, isFetchingNextPage ]);

    return {
        // Estados
        search,
        filter,
        sort,
        buttonSelected,

        // Dados
        items,
        isLoading,
        isError,
        error,
        hasNextPage,
        isFetchingNextPage,

        // Ações
        setSearch,
        setFilter,
        setSort,
        setButtonSelected,
        addItem,
        loadMore
    };
};
