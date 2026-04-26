/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import type { Campaign, Charsheet, Notification, Power, Spell, User } from '@models/entities';
import { campaignEntity, charsheetEntity, notificationEntity, powerEntity, spellEntity, userEntity, type FirestoreEntity } from '@utils/firestoreEntities';
import type { Unsubscribe } from '@firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

interface EntityNameToType {
    charsheet: Charsheet;
    campaign: Campaign;
    user: User;
    spell: Spell;
    power: Power;
    notification: Notification;
}

type EntityName = keyof EntityNameToType;

const firestoreEntities = {
    charsheet: charsheetEntity,
    campaign: campaignEntity,
    user: userEntity,
    spell: spellEntity,
    power: powerEntity,
    notification: notificationEntity
};

const FIRESTORE_IN_CHUNK_SIZE = 10;

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

interface UseFirestoreByIdsOptions {
    enabled?: boolean;
}

interface UseFirestoreByIdsResult<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
}

/**
 * Hook que busca documentos por uma lista de IDs em tempo real, contornando o
 * limite de 10 itens do operador `in` do Firestore via múltiplas subscriptions
 * chunked. Suporta qualquer quantidade de IDs e mantém uma única lista agregada.
 */
export function useFirestoreByIds<T extends EntityName>(
    entityName: T,
    ids: string[],
    options: UseFirestoreByIdsOptions = {}
): UseFirestoreByIdsResult<EntityNameToType[T]> {
    type EntityType = EntityNameToType[T];

    const { enabled = true } = options;

    const entity = firestoreEntities[entityName] as unknown as FirestoreEntity<EntityType>;

    const stableIds = useMemo(() => {
        const unique = Array.from(new Set(ids.filter(id => typeof id === 'string' && id.trim() !== '')));
        unique.sort();
        return unique;
    }, [ JSON.stringify(ids) ]);

    const [ data, setData ] = useState<EntityType[]>([]);
    const [ loading, setLoading ] = useState<boolean>(enabled && stableIds.length > 0);
    const [ error, setError ] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled || stableIds.length === 0) {
            setData([]);
            setLoading(false);
            setError(null);
            return;
        }

        const chunks = chunkArray(stableIds, FIRESTORE_IN_CHUNK_SIZE);
        const chunkResults: EntityType[][] = chunks.map(() => []);
        const chunkLoaded: boolean[] = chunks.map(() => false);

        setLoading(true);
        setError(null);

        const flushAggregated = () => {
            const merged = new Map<string, EntityType>();
            chunkResults.forEach(arr => {
                arr.forEach(item => {
                    const id = (item as unknown as { id?: string }).id;
                    if (id) merged.set(id, item);
                });
            });
            setData(Array.from(merged.values()));
            if (chunkLoaded.every(Boolean)) {
                setLoading(false);
            }
        };

        const unsubscribers: Unsubscribe[] = chunks.map((chunk, index) =>
            entity.subscribe(
                {
                    filters: [ { field: 'id', operator: 'in', value: chunk } ],
                    enabled: true,
                    onError: (err) => {
                        setError(err);
                    }
                },
                (chunkData) => {
                    chunkResults[index] = chunkData;
                    chunkLoaded[index] = true;
                    flushAggregated();
                }
            )
        );

        return () => {
            unsubscribers.forEach(unsub => unsub?.());
        };
    }, [ entity, stableIds, enabled ]);

    return { data, loading, error };
}
