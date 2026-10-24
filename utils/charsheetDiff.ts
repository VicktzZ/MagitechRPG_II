import { normalizeToArray } from '@utils/normalizeToArray';

type Plain = Record<string, unknown>;

/**
 * Chaves de topo que o diff nunca grava: o dono e a identidade não mudam por edição de ficha,
 * `session` guarda o que a campanha escreve (vantagens, estatísticas da sessão) e o formulário
 * só tem uma foto antiga disso, e `spells` é tratado à parte (a ficha mostra objetos, o banco guarda ids).
 */
const IGNORED_TOP_LEVEL = new Set([ 'id', 'userId', 'createdAt', 'updatedAt', 'playerName', 'session', 'spells' ]);

// Mesmos caracteres que o Firestore proíbe num caminho de campo (ver FIELD_PATH em utils/firestore/adminDocs.ts)
// eslint-disable-next-line no-control-regex
const SAFE_SEGMENT = /^[^.~*/[\]`\u0000-\u001f]+$/;
const MAX_DEPTH = 8;
// A rota aceita até 200 campos por chamada; acima disso grava as chaves de topo inteiras
const MAX_ENTRIES = 150;

export interface CollectChangesOptions {
    /**
     * Magias e poderes que a ficha tinha mas o formulário não mostra (id que não resolveu, sem estágios...).
     * Se a lista for regravada, eles voltam junto — senão seriam apagados em silêncio.
     */
    preserved?: { spells?: readonly unknown[]; powers?: readonly unknown[] };
}

const isPlain = (value: unknown): value is Plain =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** Igualdade profunda em que `undefined`, `null` e chave ausente valem o mesmo (e NaN é igual a NaN). */
export function isSameValue(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || a === undefined) return b === null || b === undefined;
    if (b === null || b === undefined) return false;
    if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
        return a.every((entry, index) => isSameValue(entry, b[index]));
    }
    if (isPlain(a) && isPlain(b)) {
        const keys = new Set([ ...Object.keys(a), ...Object.keys(b) ]);
        for (const key of keys) {
            if (!isSameValue(a[key], b[key])) return false;
        }
        return true;
    }
    return false;
}

/** Valor pronto para o Firestore: `undefined` vira `null`, sem `undefined` aninhado nem instâncias. */
export function toFirestoreValue(value: unknown): unknown {
    if (value === undefined) return null;
    if (value === null || typeof value !== 'object') return Number.isNaN(value) ? null : value;
    return JSON.parse(JSON.stringify(value)) as unknown;
}

function walk(baseline: unknown, current: unknown, path: string[], maxDepth: number, out: Plain): void {
    if (isSameValue(baseline, current)) return;

    if (isPlain(baseline) && isPlain(current) && path.length < maxDepth) {
        const keys = [ ...new Set([ ...Object.keys(baseline), ...Object.keys(current) ]) ];
        // chave que não cabe num caminho de campo: grava o objeto pai inteiro
        if (path.length > 0 && keys.some(key => !SAFE_SEGMENT.test(key))) {
            out[path.join('.')] = toFirestoreValue(current);
            return;
        }
        for (const key of keys) {
            if (path.length === 0 && IGNORED_TOP_LEVEL.has(key)) continue;
            if (!SAFE_SEGMENT.test(key)) continue;
            walk(baseline[key], current[key], [ ...path, key ], maxDepth, out);
        }
        return;
    }

    if (path.length > 0) out[path.join('.')] = toFirestoreValue(current);
}

/** Id com que uma magia fica salva na ficha: o id do catálogo, ou o nome quando não há id. */
export function toSpellId(spell: unknown): string {
    if (typeof spell === 'string') return spell;
    if (isPlain(spell)) return String(spell['id'] || spell['name'] || '');
    return '';
}

export function toSpellIds(spells: unknown): string[] {
    return normalizeToArray<unknown>(spells).map(toSpellId).filter(id => id.trim() !== '');
}

function appendPreservedPowers(out: Plain, preserved: readonly unknown[]): void {
    if (preserved.length === 0) return;
    const whole = out['skills'];
    if (isPlain(whole)) {
        out['skills'] = { ...whole, powers: [ ...normalizeToArray<unknown>(whole['powers']), ...preserved ] };
        return;
    }
    if (Array.isArray(out['skills.powers'])) {
        out['skills.powers'] = [ ...(out['skills.powers'] as unknown[]), ...preserved ];
    }
    // a lista de poderes não mudou: nada foi regravado, nada se perde
}

/**
 * Diferença entre a ficha como foi carregada (`baseline`) e como está agora (`current`),
 * no formato { 'inventory.money': 10, 'attributes.vig': 8 } aceito por `charsheetService.updateFields`.
 *
 * Só o que o jogador mudou vai ao banco. Salvar a ficha inteira (como o PATCH antigo) apagava o que a campanha
 * escreveu enquanto a página estava aberta (vantagens em `session`, dinheiro dado pelo mestre, nível...).
 * Objetos são comparados campo a campo; listas valem como um todo (índices não são caminhos estáveis).
 */
export function collectChanges(baseline: object, current: object, options: CollectChangesOptions = {}): Record<string, unknown> {
    const compute = (maxDepth: number): Plain => {
        const out: Plain = {};
        walk(baseline, current, [], maxDepth, out);

        const baseSpells = toSpellIds((baseline as Plain)['spells']);
        const currentSpells = toSpellIds((current as Plain)['spells']);
        if (!isSameValue(baseSpells, currentSpells)) {
            const extra = (options.preserved?.spells ?? []).map(toSpellId).filter(id => id.trim() !== '' && !currentSpells.includes(id));
            out['spells'] = [ ...currentSpells, ...extra ];
        }

        appendPreservedPowers(out, options.preserved?.powers ?? []);
        return out;
    };

    const detailed = compute(MAX_DEPTH);
    return Object.keys(detailed).length > MAX_ENTRIES ? compute(1) : detailed;
}
