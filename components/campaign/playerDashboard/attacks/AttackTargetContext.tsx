'use client';

import { createContext, useContext, useState, type ReactElement, type ReactNode } from 'react';

/**
 * O alvo do ataque assistido é **um só para o painel inteiro**: o campo mora na seção "Ações" e vale para o teste de acerto da arma (Inventário), a conjuração de
 * magia de ataque (Magias) e os quadrados da própria seção. O que o jogador escolhe fica aqui; o que é derivado do combate (quem pode ser alvo, oportunidades) continua
 * em `useAttackTargeting`.
 */
export interface AttackTargetState {
    /** `null` = o jogador ainda não escolheu: com uma oportunidade aberta, o alvo já vem como quem saiu do alcance */
    selectedTarget: string | null;
    setTargetId: (id: string | null) => void;
    /** A oportunidade que o jogador desmarcou */
    declinedOpportunity: string | null;
    setDeclinedOpportunity: (id: string | null) => void;
    /** Outros alvos do mesmo ataque (ataque em área) */
    pickedExtras: string[];
    setExtraTargetIds: (ids: string[]) => void;
}

const AttackTargetContext = createContext<AttackTargetState | null>(null);

function useLocalTargetState(): AttackTargetState {
    const [ selectedTarget, setTargetId ] = useState<string | null>(null);
    const [ declinedOpportunity, setDeclinedOpportunity ] = useState<string | null>(null);
    const [ pickedExtras, setExtraTargetIds ] = useState<string[]>([]);
    return { selectedTarget, setTargetId, declinedOpportunity, setDeclinedOpportunity, pickedExtras, setExtraTargetIds };
}

/** Guarda a escolha do alvo para todo o painel do jogador */
export function AttackTargetProvider({ children }: { children: ReactNode }): ReactElement {
    const state = useLocalTargetState();
    return <AttackTargetContext.Provider value={state}>{children}</AttackTargetContext.Provider>;
}

/** A escolha compartilhada do painel; fora dele (testes, telas soltas) cada chamada guarda a própria */
export function useAttackTargetState(): AttackTargetState {
    const shared = useContext(AttackTargetContext);
    const local = useLocalTargetState();
    return shared ?? local;
}
