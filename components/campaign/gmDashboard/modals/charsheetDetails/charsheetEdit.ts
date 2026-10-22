import type { CharsheetDTO } from '@models/dtos';
import { normalizeToArray } from './normalizeToArray';

/** Snapshot editável da ficha, usado ao abrir o modal e como base para salvar só o que mudou */
export function buildEditSnapshot(charsheet: Required<CharsheetDTO>): Partial<CharsheetDTO> {
    return {
        name: charsheet.name,
        playerName: charsheet.playerName,
        level: charsheet.level,
        age: charsheet.age,
        gender: charsheet.gender,
        race: charsheet.race,
        stats: { ...charsheet.stats },
        capacity: { ...charsheet.capacity },
        attributes: { ...charsheet.attributes },
        expertises: { ...charsheet.expertises },
        mods: {
            ...charsheet.mods,
            attributes: { ...charsheet.mods?.attributes }
        },
        points: { ...charsheet.points },
        inventory: {
            ...charsheet.inventory,
            weapons: normalizeToArray(charsheet.inventory?.weapons),
            armors: normalizeToArray(charsheet.inventory?.armors),
            items: normalizeToArray(charsheet.inventory?.items)
        },
        skills: { ...charsheet.skills },
        spells: normalizeToArray(charsheet.spells),
        displacement: charsheet.displacement,
        spellSpace: charsheet.spellSpace,
        elementalMastery: charsheet.elementalMastery
    };
}

/**
 * Dados restaurados ao cancelar a edição: os mesmos campos que a edição abriu, para que cancelar e
 * editar de novo sem fechar o modal não traga de volta o que foi alterado (idade, raça, perícias, magias...)
 */
export const buildCancelSnapshot = buildEditSnapshot;

/** Helper para obter valor do input de forma segura */
export const getInputValue = (value: unknown, fallback?: number): string => {
    if (value === '' || value === null || value === undefined) {
        return fallback !== undefined ? String(fallback) : '';
    }
    return String(value);
};

// Limpa e normaliza dados antes de salvar
const cleanDataForSaving = (data: unknown): unknown => {
    if (data === null || data === undefined) return data;

    // Se é um array, retorna o array (não limpa recursivamente)
    if (Array.isArray(data)) return data;

    // Se não é objeto, retorna como está
    if (typeof data !== 'object') {
        // Converte string vazia em 0 apenas para números
        return data === '' ? 0 : data;
    }

    // Se é objeto, limpa recursivamente
    const source = data as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};
    Object.keys(source).forEach(key => {
        const value = source[key];

        // Pula campos undefined ou null
        if (value === undefined || value === null) {
            return;
        }

        // Se é string vazia, converte para 0
        if (value === '') {
            cleaned[key] = 0;
        }
        // Se é array, preserva
        else if (Array.isArray(value)) {
            cleaned[key] = value;
        }
        // Se é objeto, limpa recursivamente
        else if (typeof value === 'object') {
            cleaned[key] = cleanDataForSaving(value);
        }
        // Valores primitivos, mantém
        else {
            cleaned[key] = value;
        }
    });
    return cleaned;
};

// Preparar dados limpos
const pickEditableFields = (data: Partial<CharsheetDTO>) => ({
    name: data.name,
    playerName: data.playerName,
    level: data.level,
    age: data.age,
    gender: data.gender,
    race: data.race,
    stats: data.stats,
    capacity: data.capacity,
    attributes: data.attributes,
    expertises: data.expertises,
    mods: data.mods,
    points: data.points,
    inventory: data.inventory,
    skills: data.skills,
    // Editáveis no modal, mas antes não eram salvos
    spells: data.spells,
    elementalMastery: data.elementalMastery,
    displacement: data.displacement,
    spellSpace: data.spellSpace
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Compara os dados editados com o snapshot do início da edição e devolve só os campos que o
 * mestre alterou (por caminho, ex: 'stats.lp'), para não sobrescrever o que o jogador mudou
 * enquanto a edição estava aberta
 */
export function collectCharsheetChanges(
    editedData: Partial<CharsheetDTO>,
    baselineData: Partial<CharsheetDTO>
): Record<string, unknown> {
    const cleanedData = cleanDataForSaving(pickEditableFields(editedData));
    const cleanedBaseline = cleanDataForSaving(pickEditableFields(baselineData));

    const changes: Record<string, unknown> = {};
    const collectChanges = (base: unknown, next: unknown, path: string) => {
        if (isPlainObject(next) && isPlainObject(base)) {
            Object.keys(next).forEach(key => collectChanges(base[key], next[key], path ? `${path}.${key}` : key));
            return;
        }
        if (JSON.stringify(base) !== JSON.stringify(next)) {
            changes[path] = next;
        }
    };
    collectChanges(cleanedBaseline, cleanedData, '');
    return changes;
}
