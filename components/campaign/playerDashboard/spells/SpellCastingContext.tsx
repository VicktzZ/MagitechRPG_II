'use client';

import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import { useSpellCastingState, type SpellCasting } from './useSpellCasting';

const SpellCastingContext = createContext<SpellCasting | null>(null);

/** Uma instância só do estado de conjuração para o painel do jogador (Magias e Ações dividem a conjuração em andamento e o "Efetuar" pendente) */
export function SpellCastingProvider({ children }: { children: ReactNode }): ReactElement {
    const state = useSpellCastingState();
    return <SpellCastingContext.Provider value={state}>{children}</SpellCastingContext.Provider>;
}

/** O estado compartilhado de conjuração; fora do `SpellCastingProvider` cada chamada tem o seu (testes e telas soltas) */
export function useSpellCasting(): SpellCasting {
    const shared = useContext(SpellCastingContext);
    const local = useSpellCastingState();
    return shared ?? local;
}
