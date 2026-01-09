import { createContext, useContext } from 'react';
import type { RPGSystem } from '@models/entities';

export interface RPGSystemContextValue {
    system: RPGSystem | null;
    loading: boolean;
    error: string | null;
    isDefaultSystem: boolean;
}

export const rpgSystemContext = createContext<RPGSystemContextValue>({
    system: null,
    loading: false,
    error: null,
    isDefaultSystem: true
});

export function useRPGSystemContext() {
    const context = useContext(rpgSystemContext);
    if (!context) {
        throw new Error('useRPGSystemContext must be used within an RPGSystemProvider');
    }
    return context;
}
