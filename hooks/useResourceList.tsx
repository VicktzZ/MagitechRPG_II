import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from '@mantine/hooks';
import { useSnackbar } from 'notistack';
import { Close } from '@mui/icons-material';
import { toastDefault } from '@constants';
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
    const [ filter, setFilter ] = useState(initialFilter);
    const [ sort, setSort ] = useState(initialSort);
    const [ buttonSelected, setButtonSelected ] = useState({
        add: true,
        create: false,
        remove: false
    });

    // Função para buscar itens com paginação infinita
    const fetchItems = useCallback(
        async ({ pageParam = 1 }) => {
            const params = {
                queryParams: {
                    search,
                    filter,
                    sort: sort.value,
                    order: sort.order,
                    page: pageParam,
                    limit: pageSize
                }
            };

            const data = await fetchFunction(params);

            return {
                data,
                nextPage: data?.length === pageSize ? pageParam + 1 : undefined
            };
        },
        [ search, filter, sort, pageSize, fetchFunction ]
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
        queryKey: [ queryKey, { search, filter, sort } ],
        queryFn: fetchItems,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1
    });

    // Debounce para a busca
    const debouncedSearch = useDebouncedCallback((value: string) => {
        setSearch(value);
    }, 500);

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
            
            // Invalida a query para forçar atualização
            queryClient.invalidateQueries({ queryKey: [ queryKey ] });
        },
        onError: (err) => {
            enqueueSnackbar(errorMessage(err), {
                ...toastDefault('error', 'error'),
                action: () => <Close sx={{ cursor: 'pointer' }} onClick={() => closeSnackbar('error')} />
            });
        }
    });

    // Achatando a lista de páginas para facilitar o uso
    const items = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) ?? [];
    }, [ data ]);

    // Função para carregar mais itens quando o usuário chegar ao final da lista
    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [ hasNextPage, isFetchingNextPage, fetchNextPage ]);

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
        setSearch: (value: string) => {
            setSearch(value);
            debouncedSearch(value);
        },
        setFilter,
        setSort,
        setButtonSelected,
        addItem,
        loadMore
    };
};
