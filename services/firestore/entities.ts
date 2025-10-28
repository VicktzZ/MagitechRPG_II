/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {
    type DocumentData
} from 'firebase/firestore';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type FirestoreQueryOptions, type RealtimeOptions } from './types';
import { FirestoreEntity } from './custom-orm';
import { campaignCollection, charsheetCollection, notificationsCollection, powersCollection, spellsCollection, userCollection } from '@models/docs';

// === ENTIDADES ESPECÍFICAS ===
export const CampaignEntity = new FirestoreEntity(campaignCollection);
export const CharsheetEntity = new FirestoreEntity(charsheetCollection);
export const UserEntity = new FirestoreEntity(userCollection);
export const SpellEntity = new FirestoreEntity(spellsCollection);
export const PowerEntity = new FirestoreEntity(powersCollection);
export const NotificationEntity = new FirestoreEntity(notificationsCollection);

// === HOOKS UTILITÁRIOS ===

// Hook para usar entidade com React Query
export function useFirestoreEntity<T extends DocumentData>(
    entity: FirestoreEntity<T>,
    options: FirestoreQueryOptions = {}
) {
    const queryClient = useQueryClient();
    const queryKey = useMemo(() => [ 'firestore', entity.collection.id, options ], [ entity.collection.id, options ]);

    const query = useQuery({
        queryKey,
        queryFn: async () => await entity.find(options),
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000 // 10 minutos
    });

    const refetch = useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [ queryClient, queryKey ]);

    return {
        ...query,
        refetch
    };
}

// Hook para tempo real com entidade
export function useFirestoreRealtime<T extends DocumentData>(
    entity: FirestoreEntity<T>,
    options: FirestoreQueryOptions & RealtimeOptions<T> = {}
) {
    const [ data, setData ] = useState<T[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    // Estabilizar as opções para evitar re-renders infinitos
    const stableOptions = useMemo(() => options, [
        // Comparar filtros de forma estável
        JSON.stringify(options.filters?.sort((a, b) => `${a.field}-${a.operator}-${a.value}`.localeCompare(`${b.field}-${b.operator}-${b.value}`))),
        // Comparar ordenação de forma estável
        JSON.stringify(options.orderBy?.sort((a, b) => `${a.field}-${a.direction}`.localeCompare(`${b.field}-${b.direction}`))),
        // Propriedades simples
        options.limit,
        options.includeMetadataChanges,
        options.enabled
        // Não incluir callbacks pois podem mudar a cada render
    ]);

    useEffect(() => {
        // Só executar se enabled for true (ou undefined)
        if (options.enabled === false) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = entity.subscribe(
            stableOptions,
            (newData) => {
                setData(newData);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [ entity, stableOptions, options.enabled ]);

    return {
        data,
        loading,
        error,
        refetch: () => {
            // Para refetch, podemos forçar uma nova busca
            entity.find(options).then(setData).catch(setError);
        }
    };
}

// Hook para documento único em tempo real
export function useFirestoreDocument<T extends DocumentData>(
    entity: FirestoreEntity<T>,
    id: string,
    options: RealtimeOptions<T> = {}
) {
    const [ data, setData ] = useState<T | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    // Estabilizar as opções para evitar re-renders infinitos
    const stableOptions = useMemo(() => options, [
        options.includeMetadataChanges
        // Não incluir callbacks pois podem mudar a cada render
    ]);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(null);

        const unsubscribe = entity.subscribeToDocument(id, {
            ...stableOptions,
            onNext: (newData) => {
                setData(newData);
                setLoading(false);
            },
            onError: (err) => {
                setError(err);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [ entity, id, stableOptions ]);

    return {
        data,
        loading,
        error,
        update: async (newData: Partial<T>) => await entity.update(id, newData),
        delete: async () => await entity.delete(id)
    };
}

// Hook para operações CRUD
export function useFirestoreCRUD<T extends DocumentData>(
    entity: FirestoreEntity<T>
) {
    const queryClient = useQueryClient();

    const create = useCallback(async (data: Partial<T>) => {
        const id = await entity.create(data);
        queryClient.invalidateQueries({ queryKey: [ 'firestore', entity.collection.id ] });
        return id;
    }, [ entity, queryClient ]);

    const update = useCallback(async (id: string, data: Partial<T>) => {
        await entity.update(id, data);
        queryClient.invalidateQueries({ queryKey: [ 'firestore', entity.collection.id ] });
    }, [ entity, queryClient ]);

    const remove = useCallback(async (id: string) => {
        await entity.delete(id);
        queryClient.invalidateQueries({ queryKey: [ 'firestore', entity.collection.id ] });
    }, [ entity, queryClient ]);

    const upsert = useCallback(async (id: string | null, data: Partial<T>) => {
        const resultId = await entity.upsert(id, data);
        queryClient.invalidateQueries({ queryKey: [ 'firestore', entity.collection.id ] });
        return resultId;
    }, [ entity, queryClient ]);

    return {
        create,
        update,
        remove,
        upsert
    };
}

// Hook para paginação
export function useFirestorePagination<T extends DocumentData>(
    entity: FirestoreEntity<T>,
    options: FirestoreQueryOptions & {
        pageSize?: number;
        initialPage?: number;
    } = {}
) {
    const [ currentPage, setCurrentPage ] = useState(options.initialPage || 1);
    const [ allData, setAllData ] = useState<T[]>([]);
    const [ loading, setLoading ] = useState(false);

    const pageSize = options.pageSize || 20;

    // Estabilizar as opções para evitar re-renders infinitos
    const stableOptions = useMemo(() => options, [
        JSON.stringify(options.filters?.sort((a, b) => `${a.field}-${a.operator}-${a.value}`.localeCompare(`${b.field}-${b.operator}-${b.value}`))),
        JSON.stringify(options.orderBy?.sort((a, b) => `${a.field}-${a.direction}`.localeCompare(`${b.field}-${b.direction}`))),
        options.limit,
        options.pageSize
        // Não incluir initialPage pois muda com setCurrentPage
    ]);

    const loadPage = useCallback(async () => {
        setLoading(true);
        try {
            
            const results = await entity.find({
                ...stableOptions,
                limit: pageSize
                // Nota: Firestore não suporta offset nativo, seria necessário usar cursor
            });
            setAllData(results);
        } catch (error) {
            console.error('Erro ao carregar página:', error);
        } finally {
            setLoading(false);
        }
    }, [ entity, stableOptions, pageSize ]);

    useEffect(() => {
        loadPage(currentPage);
    }, [ currentPage, loadPage ]);

    const totalPages = Math.ceil(allData.length / pageSize);

    return {
        data: allData,
        loading,
        currentPage,
        totalPages,
        goToPage: setCurrentPage,
        nextPage: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
        prevPage: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
}
