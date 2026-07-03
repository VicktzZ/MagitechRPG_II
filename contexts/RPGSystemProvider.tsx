'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { rpgSystemContext, type RPGSystemContextValue } from './rpgSystemContext';
import type { RPGSystem } from '@models/entities';

interface RPGSystemProviderProps {
    children: ReactElement;
    systemId?: string;
}

export function RPGSystemProvider({ children, systemId }: RPGSystemProviderProps) {
    const [ system, setSystem ] = useState<RPGSystem | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const isDefaultSystem = !systemId;

    useEffect(() => {
        async function fetchSystem() {
            if (!systemId) {
                // Usa o sistema padrão Magitech
                setSystem(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/rpg-system/${systemId}`);
                
                if (!response.ok) {
                    throw new Error('Sistema não encontrado');
                }

                const data = await response.json();
                setSystem(data);
            } catch (err: any) {
                console.error('Erro ao carregar sistema de RPG:', err);
                setError(err.message);
                setSystem(null);
            } finally {
                setLoading(false);
            }
        }

        fetchSystem();
    }, [ systemId ]);

    const value: RPGSystemContextValue = {
        system,
        loading,
        error,
        isDefaultSystem
    };

    return (
        <rpgSystemContext.Provider value={value}>
            {children}
        </rpgSystemContext.Provider>
    );
}
