import { isSameValue, toFirestoreValue } from '@utils/charsheetDiff';
import { normalizeToArray } from '@utils/normalizeToArray';

type Plain = Record<string, unknown>;

const isPlain = (value: unknown): value is Plain =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

/** Número a partir de número ou texto numérico ("3", "2,5"); `undefined` quando não dá. */
function toNumber(value: unknown): number | undefined {
    if (isFiniteNumber(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value.trim().replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

/** Lista gravada como array, como objeto de chaves numéricas (formato antigo) ou ausente. */
function asList(value: unknown): unknown[] {
    return normalizeToArray<unknown>(value).filter(entry => entry !== undefined && entry !== null);
}

const asObjectList = (value: unknown): Plain[] => asList(value).filter(isPlain);

const asText = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return fallback;
};

const hasName = (entry: Plain): boolean => typeof entry['name'] === 'string' && entry['name'].trim() !== '';

/** Peso, valor e quantidade que vieram como texto viram número. */
function normalizeNumericFields(entry: Plain): Plain {
    const next: Plain = { ...entry };
    for (const key of [ 'weight', 'value', 'quantity' ]) {
        if (typeof next[key] === 'string') {
            const parsed = toNumber(next[key]);
            if (parsed !== undefined) next[key] = parsed;
        }
    }
    if (next['description'] !== undefined && typeof next['description'] !== 'string') {
        next['description'] = asText(next['description']);
    }
    return next;
}

function normalizeWeapon(entry: Plain): Plain {
    const next = normalizeNumericFields(entry);
    if (typeof next['ammo'] !== 'string' || next['ammo'] === '') next['ammo'] = 'Não consome';
    if (typeof next['bonus'] !== 'string') next['bonus'] = asText(next['bonus']);
    if (typeof next['hit'] !== 'string') next['hit'] = asText(next['hit']);
    if (typeof next['categ'] !== 'string') next['categ'] = asText(next['categ']);
    if (next['accessories'] !== undefined) next['accessories'] = asList(next['accessories']);

    if (isPlain(next['effect'])) {
        const { critChance, ...effect } = next['effect'];
        // chance de crítico em texto ("19") vira número; texto que não é número sai
        const parsedChance = typeof critChance === 'string' ? toNumber(critChance) : critChance;
        next['effect'] = parsedChance === undefined ? effect : { ...effect, critChance: parsedChance };
    }
    return next;
}

function normalizeArmor(entry: Plain): Plain {
    const next = normalizeNumericFields(entry);
    if (typeof next['categ'] !== 'string') next['categ'] = asText(next['categ']);
    return next;
}

function normalizeItem(entry: Plain): Plain {
    const next = normalizeNumericFields(entry);
    if (next['effects'] !== undefined && !Array.isArray(next['effects'])) next['effects'] = asList(next['effects']);
    return next;
}

function normalizeInventory(inventory: unknown, keepUnnamed: boolean): unknown {
    if (!isPlain(inventory)) return inventory;
    const next: Plain = { ...inventory };
    // sem nome o item não aparece nem pode ser excluído, e o schema o recusaria
    const named = (entries: Plain[]): Plain[] => keepUnnamed ? entries : entries.filter(hasName);
    if ('items' in next) next['items'] = named(asObjectList(next['items'])).map(normalizeItem);
    if ('weapons' in next) next['weapons'] = named(asObjectList(next['weapons'])).map(normalizeWeapon);
    if ('armors' in next) next['armors'] = named(asObjectList(next['armors'])).map(normalizeArmor);
    return next;
}

const SKILL_LISTS = [ 'class', 'subclass', 'bonus', 'lineage', 'race', 'occupation' ] as const;

/** `effects` de uma habilidade também veio como objeto de chaves numéricas nas fichas antigas */
const normalizeSkillEntry = (entry: Plain): Plain =>
    'effects' in entry && entry['effects'] !== null && !Array.isArray(entry['effects']) ? { ...entry, effects: asList(entry['effects']) } : entry;

function normalizeSkills(skills: unknown): unknown {
    if (!isPlain(skills)) return skills;
    const next: Plain = { ...skills };
    for (const key of SKILL_LISTS) {
        if (key in next) next[key] = asObjectList(next[key]).map(normalizeSkillEntry);
    }
    // Poderes podem ser ids (texto) que a carga resolve depois; só tira o que não é nada
    if ('powers' in next) next['powers'] = asList(next['powers']).map(entry => isPlain(entry) ? normalizeSkillEntry(entry) : entry);
    return next;
}

function normalizeExpertises(expertises: unknown): unknown {
    if (!isPlain(expertises)) return expertises;
    const next: Plain = {};
    for (const [ name, raw ] of Object.entries(expertises)) {
        if (isPlain(raw)) {
            const value = toNumber(raw['value']);
            next[name] = {
                ...raw,
                value: value ?? 0,
                defaultAttribute: raw['defaultAttribute'] === undefined ? null : raw['defaultAttribute']
            };
        } else {
            next[name] = { value: toNumber(raw) ?? 0, defaultAttribute: null };
        }
    }
    return next;
}

/** `session` é da campanha: só o formato de lista é corrigido, nada é acrescentado nem removido */
function normalizeSession(session: unknown): unknown {
    if (session === undefined || session === null) return session;
    return asObjectList(session).map(entry => 'perks' in entry ? { ...entry, perks: asList(entry['perks']) } : entry);
}

function normalizeDices(dices: unknown): unknown {
    return asObjectList(dices).map(dice => ({
        ...dice,
        dices: asObjectList(dice['dices'])
    }));
}

/** Recursos e campos customizados: `null` não é número/texto, então a chave sai. */
function dropNullValues(value: unknown): unknown {
    if (!isPlain(value)) return value;
    return Object.fromEntries(Object.entries(value).filter(([ , entry ]) => entry !== null && entry !== undefined));
}

export interface NormalizeOptions {
    /** Mantém item, arma e armadura sem nome (a carga os tira porque a tela não os mostra; a migração não apaga nada) */
    keepUnnamedItems?: boolean;
}

/**
 * Leva uma ficha vinda do banco ao formato que o formulário e o schema esperam.
 *
 * Fichas criadas entre nov/2025 e jan/2026 têm listas gravadas como objeto de chaves numéricas,
 * `elementalMastery`/`anotacoes` nulos, perícias soltas, armas sem `ammo`... Esta função é pura
 * e idempotente: só mexe no FORMATO (nunca no valor que o jogador escolheu) e devolve uma cópia rasa
 * com as partes alteradas refeitas. Serve à carga da ficha e ao script de migração.
 */
export function normalizeCharsheet<T extends object>(charsheet: T, options: NormalizeOptions = {}): T {
    const next: Plain = { ...(charsheet as Plain) };

    if ('inventory' in next) next['inventory'] = normalizeInventory(next['inventory'], options.keepUnnamedItems ?? false);
    if ('skills' in next) next['skills'] = normalizeSkills(next['skills']);
    if ('expertises' in next) next['expertises'] = normalizeExpertises(next['expertises']);
    if ('session' in next) next['session'] = normalizeSession(next['session']);
    if ('dices' in next) next['dices'] = normalizeDices(next['dices']);

    for (const key of [ 'status', 'traits', 'spells' ]) {
        if (key in next) next[key] = asList(next[key]);
    }
    if ('passives' in next) next['passives'] = asObjectList(next['passives']);

    for (const key of [ 'customResources', 'customResourceMaxes', 'customFields' ]) {
        if (key in next) next[key] = dropNullValues(next[key]);
    }

    for (const key of [ 'elementalMastery', 'anotacoes', 'financialCondition' ]) {
        if (key in next && typeof next[key] !== 'string') next[key] = asText(next[key]);
    }
    for (const key of [ 'class', 'race', 'lineage', 'subclass', 'occupation' ]) {
        if (key in next && typeof next[key] !== 'string') next[key] = asText(next[key]);
    }
    if ('gender' in next && typeof next['gender'] !== 'string') next['gender'] = 'Não definido';
    if ('age' in next) next['age'] = toNumber(next['age']) ?? 0;

    return next as T;
}

// `inventory` e `skills` são comparados uma lista por vez: a migração regrava só a lista que mudou
const NESTED_KEYS = [ 'inventory', 'skills' ];

/**
 * O que a migração gravaria numa ficha: { caminho: valor novo } só para o que `normalizeCharsheet` muda.
 * Vazio quando a ficha já está no formato certo (rodar de novo não faz nada). Não apaga item sem nome.
 */
export function planNormalization(charsheet: object): Record<string, unknown> {
    const before = charsheet as Plain;
    const after = normalizeCharsheet(charsheet, { keepUnnamedItems: true }) as Plain;
    const fields: Plain = {};

    for (const key of Object.keys(after)) {
        const beforeValue = before[key];
        const afterValue = after[key];
        if (NESTED_KEYS.includes(key) && isPlain(beforeValue) && isPlain(afterValue)) {
            for (const nested of Object.keys(afterValue)) {
                if (!isSameValue(beforeValue[nested], afterValue[nested])) fields[`${key}.${nested}`] = toFirestoreValue(afterValue[nested]);
            }
        } else if (!isSameValue(beforeValue, afterValue)) {
            fields[key] = toFirestoreValue(afterValue);
        }
    }
    return fields;
}
