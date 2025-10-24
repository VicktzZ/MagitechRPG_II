/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/**
 * Hook personalizado para buscar ficha completa em tempo real com relacionamentos
 * Substitui a necessidade de múltiplas consultas API para obter ficha + magias + poderes
 */

import { useFicha, useSpellsRealtime, usePowersRealtime } from '@services/firestore/hooks';
import { useMemo } from 'react';
import type { Ficha } from '@types';

interface UseCompleteFichaOptions {
    /** ID da ficha para buscar */
    fichaId: string;
    /** Se deve habilitar as consultas relacionadas (padrão: true) */
    enabled?: boolean;
}

interface UseCompleteFichaResult {
    /** Ficha completa com todos os relacionamentos resolvidos */
    data: Ficha | null;
    /** Estado de loading geral (ficha + magias + poderes) */
    loading: boolean;
    /** Erro ocorrido durante a busca */
    error: Error | null;
}

/**
 * Hook que busca uma ficha completa em tempo real com todos os seus relacionamentos
 * (magias e poderes) resolvidos automaticamente
 *
 * @param options - Configurações do hook
 * @returns Ficha completa com dados em tempo real
 *
 * @example
 * ```typescript
 * const { data: ficha, loading } = useCompleteFicha({
 *   fichaId: 'ficha-123'
 * });
 *
 * // Usa a ficha completa normalmente
 * return <FichaComponent ficha={ficha} />;
 * ```
 */
export function useCompleteFicha({
    fichaId,
    enabled = true
}: UseCompleteFichaOptions): UseCompleteFichaResult {
    // 🔥 Buscar ficha principal em tempo real
    const { data: ficha, loading: fichaLoading, error: fichaError } = useFicha(fichaId);

    // Extrair IDs das magias relacionadas
    const magicIds = useMemo(() =>
        enabled && ficha?.magics?.length > 0
            ? ficha.magics.map(m => m._id || m).filter(Boolean)
            : [],
    [ ficha?.magics, enabled ]
    );

    // 🔥 Buscar magias relacionadas em paralelo
    const {
        data: relatedMagics,
        loading: magicsLoading,
        error: magicsError
    } = useSpellsRealtime({
        filters: magicIds.length > 0 ? [
            { field: '_id', operator: 'in', value: magicIds }
        ] : undefined,
        enabled: enabled && magicIds.length > 0
    });

    // Extrair IDs dos poderes relacionados
    const powerIds = useMemo(() =>
        enabled && ficha?.skills?.powers?.length > 0
            ? ficha.skills.powers.map(p => p._id || p).filter(Boolean)
            : [],
    [ ficha?.skills?.powers, enabled ]
    );

    // 🔥 Buscar poderes relacionados em paralelo
    const {
        data: relatedPowers,
        loading: powersLoading,
        error: powersError
    } = usePowersRealtime({
        filters: powerIds.length > 0 ? [
            { field: '_id', operator: 'in', value: powerIds }
        ] : undefined,
        enabled: enabled && powerIds.length > 0
    });

    // 🔥 Combinar dados em tempo real
    const completeFicha = useMemo((): Ficha | null => {
        if (!ficha || !enabled) return null;

        const fichaWithRelations = { ...ficha };

        // Resolver magias: substituir IDs pelos dados completos
        if (relatedMagics && relatedMagics.length > 0) {
            const magicMap = new Map(relatedMagics.map(m => [ m._id, m ]));
            fichaWithRelations.magics = ficha.magics.map(magicId =>
                magicMap.get(magicId._id || magicId) || magicId
            );
        }

        // Resolver poderes: substituir IDs pelos dados completos
        if (relatedPowers && relatedPowers.length > 0) {
            const powerMap = new Map(relatedPowers.map(p => [ p._id, p ]));
            if (fichaWithRelations.skills?.powers) {
                fichaWithRelations.skills.powers = ficha.skills.powers.map(powerId => {
                    const fullPower = powerMap.get(powerId._id || powerId);
                    return fullPower ? {
                        _id: fullPower._id,
                        name: fullPower.nome,
                        description: fullPower['descrição'],
                        element: fullPower.elemento,
                        mastery: fullPower.maestria,
                        type: 'Poder Mágico' as const
                    } : powerId;
                });
            }
        }

        return fichaWithRelations;
    }, [ ficha, relatedMagics, relatedPowers, enabled ]);

    // Estado de loading geral
    const loading = enabled ? (fichaLoading || magicsLoading || powersLoading) : false;

    // Primeiro erro encontrado (se houver)
    const error = fichaError || magicsError || powersError;

    return {
        data: completeFicha,
        loading,
        error
    };
}
