import { REMOVED_CATEGORY_REPLACEMENT, REMOVED_SUBTYPES } from './spellCategory';

/**
 * Reorganização dos tipos e subtipos das magias (decisão do dono, 29/10/2026), aplicada ao texto do `type` ("Categoria (subtipo)"):
 *  - categorias removidas viram a nova: Buff → Suporte; Debuff, Ilusão e Anulação → Controle (sem repetir: "Controle/Debuff" fica "Controle");
 *  - subtipos removidos somem: Sacrifício, Multiplicador, Condicional e Adjacente;
 *  - a magia **em área** ganha o subtipo "Área" e a que **invoca** uma entidade ganha "Invocação", somados aos que já tinha ("imediato" → "imediato/Área").
 * Pura: quem decide quais magias são de área ou de invocação é o mapeamento (`scripts/data/spellTaxonomyChanges.ts`), lido do texto dos estágios.
 */

export interface SpellTaxonomyFlags {
    /** A magia atinge uma área (raio, cone, linha, zona) ou todos num grupo */
    area?: boolean;
    /** A magia invoca uma entidade ou criatura que age sob o controle do conjurador */
    summon?: boolean;
}

const normalizeKey = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** "Ataque/Debuff (Imediato) resto" → categorias, subtipos (ou `null` sem parênteses) e o texto que sobra depois do parêntese */
const SPLIT = /^([^()]*)(?:\(([^)]*)\))?([\s\S]*)$/;

const joinWith = (subtypeText: string): string => (subtypeText.includes(',') && !subtypeText.includes('/') ? ', ' : '/');

/** O `type` depois da reorganização. Sem nada a mudar devolve o mesmo texto */
export function migrateSpellType(type: string, flags: SpellTaxonomyFlags = {}): string {
    const match = SPLIT.exec(type);
    if (!match) return type;
    const [ , categoryText = '', subtypeText, trailing = '' ] = match;

    // Categorias: troca as removidas e tira a repetição, mantendo a ordem e a grafia das que ficam
    const seen = new Set<string>();
    const categories: string[] = [];
    for (const part of categoryText.split('/').map(entry => entry.trim()).filter(Boolean)) {
        const replaced = REMOVED_CATEGORY_REPLACEMENT[normalizeKey(part)] ?? part;
        const key = normalizeKey(replaced);
        if (seen.has(key)) continue;
        seen.add(key);
        categories.push(replaced);
    }

    // Subtipos: tira os removidos e soma "Área" e "Invocação" se faltarem
    const separator = joinWith(subtypeText ?? '');
    const subtypes = (subtypeText ?? '').split(/[/,]/).map(entry => entry.trim()).filter(entry => entry !== '' && !REMOVED_SUBTYPES.includes(normalizeKey(entry)));
    const has = (key: string): boolean => subtypes.some(entry => normalizeKey(entry) === key);
    if (flags.area && !has('area')) subtypes.push('Área');
    if (flags.summon && !has('invocacao')) subtypes.push('Invocação');

    const head = categories.length > 0 ? categories.join('/') : categoryText.trim();
    return `${head}${subtypes.length > 0 ? ` (${subtypes.join(separator)})` : ''}${trailing}`;
}

/**
 * Definição do dono (29/10/2026): **imediato** é o mesmo que instantâneo, o que é executado na hora; **tudo que dura é contínuo**. Esta função troca o subtipo "imediato" de uma
 * magia que dura por "contínuo", mantendo a categoria, a caixa da primeira letra ("Imediato" → "Contínuo"), os outros subtipos ("imediato/Área" → "contínuo/Área") e o texto depois do
 * parêntese. Pura e idempotente: sem o subtipo "imediato" devolve o mesmo texto, e se a magia já tinha "contínuo" ele não se repete.
 */
export function toContinuousSubtype(type: string): string {
    const match = SPLIT.exec(type);
    if (!match) return type;
    const [ , categoryText = '', subtypeText, trailing = '' ] = match;
    if (subtypeText === undefined) return type;

    const parts = subtypeText.split(/[/,]/).map(entry => entry.trim()).filter(entry => entry !== '');
    if (!parts.some(entry => normalizeKey(entry) === 'imediato')) return type;

    const seen = new Set<string>();
    const subtypes: string[] = [];
    for (const part of parts) {
        const next = normalizeKey(part) === 'imediato' ? (part.charAt(0) === part.charAt(0).toUpperCase() ? 'Contínuo' : 'contínuo') : part;
        const key = normalizeKey(next);
        if (seen.has(key)) continue;
        seen.add(key);
        subtypes.push(next);
    }

    return `${categoryText}(${subtypes.join(joinWith(subtypeText))})${trailing}`;
}
