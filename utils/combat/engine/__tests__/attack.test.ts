import { buildAttackDice, resolveAttack } from '../attack';
import { collectModifiers } from '../modifiers';
import { visibleLines } from '../types';
import type { AppliedEffect } from '@models';

const effect = (modifiers: Array<Record<string, unknown>>): AppliedEffect =>
    ({ level: 1, snapshot: { levels: [ { level: 1, modifiers } ] } }) as unknown as AppliedEffect;

describe('dados do acerto', () => {
    it('acerto simples: os dados do atributo, o maior vale', () => {
        const result = buildAttackDice({ baseDice: 2 });
        expect(result.pool).toEqual({ count: 2, keep: 'highest', score: 1 });
        expect(result.lines.at(-1)).toMatchObject({ label: 'Rolagem', detail: '2d20, vale o maior' });
    });

    it('soma surpresa, fraqueza elemental e vantagens dos efeitos', () => {
        const result = buildAttackDice({
            baseDice: 2,
            attacker: collectModifiers([ effect([ { kind: 'advantage', target: 'attack' } ]) ]),
            surprise: { advantages: 1, noDodge: true },
            target: { element: 'Fogo' },
            attackType: 'Água'
        });
        expect(result.advantages).toBe(3);
        expect(result.weak).toBe(true);
        expect(result.pool).toEqual({ count: 5, keep: 'highest', score: 4 });
    });

    it('invisível ataca com +2d20', () => {
        expect(buildAttackDice({ surprise: { advantages: 2, noDodge: true } }).pool.count).toBe(3);
    });

    it('desvantagens se acumulam e o saldo decide quais dados valem', () => {
        const dark = buildAttackDice({
            baseDice: 1,
            attacker: collectModifiers([ effect([ { kind: 'disadvantage', target: 'attack' } ]) ]),
            lighting: { blinded: false, partialCover: true }
        });
        expect(dark.disadvantages).toBe(2);
        expect(dark.pool).toEqual({ count: 3, keep: 'lowest', score: -2 });

        const mixed = buildAttackDice({ baseDice: 1, surprise: { advantages: 1, noDodge: true }, lighting: { blinded: true, partialCover: false }, extraDisadvantages: 2 });
        expect(mixed.pool).toEqual({ count: 3, keep: 'lowest', score: -2 });
    });

    it('o ajuste do mestre entra no cálculo', () => {
        expect(buildAttackDice({ extraAdvantages: 2 }).pool).toEqual({ count: 3, keep: 'highest', score: 2 });
    });

    it('a linha da fraqueza do alvo é só do mestre', () => {
        const result = buildAttackDice({ target: { element: 'Fogo' }, attackType: 'Água' });
        expect(visibleLines(result.lines, 'gm').map(entry => entry.label)).toContain('Fraqueza do alvo ao ataque');
        expect(visibleLines(result.lines, 'player').map(entry => entry.label)).not.toContain('Fraqueza do alvo ao ataque');
    });
});

describe('resolução do ataque (exemplo do dono: atacante tirou 25)', () => {
    const base = { attackTotal: 25, targetAp: 15, kind: 'magico' as const, attackType: 'Fogo', damageRolled: 30, resistanceMod: 4 };

    it('errou o AP: sem dano', () => {
        const result = resolveAttack({ ...base, attackTotal: 14, defense: { choice: 'none' } });
        expect(result).toMatchObject({ hit: false, damage: 0 });
        expect(result.lines[0]).toMatchObject({ label: 'Acerto', detail: '14 contra AP 15: errou' });
    });

    it('acertou e o alvo não se defende: dano inteiro', () => {
        expect(resolveAttack({ ...base, defense: { choice: 'none' } })).toMatchObject({ hit: true, damage: 30 });
    });

    it('esquiva com 26 anula o dano e gasta a Reação; com 25 falha e leva tudo', () => {
        expect(resolveAttack({ ...base, defense: { choice: 'dodge', total: 26 } })).toMatchObject({ damage: 0, targetSpentReaction: true });
        expect(resolveAttack({ ...base, defense: { choice: 'dodge', total: 25 } })).toMatchObject({ damage: 30, targetSpentReaction: true });
    });

    it('resistência com 13 reduz AP + metade do mod: 30 − (15 + 2) = 13, e gasta a Reação', () => {
        const result = resolveAttack({ ...base, defense: { choice: 'resist', total: 13 } });
        expect(result).toMatchObject({ damage: 13, targetSpentReaction: true });
        expect(result.defense.needed).toBe(13);
        expect(resolveAttack({ ...base, defense: { choice: 'resist', total: 12 } })).toMatchObject({ damage: 30, targetSpentReaction: true });
        // Sem defesa, nada se gasta
        expect(resolveAttack({ ...base, defense: { choice: 'none' } }).targetSpentReaction).toBe(false);
    });

    it('magia Psíquica é mental: não se esquiva e a resistência dá metade', () => {
        const dodge = resolveAttack({ ...base, attackType: 'Psíquico', defense: { choice: 'dodge', total: 40 } });
        expect(dodge.kind).toBe('mental');
        expect(dodge.defense.ignored).toBe('mental');
        expect(dodge.damage).toBe(30);

        expect(resolveAttack({ ...base, attackType: 'Psíquico', defense: { choice: 'resist', total: 13 } }).damage).toBe(15);
    });

    it('o mestre troca a natureza do ataque (e se fosse mental?)', () => {
        expect(resolveAttack({ ...base, kind: 'mental', defense: { choice: 'resist', total: 13 } }).damage).toBe(15);
    });

    it('área maior que 3m e ataque de surpresa não se esquivam', () => {
        expect(resolveAttack({ ...base, areaMeters: 6, defense: { choice: 'dodge', total: 40 } }).defense.ignored).toBe('area');
        expect(resolveAttack({ ...base, surprised: true, defense: { choice: 'dodge', total: 40 } }).defense.ignored).toBe('surpresa');
    });

    it('sem Reação o alvo não esquiva', () => {
        const result = resolveAttack({ ...base, defense: { choice: 'dodge', total: 40, hasReaction: false } });
        expect(result.defense.ignored).toBe('sem-reacao');
        expect(result.targetSpentReaction).toBe(false);
    });

    it('fraqueza dobra o dano antes da resistência: Água contra Fogo', () => {
        const result = resolveAttack({
            ...base,
            attackType: 'Água',
            damageRolled: 20,
            target: { element: 'Fogo' },
            defense: { choice: 'resist', total: 13 }
        });
        // 20 × 2 = 40, resistiu: −(15 + 2) = 23
        expect(result.damage).toBe(23);
        expect(visibleLines(result.lines, 'player').map(entry => entry.label)).not.toContain('Fraqueza do alvo');
        expect(visibleLines(result.lines, 'gm').map(entry => entry.label)).toContain('Fraqueza do alvo');
    });

    it('resistências do alvo entram no fim e o dano final aparece nas linhas', () => {
        const result = resolveAttack({
            ...base,
            defense: { choice: 'none' },
            taken: [ { kind: 'resistance', pct: -50, flat: 0, element: 'fogo' } ]
        });
        expect(result.damage).toBe(15);
        expect(result.lines.at(-1)).toMatchObject({ label: 'Dano final', detail: '15' });
    });
});
