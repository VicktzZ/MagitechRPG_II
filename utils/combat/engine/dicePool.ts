/**
 * Vantagem e desvantagem (regras do dono): elas se ACUMULAM, uma fonte de vantagem vale +1d20 e uma de desvantagem −1d20, pelo saldo líquido.
 *
 * O teste de acerto já rola o mod do atributo + 1 d20 (regra única, `utils/d20Rule.ts`) e vale o maior; esses dados a mais são vantagens "de graça".
 * Por isso tudo cabe numa conta só: `saldo = (dados base − 1) + vantagens − desvantagens`.
 *  - saldo ≥ 0: rola 1 + saldo dados e vale o MAIOR;
 *  - saldo < 0: rola 1 + |saldo| dados e vale o MENOR.
 * Com 1 dado base, é a proposta aprovada: "1 + |n − m| dados, o maior se n > m e o menor se m > n".
 */

export interface DicePoolInput {
    /** Dados base do teste (o mod do atributo + 1); 1 num teste comum */
    baseDice?: number;
    advantages?: number;
    disadvantages?: number;
}

export interface DicePool {
    /** Quantos d20 rolar */
    count: number;
    /** Qual dado vale */
    keep: 'highest' | 'lowest';
    /** O saldo líquido que gerou o pool */
    score: number;
}

const toCount = (value: unknown): number => {
    const parsed = Math.floor(Number(value));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export function dicePool({ baseDice = 1, advantages = 0, disadvantages = 0 }: DicePoolInput = {}): DicePool {
    const base = Math.max(1, toCount(baseDice));
    const score = (base - 1) + toCount(advantages) - toCount(disadvantages);
    return { count: 1 + Math.abs(score), keep: score >= 0 ? 'highest' : 'lowest', score };
}

/** O dado que vale entre os rolados */
export function keptRoll(rolls: readonly number[], keep: DicePool['keep']): number {
    if (rolls.length === 0) return 0;
    return keep === 'highest' ? Math.max(...rolls) : Math.min(...rolls);
}

export interface PoolRoll {
    rolls: number[];
    kept: number;
    pool: DicePool;
}

/** Rola o pool (`rng` devolve [0, 1), como o `Math.random`; trocar nos testes) */
export function rollPool(pool: DicePool, rng: () => number = Math.random): PoolRoll {
    const rolls = Array.from({ length: pool.count }, () => Math.floor(rng() * 20) + 1);
    return { rolls, kept: keptRoll(rolls, pool.keep), pool };
}
