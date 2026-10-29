/**
 * O campo `type` de uma magia, no banco, é texto livre no formato
 * "Categoria (subtipo)" (ex: "Defesa (imediato)", "Encantamento (contínuo)").
 * Não existem campos dedicados, então categoria e subtipo são derivados do texto.
 *
 * O catálogo tem variações que precisam ser tratadas ao derivar:
 *  - caixa diferente ("Imediato"/"imediato") e gênero ("contínua"/"contínuo");
 *  - combinações: "Ataque/Cura (imediato)" (duas categorias) e
 *    "Conjurado, Contínuo", "Imediato/Área" (dois subtipos);
 *  - sem subtipo ("Ataque") ou com texto sobrando depois do parêntese;
 *  - "(Reação)" no `type` de duas magias: Reação é uma EXECUÇÃO (campo `execution`), não um
 *    subtipo, então esse texto é ignorado aqui e o filtro "Execução" é que lista as reações.
 *
 * Categorias e subtipos **removidos** (decisão do dono, 29/10/2026): Buff virou Suporte; Debuff, Ilusão e Anulação viraram Controle; os subtipos Sacrifício, Multiplicador, Condicional e
 * Adjacente deixaram de existir. O catálogo foi migrado (`scripts/migrateSpellTypes.ts`), e aqui o texto antigo (magia criada à mão, cópia velha) também é tratado:
 * a categoria removida vira a nova e o subtipo removido some, então o filtro nunca os oferece.
 *
 * "Recuperação" é a categoria das magias que devolvem MP (ao conjurador ou a aliados). Quando a
 * magia só faz isso, o `type` é "Recuperação (subtipo)"; quando recuperar MP é um efeito além de
 * outro (dano, cura, defesa...), a categoria é somada: "Ataque/Recuperação (imediato)". Em qualquer
 * dos casos o filtro "Tipo: Recuperação" encontra a magia.
 */

/** Categorias conhecidas do catálogo. Categorias novas aparecem no filtro conforme são carregadas. */
export const SPELL_CATEGORIES = [
    'Ataque',
    'Controle',
    'Cura',
    'Defesa',
    'Drenagem',
    'Encantamento',
    'Mentalização',
    'Movimento',
    'Recuperação',
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
    'Completo',
    'Invocação'
];

const FALLBACK_CATEGORY = 'Outro';

const normalizeKey = (value: string): string =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Categorias que deixaram de existir e a que cada uma virou (chave sem acento nem caixa): Buff → Suporte; Debuff, Ilusão e Anulação → Controle */
export const REMOVED_CATEGORY_REPLACEMENT: Readonly<Record<string, string>> = {
    buff: 'Suporte',
    debuff: 'Controle',
    ilusao: 'Controle',
    anulacao: 'Controle'
};

/** Subtipos que deixaram de existir (chave sem acento nem caixa): o texto antigo de uma magia que ainda os tenha é ignorado */
export const REMOVED_SUBTYPES: readonly string[] = [ 'sacrificio', 'sacrificial', 'multiplicador', 'condicional', 'adjacente' ];

/** Forma canônica das categorias conhecidas, indexada pela chave sem acento/caixa ("recuperacao" → "Recuperação") */
const CATEGORY_ALIASES: Record<string, string> = Object.fromEntries(
    SPELL_CATEGORIES.map(category => [ normalizeKey(category), category ])
);

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
        .map(part => REMOVED_CATEGORY_REPLACEMENT[normalizeKey(part)] ?? CATEGORY_ALIASES[normalizeKey(part)] ?? capitalize(part));

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
        .filter(part => Boolean(part) && normalizeKey(part) !== 'reacao' && !REMOVED_SUBTYPES.includes(normalizeKey(part)))
        .map(part => SUBTYPE_ALIASES[normalizeKey(part)] ?? capitalize(part));

    return unique(subtypes);
}

/** Execuções do catálogo, na ordem em que aparecem no filtro "Execução" */
export const SPELL_EXECUTIONS = [
    'Padrão',
    'Completa',
    'Movimento',
    'Bônus',
    'Reação'
];

/**
 * Forma canônica das execuções, indexada pela chave sem acento/caixa (o catálogo tem "padrão" em minúsculas).
 * "Livre" é o nome antigo de "Bônus" (regra do combate): magia ainda gravada como "Livre" cai no filtro "Bônus".
 */
const EXECUTION_ALIASES: Record<string, string> = {
    ...Object.fromEntries(SPELL_EXECUTIONS.map(execution => [ normalizeKey(execution), execution ])),
    livre: 'Bônus'
};

/** Execução de uma magia na forma canônica: "padrão" → ["Padrão"]. Sem execução devolve lista vazia. */
export function getSpellExecution(execution?: string | null): string[] {
    const text = execution?.trim();
    if (!text) return [];
    return [ EXECUTION_ALIASES[normalizeKey(text)] ?? capitalize(text) ];
}

/**
 * Configuração do menu "Tipo" (com o subfiltro "Subtipo") para listas de magias
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

/** Configuração do menu "Execução" para listas de magias */
export const SPELL_EXECUTION_FILTER = {
    label: 'Execução',
    getValue: (spell: { execution?: string | null }) => getSpellExecution(spell.execution),
    options: SPELL_EXECUTIONS
};

/** Níveis das magias, na ordem do filtro "Nível" */
export const SPELL_LEVELS = [ '1', '2', '3', '4' ];

/** O nível da magia como texto do filtro ("3"); sem nível válido a magia não entra em nenhuma opção */
export function getSpellLevel(level?: number | string | null): string[] {
    const value = Math.trunc(Number(level));
    return Number.isFinite(value) && value > 0 ? [ String(value) ] : [];
}

/** Configuração do menu "Nível" para listas de magias: só as de nível 1, só as de nível 2... (várias opções: OU entre elas) */
export const SPELL_LEVEL_FILTER = {
    label: 'Nível',
    getValue: (spell: { level?: number | string | null }) => getSpellLevel(spell.level),
    options: SPELL_LEVELS
};

/** Menus de filtro das listas de magias, na ordem em que aparecem: Tipo (com Subtipo), Execução e Nível */
export const SPELL_FILTERS = [ SPELL_TYPE_FILTER, SPELL_EXECUTION_FILTER, SPELL_LEVEL_FILTER ];
