/**
 * Rolagem de perícia de criatura (regra da criatura, não a da ficha): o atributo padrão da perícia dá os d20 (`⌊valor ÷ 5⌋`, no mínimo 1: 0 vale -1, 5 vale 1,
 * 10 vale 2... até 5), vale o maior, e soma o valor da perícia. É a mesma conta do botão de perícia da criatura (`useCreatureExpertiseRoll`), sem mandar ao chat:
 * serve ao teste de defesa (Reflexos, RES) que o mestre rola pela criatura no painel do ataque.
 */

interface CreatureRollSource {
    attributes?: object;
    expertises?: object;
}

export interface CreatureRoll {
    dice: number;
    rolls: number[];
    used: number;
    bonus: number;
    total: number;
}

const asNumber = (value: unknown): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

/** Quantos d20 o valor de atributo da criatura dá */
export function creatureDiceFor(attributeValue: number): number {
    const mod = attributeValue === 0 ? -1 : Math.min(5, Math.floor(attributeValue / 5));
    return Number.isFinite(mod) && mod >= 1 ? mod : 1;
}

/** Rola a perícia da criatura; `null` se ela não tem a perícia */
export function rollCreatureExpertise(creature: CreatureRollSource | null | undefined, name: string, random: () => number = Math.random): CreatureRoll | null {
    const expertise = (creature?.expertises as Record<string, { value?: unknown; defaultAttribute?: unknown } | undefined> | undefined)?.[name];
    if (!expertise) return null;

    const attribute = typeof expertise.defaultAttribute === 'string' ? expertise.defaultAttribute : '';
    const dice = attribute ? creatureDiceFor(asNumber((creature?.attributes as Record<string, unknown> | undefined)?.[attribute])) : 1;
    const rolls = Array.from({ length: dice }, () => Math.floor(random() * 20) + 1);
    const used = Math.max(...rolls);
    const bonus = asNumber(expertise.value);
    return { dice, rolls, used, bonus, total: used + bonus };
}
