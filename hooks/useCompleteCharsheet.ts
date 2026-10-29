/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { CharsheetDTO, SpellDTO } from '@models/dtos';
import { normalizeCharsheet } from '@utils/charsheetNormalize';
import { isInitialCharsheetLoad } from '@utils/charsheetLoad';
import { normalizeToArray } from '@utils/normalizeToArray';
import { useMemo, useRef } from 'react';
import { useFirestoreByIds } from './useFirestoreByIds';
import { useFirestoreRealtime } from './useFirestoreRealtime';

interface UseCompleteCharsheetOptions {
    charsheetId: string;
    enabled?: boolean;
}

interface UseCompleteCharsheetResult {
    data: CharsheetDTO | null;
    /**
     * Só a PRIMEIRA carga de cada ficha. Depois dela, trocar os ids de magias/poderes
     * recarrega esses documentos em segundo plano sem voltar a `true`: quem usa `loading`
     * para mostrar um spinner no lugar da tela (campanha, ficha) desmontaria tudo — chat,
     * widgets, modais abertos e o formulário com edições não salvas.
     */
    loading: boolean;
    error: Error | null;
    /**
     * Magias e poderes que a ficha tem mas a tela não mostra (id que não achou no catálogo, magia sem estágios).
     * Quem salva a lista precisa devolvê-los junto, senão o salvamento os apaga do banco.
     */
    dropped: DroppedEntries;
}

export interface DroppedEntries {
    spells: unknown[];
    powers: unknown[];
}

const NO_DROPPED: DroppedEntries = { spells: [], powers: [] };

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

    // Fichas antigas guardam listas como objeto de chaves numéricas, campos nulos etc.: o formato é corrigido aqui,
    // uma vez, para que o formulário, o schema e o resto da tela vejam sempre o mesmo formato
    const charsheet = useMemo(() => charsheetData?.[0] ? normalizeCharsheet(charsheetData[0]) : null, [ charsheetData ]);

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
    } = useFirestoreByIds('spell', spellIdsToFetch, {
        enabled: enabled && spellIdsToFetch.length > 0
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
    } = useFirestoreByIds('power', powerIdsToFetch, {
        enabled: enabled && powerIdsToFetch.length > 0
    });

    const { completeCharsheet, dropped } = useMemo((): { completeCharsheet: CharsheetDTO | null; dropped: DroppedEntries } => {
        if (!charsheet || !enabled) return { completeCharsheet: null, dropped: NO_DROPPED };

        const charsheetWithRelations: CharsheetDTO = { ...charsheet };
        const droppedEntries: DroppedEntries = { spells: [], powers: [] };

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

            // O que ficou de fora continua na ficha: id que não achou no catálogo e magia sem estágios
            droppedEntries.spells = spellsInput.filter(entry => typeof entry === 'string'
                ? !fetchedMap.has(entry) || !validSpells.includes(fetchedMap.get(entry))
                : !validSpells.includes(entry));
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

            droppedEntries.powers = powersInput.filter(entry => typeof entry === 'string'
                ? !fetchedMap.has(entry)
                : !powerObjects.includes(entry));
        }

        return { completeCharsheet: charsheetWithRelations, dropped: droppedEntries };
    }, [ charsheet, relatedSpells, relatedPowers, enabled, spellIdsToFetch, powerIdsToFetch, spellObjects, powerObjects, spellsInput, powersInput ]);

    // Considera carregando enquanto ainda precisamos resolver IDs e estamos tentando buscar
    const needsSpellFetch = enabled && spellIdsToFetch.length > 0;
    const needsPowerFetch = enabled && powerIdsToFetch.length > 0;
    const stillLoading = enabled ? (charsheetLoading || (needsSpellFetch && spellsLoading) || (needsPowerFetch && powersLoading)) : false;

    // Marca a ficha como carregada na primeira vez que terminou; trocar de ficha reinicia
    const loadedIdRef = useRef<string>();
    if (!stillLoading && charsheet?.id) loadedIdRef.current = charsheet.id;
    const loading = isInitialCharsheetLoad(stillLoading, loadedIdRef.current, charsheetId);
    const error = charsheetError || spellsError || powersError;

    return {
        data: completeCharsheet,
        loading,
        error,
        dropped
    };
}
