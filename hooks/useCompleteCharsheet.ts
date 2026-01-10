/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { CharsheetDTO, SpellDTO } from '@models/dtos';
import { useMemo } from 'react';
import { useFirestoreRealtime } from './useFirestoreRealtime';

/**
 * Normaliza um valor que pode ser um array ou um objeto com chaves numéricas
 * Converte Record<number, T> para T[]
 */
function normalizeToArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    
    // Se é um objeto com chaves numéricas, converter para array
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        const isNumericKeys = keys.every(key => !isNaN(Number(key)));
        if (isNumericKeys) {
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => value[key]);
        }
    }
    
    return [];
}

interface UseCompleteCharsheetOptions {
    charsheetId: string;
    enabled?: boolean;
}

interface UseCompleteCharsheetResult {
    data: CharsheetDTO | null;
    loading: boolean;
    error: Error | null;
}

export function useCompleteCharsheet({
    charsheetId,
    enabled = true
}: UseCompleteCharsheetOptions): UseCompleteCharsheetResult {
    // Usar realtime para o charsheet principal
    const { 
        data: charsheetData, 
        loading: charsheetLoading, 
        error: charsheetError 
    } = useFirestoreRealtime('charsheet', {
        filters: charsheetId ? [ { field: 'id', operator: '==', value: charsheetId } ] : undefined,
        enabled: enabled && !!charsheetId
    });

    const charsheet = useMemo(() => charsheetData?.[0] || null, [ charsheetData ]);

    const spellsInput = useMemo<unknown[]>(() => normalizeToArray(charsheet?.spells), [ charsheet?.spells ]);
    const spellObjects = useMemo<SpellDTO[]>(
        () => spellsInput.filter((s: any): s is SpellDTO => typeof s === 'object' && s !== null && 'name' in s),
        [ spellsInput ]
    );
    const spellIdsToFetch = useMemo<string[]>(
        () => spellsInput.filter((s: any): s is string => typeof s === 'string'),
        [ spellsInput ]
    );

    const {
        data: relatedSpells,
        loading: spellsLoading,
        error: spellsError
    } = useFirestoreRealtime('spell', {
        // Firestore 'in' suporta no máximo 10 itens. Se >10, evitamos a busca para não quebrar.
        filters: spellIdsToFetch.length > 0 && spellIdsToFetch.length <= 10
            ? [ { field: 'id', operator: 'in', value: spellIdsToFetch } ]
            : undefined,
        enabled: enabled && spellIdsToFetch.length > 0 && spellIdsToFetch.length <= 10
    });

    const powersInput = useMemo<unknown[]>(() => normalizeToArray(charsheet?.skills?.powers), [ charsheet?.skills?.powers ]);
    const powerObjects = useMemo<any[]>(
        () => powersInput.filter((p: any): p is any => typeof p === 'object' && p !== null && 'name' in p),
        [ powersInput ]
    );
    const powerIdsToFetch = useMemo<string[]>(
        () => powersInput.filter((p: any): p is string => typeof p === 'string'),
        [ powersInput ]
    );

    const {
        data: relatedPowers,
        loading: powersLoading,
        error: powersError
    } = useFirestoreRealtime('power', {
        filters: powerIdsToFetch.length > 0 && powerIdsToFetch.length <= 10
            ? [ { field: 'id', operator: 'in', value: powerIdsToFetch } ]
            : undefined,
        enabled: enabled && powerIdsToFetch.length > 0 && powerIdsToFetch.length <= 10
    });

    const completeCharsheet = useMemo((): CharsheetDTO | null => {
        if (!charsheet || !enabled) return null;

        const charsheetWithRelations: CharsheetDTO = { ...charsheet };

        // Monta spells finais: mantém objetos existentes e adiciona os buscados; remove IDs não resolvidos
        {
            const fetchedMap = new Map((relatedSpells ?? []).map((m: any) => [ m.id, m ]));
            const fetchedFromIds = spellIdsToFetch
                .map(id => fetchedMap.get(id))
                .filter((m): m is any => Boolean(m));

            const allSpells = [ ...spellObjects, ...fetchedFromIds ] as any[];
            // Mantém apenas spells com stages válidos para não quebrar os componentes
            const validSpells = allSpells.filter(s => Array.isArray(s?.stages) && s.stages.length > 0);
            (charsheetWithRelations as any).spells = validSpells as SpellDTO[];
        }

        // Monta powers finais: mantém objetos existentes e adiciona os buscados formatados; remove IDs não resolvidos
        if (charsheetWithRelations.skills?.powers) {
            const fetchedMap = new Map((relatedPowers ?? []).map(p => [ p.id, p ]));
            const fetchedPowers = powerIdsToFetch
                .map(id => fetchedMap.get(id))
                .filter((p): p is any => Boolean(p))
                .map(fullPower => ({
                    id: fullPower.id,
                    name: fullPower.name,
                    description: fullPower.description,
                    element: fullPower.element,
                    mastery: fullPower.mastery,
                    type: 'Poder Mágico' as const
                }));

            charsheetWithRelations.skills.powers = [ ...powerObjects, ...fetchedPowers ];
        }

        return charsheetWithRelations;
    }, [ charsheet, relatedSpells, relatedPowers, enabled ]);

    // Considera carregando enquanto ainda precisamos resolver IDs e estamos tentando buscar
    const needsSpellFetch = enabled && spellIdsToFetch.length > 0 && spellIdsToFetch.length <= 10;
    const needsPowerFetch = enabled && powerIdsToFetch.length > 0 && powerIdsToFetch.length <= 10;
    const loading = enabled ? (charsheetLoading || (needsSpellFetch && spellsLoading) || (needsPowerFetch && powersLoading)) : false;
    const error = charsheetError || spellsError || powersError;

    return {
        data: completeCharsheet,
        loading,
        error
    };
}