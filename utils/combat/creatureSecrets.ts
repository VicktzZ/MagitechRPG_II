import { sanitizeDamageModifiers, sanitizeWeaknesses, type DamageModifierData } from './creatureDefense';

/**
 * As defesas de uma criatura são **segredo do mestre** (elemento, fraquezas declaradas, resistências e vulnerabilidades). A criatura
 * personalizada mora em `campaign.custom.creatures`, que qualquer membro lê pelo documento da campanha; por isso as defesas vivem
 * à parte, em `campaigns/{id}/gmData` (regra do Firestore só para `campaign.admin`, `utils/firestore/gmData.ts`), e a criatura pública
 * não carrega esses três campos.
 *
 * Este módulo é puro: separa e junta. **Compatibilidade**: criatura gravada antes da mudança ainda tem os campos dentro dela. Enquanto
 * `scripts/moveCreatureDefenses.ts` não rodar, o documento privado (se existe) vale e, sem ele, valem os campos da própria criatura.
 */

/** Os campos da criatura que são segredo do mestre */
export const CREATURE_SECRET_FIELDS = [ 'elementalMastery', 'weaknesses', 'damageModifiers' ] as const;

export interface CreatureDefenses {
    elementalMastery: string;
    weaknesses: string[];
    damageModifiers: DamageModifierData[];
}

const MAX_ELEMENT_LENGTH = 40;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** O elemento da criatura limpo: texto aparado, até 40 caracteres */
export const sanitizeCreatureElement = (value: unknown): string => (typeof value === 'string' ? value.trim().slice(0, MAX_ELEMENT_LENGTH) : '');

/** As defesas limpas (o que vem do cliente ou de um documento antigo): sempre os três campos, no formato certo */
export function sanitizeCreatureDefenses(raw: unknown): CreatureDefenses {
    const source = isRecord(raw) ? raw : {};
    return {
        elementalMastery: sanitizeCreatureElement(source['elementalMastery']),
        weaknesses: sanitizeWeaknesses(source['weaknesses']),
        damageModifiers: sanitizeDamageModifiers(source['damageModifiers'])
    };
}

/** A criatura (como está gravada na campanha) ainda carrega algum campo de defesa */
export const hasEmbeddedDefenses = (creature: unknown): boolean =>
    isRecord(creature) && CREATURE_SECRET_FIELDS.some(field => field in creature);

/** As defesas que a criatura ainda carrega dentro dela (formato antigo), ou `null` se não carrega nenhuma */
export const embeddedDefensesOf = (creature: unknown): CreatureDefenses | null => (hasEmbeddedDefenses(creature) ? sanitizeCreatureDefenses(creature) : null);

/** A criatura sem os campos de defesa (a versão que vai para o documento da campanha) */
export function stripCreatureDefenses<T extends object>(creature: T): Omit<T, typeof CREATURE_SECRET_FIELDS[number]> {
    const secret: readonly string[] = CREATURE_SECRET_FIELDS;
    const kept = Object.entries(creature).filter(([ key ]) => !secret.includes(key));
    return Object.fromEntries(kept) as Omit<T, typeof CREATURE_SECRET_FIELDS[number]>;
}

/** A lista de criaturas sem os campos de defesa; devolve a MESMA lista quando nenhuma carrega algum (barato e estável para o React) */
export function stripCreatureListDefenses<T extends object>(creatures: readonly T[]): readonly T[] {
    return creatures.some(hasEmbeddedDefenses) ? creatures.map(creature => stripCreatureDefenses(creature) as unknown as T) : creatures;
}

/**
 * A campanha como um **não-mestre** pode vê-la: as criaturas sem as defesas. Devolve a mesma campanha quando não há o que tirar.
 * Vale para toda rota que devolve a campanha inteira a um membro.
 */
export function campaignWithoutCreatureDefenses<C extends object>(campaign: C): C {
    const custom = (campaign as { custom?: { creatures?: unknown } | null }).custom;
    const creatures = custom?.creatures;
    if (!Array.isArray(creatures) || !creatures.some(hasEmbeddedDefenses)) return campaign;
    return { ...campaign, custom: { ...custom, creatures: stripCreatureListDefenses(creatures) } };
}

/** As defesas valem assim: o documento privado, se existe; senão o que a criatura ainda carrega; senão vazio */
export function resolveCreatureDefenses(creature: unknown, privateDefenses: CreatureDefenses | null | undefined): CreatureDefenses {
    return privateDefenses ?? embeddedDefensesOf(creature) ?? sanitizeCreatureDefenses(null);
}

/**
 * As criaturas com as defesas juntadas (para o mestre: o editor, a janela e o ataque assistido leem tudo na criatura). Onde há documento privado ele
 * vale; onde não há, a criatura fica como está (formato antigo, já com os campos). Devolve a mesma lista quando não há nada a juntar.
 */
export function attachCreatureDefenses<T extends { id: string }>(creatures: readonly T[], defenses: Readonly<Record<string, CreatureDefenses>>): readonly T[] {
    const has = (id: string): boolean => Object.prototype.hasOwnProperty.call(defenses, id);
    if (!creatures.some(creature => has(creature.id))) return creatures;
    return creatures.map(creature => (has(creature.id) ? { ...creature, ...defenses[creature.id] } : creature));
}

/** Um documento de `campaigns/{id}/gmData` como o Firestore o entrega ao navegador do mestre */
export interface GmDataDoc {
    id: string;
    data: Record<string, unknown>;
}

/** As defesas por id da criatura a partir dos documentos de `gmData` (ignora os de outro `kind` e os sem `creatureId`) */
export function creatureDefensesFromDocs(docs: readonly GmDataDoc[]): Record<string, CreatureDefenses> {
    const result: Record<string, CreatureDefenses> = {};
    for (const { data } of docs) {
        if (data['kind'] !== 'creatureDefenses') continue;
        const creatureId = data['creatureId'];
        if (typeof creatureId === 'string' && creatureId) result[creatureId] = sanitizeCreatureDefenses(data);
    }
    return result;
}
