/**
 * Plano para gravar um lote de magias NOVAS no catálogo (puro, sem banco). A regra do dono para gravar direto em produção: criar apenas ids novos e abortar se houver colisão de id ou de nome.
 * O nome é comparado sem acento nem caixa (o catálogo tem "Chama Essencial" e ninguém quer "chama essencial" ao lado dela).
 */

export interface PlannedSpell {
    id: string;
    name: string;
}

export interface SpellBatchPlan<T extends PlannedSpell> {
    /** O que seria criado (todo o lote, quando não há colisão) */
    create: T[];
    /** O id já existe no catálogo */
    idCollisions: Array<{ id: string; name: string }>;
    /** O nome já existe no catálogo, em outro id */
    nameCollisions: Array<{ id: string; name: string; existingId: string }>;
    /** Id ou nome repetido dentro do próprio lote */
    duplicatesInBatch: string[];
    /** Pode gravar: nenhuma colisão */
    ok: boolean;
}

export const normalizeSpellName = (name: string): string => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

export function planSpellBatch<T extends PlannedSpell>(batch: readonly T[], existing: readonly PlannedSpell[]): SpellBatchPlan<T> {
    const existingIds = new Set(existing.map(spell => spell.id));
    const existingNames = new Map(existing.map(spell => [ normalizeSpellName(spell.name), spell.id ]));

    const idCollisions: SpellBatchPlan<T>['idCollisions'] = [];
    const nameCollisions: SpellBatchPlan<T>['nameCollisions'] = [];
    const duplicatesInBatch: string[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    for (const spell of batch) {
        const name = normalizeSpellName(spell.name);
        if (seenIds.has(spell.id)) duplicatesInBatch.push(`id ${spell.id}`);
        if (seenNames.has(name)) duplicatesInBatch.push(`nome ${spell.name}`);
        seenIds.add(spell.id);
        seenNames.add(name);

        if (existingIds.has(spell.id)) idCollisions.push({ id: spell.id, name: spell.name });
        const sameName = existingNames.get(name);
        if (sameName !== undefined) nameCollisions.push({ id: spell.id, name: spell.name, existingId: sameName });
    }

    return {
        create: [ ...batch ],
        idCollisions,
        nameCollisions,
        duplicatesInBatch,
        ok: idCollisions.length === 0 && nameCollisions.length === 0 && duplicatesInBatch.length === 0
    };
}
