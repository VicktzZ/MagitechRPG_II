import { useCallback, useState } from 'react';

/** Quem está marcado para entrar no combate: jogadores (por `PlayerInfo.id`), criaturas e quantas cópias de cada */
export function useParticipantSelection() {
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
    const [ selectedCreatures, setSelectedCreatures ] = useState<string[]>([]);
    const [ creatureQuantities, setCreatureQuantities ] = useState<Record<string, number>>({});
    // Invocados: o jogador (ID do usuário) que controla cada criatura marcada; sem entrada, a criatura é do mestre
    const [ creatureControllers, setCreatureControllers ] = useState<Record<string, string>>({});

    const togglePlayer = useCallback((playerId: string) => {
        setSelectedPlayers(prev => (prev.includes(playerId) ? prev.filter(id => id !== playerId) : [ ...prev, playerId ]));
    }, []);

    const toggleCreature = useCallback((creatureId: string) => {
        setSelectedCreatures(prev => {
            if (prev.includes(creatureId)) return prev.filter(id => id !== creatureId);
            setCreatureQuantities(quantities => ({ ...quantities, [creatureId]: quantities[creatureId] || 1 }));
            return [ ...prev, creatureId ];
        });
    }, []);

    // Mexer na quantidade já marca a criatura
    const setCreatureQuantity = useCallback((creatureId: string, value: number) => {
        const safeValue = Number.isNaN(value) ? 1 : Math.max(1, value);
        setCreatureQuantities(prev => ({ ...prev, [creatureId]: safeValue }));
        setSelectedCreatures(prev => (prev.includes(creatureId) ? prev : [ ...prev, creatureId ]));
    }, []);

    // Escolher quem controla já marca a criatura; vazio devolve ao mestre
    const setCreatureController = useCallback((creatureId: string, userId: string) => {
        setCreatureControllers(prev => {
            const others = Object.fromEntries(Object.entries(prev).filter(([ id ]) => id !== creatureId));
            return userId ? { ...others, [creatureId]: userId } : others;
        });
        if (userId) {
            setSelectedCreatures(prev => (prev.includes(creatureId) ? prev : [ ...prev, creatureId ]));
            setCreatureQuantities(prev => ({ ...prev, [creatureId]: prev[creatureId] || 1 }));
        }
    }, []);

    const clear = useCallback(() => {
        setSelectedPlayers([]);
        setSelectedCreatures([]);
        setCreatureQuantities({});
        setCreatureControllers({});
    }, []);

    return { selectedPlayers, selectedCreatures, creatureQuantities, creatureControllers, togglePlayer, toggleCreature, setCreatureQuantity, setCreatureController, clear };
}

export type ParticipantSelection = ReturnType<typeof useParticipantSelection>;
