import type { Combat, Combatant } from '@models';

/**
 * Entrada de combatentes num combate que já começou (jogador que chega depois, reforço do mestre).
 * Regras puras: o que a rota do combate faz em volta (buscar a ficha, rolar a iniciativa, gravar) fica na rota.
 */

type Ranked = Pick<Combatant, 'initiativeTotal'> & { dexterity?: number };

/** Ordem do combate: maior iniciativa primeiro, desempate por destreza (a mesma de `set_initiative`). Negativo = `a` age antes de `b` */
export const byInitiative = (a: Ranked, b: Ranked): number =>
    (b.initiativeTotal - a.initiativeTotal) || ((b.dexterity || 0) - (a.dexterity || 0));

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Id e nome da próxima cópia de uma criatura no combate. O id é `<id da criatura>-<n>` (é como `findBaseCreature` acha a criatura
 * de origem) com o menor n livre; a primeira cópia leva o nome puro e as seguintes "Nome (n)".
 */
export function nextCreatureInstance(combatants: ReadonlyArray<Pick<Combatant, 'id'>>, baseId: string, baseName: string): { id: string; name: string } {
    const pattern = new RegExp(`^${escapeRegExp(baseId)}-(\\d+)$`);
    const taken = new Set<number>();
    let any = false;

    for (const { id } of combatants) {
        if (id === baseId) {
            taken.add(1);
            any = true;
            continue;
        }
        const match = pattern.exec(id);
        if (match) {
            taken.add(Number(match[1]));
            any = true;
        }
    }

    let n = 1;
    while (taken.has(n)) n++;
    return { id: `${baseId}-${n}`, name: any ? `${baseName} (${n})` : baseName };
}

export interface InsertResult {
    /** Posição do novo combatente na ordem */
    index: number;
    /** A vez dele na iniciativa já tinha passado neste round: entra logo depois de quem está agindo */
    afterCurrent: boolean;
}

/**
 * Coloca o combatente no combate.
 * - Fase de iniciativa: vai para o fim da lista e rola como os outros (a ordem só se define em `set_initiative`).
 * - Fase de ação (a lista já está em ordem): entra no lugar da iniciativa dele. Se esse lugar é o de quem já agiu, ou o de quem
 *   está agindo agora, age logo depois do turno atual, para não perder a vez neste round. Quem está agindo continua o mesmo.
 */
export function insertCombatant(combat: Pick<Combat, 'phase' | 'currentTurnIndex' | 'combatants'>, combatant: Combatant): InsertResult {
    const list = combat.combatants;

    if (combat.phase !== 'ACTION' || list.length === 0) {
        list.push(combatant);
        return { index: list.length - 1, afterCurrent: false };
    }

    const current = Math.min(Math.max(combat.currentTurnIndex, 0), list.length - 1);
    let slot = list.findIndex(other => byInitiative(combatant, other) < 0);
    if (slot === -1) slot = list.length;

    const afterCurrent = slot <= current;
    const index = afterCurrent ? current + 1 : slot;
    list.splice(index, 0, combatant);
    return { index, afterCurrent };
}
