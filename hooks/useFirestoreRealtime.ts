/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import type { Campaign, Charsheet, Power, Spell, User, Notification } from '@models/entities';
import type { FirestoreQueryOptions, RealtimeOptions } from '@models/types/firestoreRealtime';
import { campaignEntity, charsheetEntity, notificationEntity, powerEntity, spellEntity, userEntity, type FirestoreEntity } from '@utils/firestoreEntities';
import { useEffect, useMemo, useState } from 'react';

interface EntityNameToType {
    charsheet: Charsheet;
    campaign: Campaign;
    user: User;
    spell: Spell;
    power: Power;
    notification: Notification;
};

// Tipo para as chaves do mapeamento
type EntityName = keyof EntityNameToType;

const firestoreEntities = {
    charsheet: charsheetEntity,
    campaign: campaignEntity,
    user: userEntity,
    spell: spellEntity,
    power: powerEntity,
    notification: notificationEntity
}

export function useFirestoreRealtime<T extends EntityName>(
    entityName: T,
    options: FirestoreQueryOptions & RealtimeOptions<EntityNameToType[T]> = {}
) {
    type EntityType = EntityNameToType[T];
    
    const [ data, setData ] = useState<EntityType[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    
    // Remova o type assertion desnecessário
    const entity = firestoreEntities[entityName] as unknown as FirestoreEntity<EntityType>;

    const stableOptions = useMemo(() => options, [
        JSON.stringify(options.filters?.sort((a, b) => 
            `${a.field}-${a.operator}-${a.value}`.localeCompare(`${b.field}-${b.operator}-${b.value}`)
        )),
        JSON.stringify(options.orderBy?.sort((a, b) => 
            `${a.field}-${a.direction}`.localeCompare(`${b.field}-${b.direction}`)
        )),
        options.limit,
        options.includeMetadataChanges,
        options.enabled
    ]);

    useEffect(() => {
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
            unsubscribe?.();
        };
    },  [ entity, stableOptions, options?.enabled ]);

    return { data, loading, error };
}