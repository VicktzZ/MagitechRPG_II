'use client';

import { useEffect, useState } from 'react';
import { App, Credentials, type User } from 'realm-web';
import type { Collections, UseRealtimeDatabaseType, UseRealtimeDatabaseOperationTypes, UseRealtimeDatabaseOnChange } from '@types';
import { type QueryKey, useQuery, type UseQueryOptions, useQueryClient } from '@tanstack/react-query'

export function useRealtimeDatabase<T>(
    options: {
        collectionName: Collections,
        pipeline?: any[] | Record<string, any>,
        onChange?: (params: UseRealtimeDatabaseOnChange<T>) => void
    },
    useQueryOptions?: UseQueryOptions<T, Error, T, QueryKey>
): UseRealtimeDatabaseType<T> {
    const app = new App({ id: process.env.NEXT_PUBLIC_REALM_APP_ID })
    const queryClient = useQueryClient()

    const [ credentials, setCredentials ] = useState<User | null>(null)
    const [ event, setEvent ] = useState<Realm.Services.MongoDB.UpdateEvent<any>>()
    const [ data, setData ] = useState<T>()

    const query = useQuery<T>({
        ...useQueryOptions,
        staleTime: 0, // Sempre considera os dados como stale
        gcTime: 0 // Remove do cache imediatamente
    } as any)

    useEffect(() => {
        const login = async () => {
            const cred = await app.logIn(Credentials.anonymous())
            setCredentials(cred)

            const mongodb = app.currentUser?.mongoClient('mongodb-atlas');
            const collection = mongodb?.db('magitech').collection(options.collectionName);

            console.log('[DB] Watching', options.collectionName, 'collection', `[${(useQueryOptions?.queryKey ?? []).join(', ')}]`)
            
            for await (const change of (collection?.watch(options.pipeline) as any) ?? {}) {
                console.log('[DB] Change detected:', change.operationType, change.documentKey?._id);
                setEvent(change);
                
                // Invalida e refetch imediatamente
                if (useQueryOptions?.queryKey) {
                    await queryClient.invalidateQueries({ queryKey: useQueryOptions.queryKey })
                }
                
                options.onChange?.({
                    changedDocument: change?.fullDocument as T,
                    updateDescription: change?.updateDescription as {
                        updatedFields: Partial<T>;
                        removedFields: string[];
                    },
                    operationType: change?.operationType as UseRealtimeDatabaseOperationTypes,
                    documentId: change?.documentKey?._id as string
                })
                
                // Força refetch dos dados
                await query.refetch()
            }
        }
        
        login()
    }, []);

    useEffect(() => {
        if (query.data) {
            console.log('[DB] Data updated:', query.data);
            setData(query.data)
        }
    }, [ query.data ])

    return {
        data,
        changedDocument: (event as any)?.fullDocument as T,
        updateDescription: (event as any)?.updateDescription as {
            updatedFields: Partial<T>;
            removedFields: string[];
        },
        operationType: event?.operationType as UseRealtimeDatabaseOperationTypes,
        eventId: event?._id,
        documentId: (event as any)?.documentKey?._id,
        credentials,
        query
    }
};
