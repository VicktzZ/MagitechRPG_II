import { useEffect, useState } from 'react';
import type { RPGSystem } from '@models/entities';

export function useCharsheetSystem(systemId?: string) {
    const [ system, setSystem ] = useState<RPGSystem | null>(null);
    const [ loading, setLoading ] = useState(!!systemId);

    useEffect(() => {
        if (systemId) {
            setLoading(true);
            fetch(`/api/rpg-system/${systemId}`)
                .then(res => res.json())
                .then(data => setSystem(data))
                .catch(err => {
                    console.error('Erro ao carregar sistema:', err);
                    setSystem(null);
                })
                .finally(() => setLoading(false));
        } else {
            setSystem(null);
            setLoading(false);
        }
    }, [ systemId ]);

    const isDefaultSystem = !system;

    return {
        system,
        loading,
        isDefaultSystem
    };
}
