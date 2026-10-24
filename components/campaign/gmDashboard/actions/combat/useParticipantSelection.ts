import { useCallback, useState } from 'react';

/** Quem está marcado para entrar no combate: jogadores (por `PlayerInfo.id`), criaturas e quantas cópias de cada */
export function useParticipantSelection() {
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
    const [ selectedCreatures, setSelectedCreatures ] = useState<string[]>([]);
    const [ creatureQuantities, setCreatureQuantities ] = useState<Record<string, number>>({});

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

    const clear = useCallback(() => {
        setSelectedPlayers([]);
        setSelectedCreatures([]);
        setCreatureQuantities({});
    }, []);

    return { selectedPlayers, selectedCreatures, creatureQuantities, togglePlayer, toggleCreature, setCreatureQuantity, clear };
}

export type ParticipantSelection = ReturnType<typeof useParticipantSelection>;
