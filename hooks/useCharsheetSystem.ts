import { useEffect, useState } from 'react';
import type { RPGSystem } from '@models/entities';

// Cache em módulo: useCharsheetSystem é chamado por MUITOS componentes ao
// mesmo tempo (um por item/arma/armadura da ficha, cards de jogador etc.).
// Sem cache, cada instância disparava seu próprio fetch do MESMO sistema a
// cada montagem/re-render — dezenas de requisições idênticas por página.
const systemCache = new Map<string, RPGSystem | null>();
const inFlight = new Map<string, Promise<RPGSystem | null>>();

async function fetchSystem(systemId: string): Promise<RPGSystem | null> {
    if (systemCache.has(systemId)) return systemCache.get(systemId) ?? null;

    const pending = inFlight.get(systemId);
    if (pending) return await pending;

    const promise = fetch(`/api/rpg-system/${systemId}`)
        .then(async res => (res.ok ? await res.json() : null))
        .then((data: RPGSystem | null) => {
            systemCache.set(systemId, data);
            return data;
        })
        .catch(err => {
            console.error('Erro ao carregar sistema:', err);
            return null;
        })
        .finally(() => {
            inFlight.delete(systemId);
        });

    inFlight.set(systemId, promise);
    return await promise;
}

/** Invalida o cache de um sistema (ex: após editá-lo no builder). */
export function invalidateCharsheetSystemCache(systemId?: string) {
    if (systemId) systemCache.delete(systemId);
    else systemCache.clear();
}

export function useCharsheetSystem(systemId?: string) {
    const cached = systemId ? systemCache.get(systemId) : undefined;
    const [ system, setSystem ] = useState<RPGSystem | null>(cached ?? null);
    const [ loading, setLoading ] = useState(!!systemId && cached === undefined);

    useEffect(() => {
        if (!systemId) {
            setSystem(null);
            setLoading(false);
            return;
        }

        if (systemCache.has(systemId)) {
            setSystem(systemCache.get(systemId) ?? null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        fetchSystem(systemId).then(data => {
            if (cancelled) return;
            setSystem(data);
            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [ systemId ]);

    const isDefaultSystem = !system;

    return {
        system,
        loading,
        isDefaultSystem
    };
}
