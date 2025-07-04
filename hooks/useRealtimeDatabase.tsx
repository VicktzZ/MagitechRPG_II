'use client';

import { useEffect, useState } from 'react';
import { App, Credentials, type User } from 'realm-web';
import type { Collections, UseRealtimeDatabaseType, UseRealtimeDatabaseOperationTypes, UseRealtimeDatabaseOnChange } from '@types';
import { type QueryKey, useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function useRealtimeDatabase<T>(
    options: {
        collectionName: Collections,
        pipeline?: any[] | Record<string, any>,
        onChange?: (params: UseRealtimeDatabaseOnChange<T>) => void
    },
    useQueryOptions?: UseQueryOptions<T, Error, T, QueryKey>
): UseRealtimeDatabaseType<T> {
    const app = new App({ id: process.env.NEXT_PUBLIC_REALM_APP_ID })

    const [ credentials, setCredentials ] = useState<User | null>(null)
    const [ event, setEvent ] = useState<Realm.Services.MongoDB.UpdateEvent<any>>()
    const [ data, setData ] = useState<T>()

    const query = useQuery<T>(useQueryOptions ?? {} as any)

    useEffect(() => {
        const login = async () => {
            const cred = await app.logIn(Credentials.anonymous())
            setCredentials(cred)

            const mongodb = app.currentUser?.mongoClient('mongodb-atlas');
            const collection = mongodb?.db('magitech').collection(options.collectionName);

            console.log('[DB] Watching', options.collectionName, 'collection', `[${(useQueryOptions?.queryKey ?? []).join(', ')}]`)
            
            for await (const change of (collection?.watch(options.pipeline) as any) ?? {}) {
                setEvent(change);
                options.onChange?.({
                    changedDocument: (event as any)?.fullDocument as T,
                    updateDescription: (event as any)?.updateDescription as {
                        updatedFields: Partial<T>;
                        removedFields: string[];
                    },
                    operationType: event?.operationType as UseRealtimeDatabaseOperationTypes,
                    documentId: (event as any)?.documentKey?._id as string
                })
                query.refetch()
            }
        }
        
        login()
    }, []);

    useEffect(() => {
        setData(query.data)
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
