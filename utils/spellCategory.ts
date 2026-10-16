/**
 * O campo `type` de uma magia, no banco, é texto livre no formato
 * "Categoria (subtipo)" (ex: "Defesa (imediato)", "Encantamento (contínuo)").
 * Não existem campos dedicados, então categoria e subtipo são derivados do texto.
 *
 * O catálogo tem variações que precisam ser tratadas ao derivar:
 *  - caixa diferente ("Imediato"/"imediato") e gênero ("contínua"/"contínuo");
 *  - combinações: "Ataque/Cura (imediato)" (duas categorias) e
 *    "Conjurado, Contínuo", "Imediato/Área" (dois subtipos);
 *  - sem subtipo ("Ataque") ou com texto sobrando depois do parêntese.
 */

/** Categorias conhecidas do catálogo. Categorias novas aparecem no filtro conforme são carregadas. */
export const SPELL_CATEGORIES = [
    'Anulação',
    'Ataque',
    'Buff',
    'Controle',
    'Cura',
    'Debuff',
    'Defesa',
    'Drenagem',
    'Encantamento',
    'Ilusão',
    'Mentalização',
    'Movimento',
    'Suporte',
    'Transmutação',
    'Utilidade'
];

/**
 * Subtipos conhecidos do catálogo, na ordem em que aparecem no filtro. Subtipos novos
 * aparecem conforme são carregados.
 */
export const SPELL_SUBTYPES = [
    'Imediato',
    'Conjurado',
    'Contínuo',
    'Sustentado',
    'Área',
    'Reação',
    'Completo',
    'Invocação'
];

const FALLBACK_CATEGORY = 'Outro';

const normalizeKey = (value: string): string =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Forma canônica dos subtipos conhecidos, indexada pela chave sem acento/caixa (inclui o feminino) */
const SUBTYPE_ALIASES: Record<string, string> = Object.fromEntries([
    ...SPELL_SUBTYPES.map(subtype => [ normalizeKey(subtype), subtype ]),
    [ 'imediata', 'Imediato' ],
    [ 'conjurada', 'Conjurado' ],
    [ 'continua', 'Contínuo' ],
    [ 'sustentada', 'Sustentado' ],
    [ 'completa', 'Completo' ]
]);

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

/** Remove duplicatas preservando a ordem */
const unique = (values: string[]): string[] => Array.from(new Set(values));

/** Texto antes do primeiro "(" — a(s) categoria(s) do `type` */
const getCategoryText = (type: string): string => type.split('(')[0]?.trim() ?? '';

/** Conteúdo do primeiro par de parênteses — o(s) subtipo(s) do `type` */
const getSubtypeText = (type: string): string => /\(([^)]*)\)/.exec(type)?.[1] ?? '';

/**
 * Categoria como aparece no texto, sem tratar combinações (ex: "Ataque/Cura").
 * Para filtrar, use `getSpellCategories`.
 */
export function getSpellCategory(type?: string | null): string {
    if (!type) return FALLBACK_CATEGORY;
    return getCategoryText(type) || FALLBACK_CATEGORY;
}

/** Todas as categorias de uma magia: "Ataque/Cura (imediato)" → ["Ataque", "Cura"] */
export function getSpellCategories(type?: string | null): string[] {
    if (!type) return [ FALLBACK_CATEGORY ];

    const categories = getCategoryText(type)
        .split('/')
        .map(part => part.trim())
        .filter(Boolean)
        .map(capitalize);

    return categories.length > 0 ? unique(categories) : [ FALLBACK_CATEGORY ];
}

/**
 * Todos os subtipos de uma magia, na forma canônica:
 * "Defesa (contínua)" → ["Contínuo"]; "Cura (Conjurado, Contínuo)" → ["Conjurado", "Contínuo"].
 * Magias sem subtipo devolvem lista vazia.
 */
export function getSpellSubtypes(type?: string | null): string[] {
    if (!type) return [];

    const subtypes = getSubtypeText(type)
        .split(/[/,]/)
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => SUBTYPE_ALIASES[normalizeKey(part)] ?? capitalize(part));

    return unique(subtypes);
}

/**
 * Configuração dos filtros "Tipo" e "Subtipo" para listas de magias
 * (ver `SecondaryFilterConfig` em models/types/components.ts).
 */
export const SPELL_TYPE_FILTER = {
    label: 'Tipo',
    getValue: (spell: { type?: string | null }) => getSpellCategories(spell.type),
    options: SPELL_CATEGORIES,
    subFilter: {
        label: 'Subtipo',
        getValue: (spell: { type?: string | null }) => getSpellSubtypes(spell.type),
        options: SPELL_SUBTYPES
    }
};
