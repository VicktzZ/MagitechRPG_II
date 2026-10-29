/**
 * Dificuldade (DT) do teste de magia ao conjurar: depende do nível da magia e do estágio conjurado (tabela do dono do projeto).
 * O teste é o de Magia do jogador (`rollSpellTest`, `utils/combat/hitTest.ts`); a magia só é conjurada com sucesso se o total
 * do teste alcança a DT. O MP é gasto de qualquer jeito; só com sucesso o jogador efetua a magia (rola dano, cura, duração...).
 *
 * No nível 4 o estágio 3 é a Maestria (30) e, em elemento secundário, o "Estágio 3" comprado com pontos (também 30).
 */
const SPELL_DIFFICULTY: Readonly<Record<number, readonly [number, number, number]>> = {
    1: [ 15, 17, 20 ],
    2: [ 18, 21, 23 ],
    3: [ 22, 24, 26 ],
    4: [ 26, 28, 30 ]
};

/** DT do teste de conjurar uma magia deste nível neste estágio; `null` para nível ou estágio fora da tabela (sem DT, sem falha possível) */
export function spellCastDifficulty(level: unknown, stage: number): number | null {
    return SPELL_DIFFICULTY[Number(level)]?.[stage - 1] ?? null;
}

/** Se o total do teste alcança a DT (igual ou maior passa). Sem DT na tabela a conjuração vale */
export function spellCastSucceeded(total: number, dt: number | null): boolean {
    return dt === null || total >= dt;
}
