/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useCharsheet, useSpellsRealtime, usePowersRealtime } from '@services/firestore/hooks';
import { useMemo } from 'react';
import type { Charsheet } from '@models/entities';

interface UseCompleteCharsheetOptions {
    charsheetId: string;
    enabled?: boolean;
}

interface UseCompleteCharsheetResult {
    data: Charsheet | null;
    loading: boolean;
    error: Error | null;
}

export function useCompleteCharsheet({
    charsheetId,
    enabled = true
}: UseCompleteCharsheetOptions): UseCompleteCharsheetResult {
    // 🔥 Buscar charsheet principal em tempo real
    const { data: charsheet, loading: charsheetLoading, error: charsheetError } = useCharsheet(charsheetId);

    // Extrair IDs das magias relacionadas
    const magicIds = useMemo(() =>
        enabled && charsheet?.spells?.length > 0
            ? charsheet.spells.map(m => m.id || m).filter(Boolean)
            : [],
    [ charsheet?.spells, enabled ]
    );

    // 🔥 Buscar magias relacionadas em paralelo
    const {
        data: relatedSpells,
        loading: spellsLoading,
        error: spellsError
    } = useSpellsRealtime({
        filters: magicIds.length > 0 ? [
            { field: 'id', operator: 'in', value: magicIds }
        ] : undefined,
        enabled: enabled && magicIds.length > 0
    });

    // Extrair IDs dos poderes relacionados
    const powerIds = useMemo(() =>
        enabled && charsheet?.skills?.powers?.length > 0
            ? charsheet.skills.powers.map(p => p.id || p).filter(Boolean)
            : [],
    [ charsheet?.skills?.powers, enabled ]
    );

    // 🔥 Buscar poderes relacionados em paralelo
    const {
        data: relatedPowers,
        loading: powersLoading,
        error: powersError
    } = usePowersRealtime({
        filters: powerIds.length > 0 ? [
            { field: 'id', operator: 'in', value: powerIds }
        ] : undefined,
        enabled: enabled && powerIds.length > 0
    });

    // 🔥 Combinar dados em tempo real
    const completeCharsheet = useMemo((): Charsheet | null => {
        if (!charsheet || !enabled) return null;

        const charsheetWithRelations = { ...charsheet };

        // Resolver magias: substituir IDs pelos dados completos
        if (relatedSpells && relatedSpells.length > 0) {
            const magicMap = new Map(relatedSpells.map(m => [ m.id, m ]));
            charsheetWithRelations.spells = charsheet.spells.map(magicId =>
                magicMap.get(magicId.id || magicId) || magicId
            );
        }

        // Resolver poderes: substituir IDs pelos dados completos
        if (relatedPowers && relatedPowers.length > 0) {
            const powerMap = new Map(relatedPowers.map(p => [ p.id, p ]));
            if (charsheetWithRelations.skills?.powers) {
                charsheetWithRelations.skills.powers = charsheet.skills.powers.map(powerId => {
                    const fullPower = powerMap.get(powerId.id || powerId);
                    return fullPower ? {
                        id: fullPower.id,
                        name: fullPower.name,
                        description: fullPower.description,
                        element: fullPower.element,
                        mastery: fullPower.mastery,
                        type: 'Poder Mágico' as const
                    } : powerId;
                });
            }
        }

        return charsheetWithRelations;
    }, [ charsheet, relatedSpells, relatedPowers, enabled ]);

    // Estado de loading geral
    const loading = enabled ? (charsheetLoading || spellsLoading || powersLoading) : false;

    // Primeiro erro encontrado (se houver)
    const error = charsheetError || spellsError || powersError;

    return {
        data: completeCharsheet,
        loading,
        error
    };
}