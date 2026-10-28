import { computeDamage } from '../damage';
import {
    DODGE_MAX_AREA_M,
    dodgeEligibility,
    dodgeTarget,
    effectiveDamageKind,
    hits,
    resistanceDT,
    resistanceExpertise,
    resistReduction,
    resolveDefense
} from '../defense';
import { visibleLines } from '../types';

describe('acerto contra o AP (AP é a CA)', () => {
    it('acerta com total igual ou maior que o AP', () => {
        expect(hits(15, 15)).toBe(true);
        expect(hits(16, 15)).toBe(true);
        expect(hits(14, 15)).toBe(false);
    });
});

describe('DT de resistência e alvo da esquiva (exemplo do dono: atacante tirou 25)', () => {
    it('resistir pede metade do total, para cima', () => {
        expect(resistanceDT(25)).toBe(13);
        expect(resistanceDT(24)).toBe(12);
        expect(resistanceDT(1)).toBe(1);
    });

    it('esquivar pede MAIS que o total do atacante', () => {
        expect(dodgeTarget(25)).toBe(26);
    });
});

describe('natureza do ataque e resistência', () => {
    it('usa a resistência correspondente', () => {
        expect(resistanceExpertise('fisico')).toBe('RES Física');
        expect(resistanceExpertise('magico')).toBe('RES Mágica');
        expect(resistanceExpertise('mental')).toBe('RES Mental');
    });

    it('magia de elemento Psíquico é ataque mental', () => {
        expect(effectiveDamageKind('magico', 'PSÍQUICO')).toBe('mental');
        expect(effectiveDamageKind('magico', 'Fogo')).toBe('magico');
        expect(effectiveDamageKind('fisico', 'Psíquico')).toBe('fisico');
    });
});

describe('quando dá para esquivar', () => {
    it('ataque comum pode ser esquivado', () => {
        expect(dodgeEligibility({ kind: 'fisico' })).toEqual({ allowed: true, reason: null });
        expect(dodgeEligibility({ kind: 'magico', areaMeters: DODGE_MAX_AREA_M }).allowed).toBe(true);
    });

    it('não vale contra ataque mental, área maior que 3m, surpresa, sem Reação ou impedida', () => {
        expect(dodgeEligibility({ kind: 'mental' }).reason).toBe('mental');
        expect(dodgeEligibility({ kind: 'magico', areaMeters: 3.5 }).reason).toBe('area');
        expect(dodgeEligibility({ kind: 'fisico', surprised: true }).reason).toBe('surpresa');
        expect(dodgeEligibility({ kind: 'fisico', hasReaction: false }).reason).toBe('sem-reacao');
        expect(dodgeEligibility({ kind: 'fisico', blocked: true }).reason).toBe('impedida');
    });
});

describe('teste de defesa', () => {
    const ok = { allowed: true, reason: null } as const;

    it('esquiva: Reflexos 26 contra 25 esquiva; 25 não; gasta a Reação nos dois casos', () => {
        expect(resolveDefense({ choice: 'dodge', attackTotal: 25, defenseTotal: 26, eligibility: ok })).toMatchObject({ status: 'dodged', needed: 26, spentReaction: true });
        expect(resolveDefense({ choice: 'dodge', attackTotal: 25, defenseTotal: 25, eligibility: ok })).toMatchObject({ status: 'dodge-failed', spentReaction: true });
    });

    it('resistência: RES 13 contra DT 13 resiste; 12 não; gasta a Reação nos dois casos', () => {
        expect(resolveDefense({ choice: 'resist', attackTotal: 25, defenseTotal: 13, eligibility: ok })).toMatchObject({ status: 'resisted', needed: 13, spentReaction: true });
        expect(resolveDefense({ choice: 'resist', attackTotal: 25, defenseTotal: 12, eligibility: ok })).toMatchObject({ status: 'resist-failed', spentReaction: true });
    });

    it('esquiva pedida mas impedida vale como sem defesa e diz o motivo', () => {
        const blocked = dodgeEligibility({ kind: 'mental' });
        expect(resolveDefense({ choice: 'dodge', attackTotal: 25, defenseTotal: 30, eligibility: blocked })).toEqual({
            status: 'none',
            needed: null,
            rolled: null,
            ignored: 'mental',
            spentReaction: false
        });
    });

    it('sem teste rolado não há defesa', () => {
        expect(resolveDefense({ choice: 'resist', attackTotal: 25, eligibility: ok }).status).toBe('none');
        expect(resolveDefense({ choice: 'none', attackTotal: 25, defenseTotal: 20, eligibility: ok }).status).toBe('none');
    });
});

describe('redução de quem resistiu: AP + metade do mod, para baixo', () => {
    it('soma o AP à metade do modificador', () => {
        expect(resistReduction(5, 4)).toBe(7);
        expect(resistReduction(5, 3)).toBe(6);
        expect(resistReduction(15, 0)).toBe(15);
    });

    it('mod negativo reduz a redução e ela nunca fica negativa', () => {
        expect(resistReduction(5, -3)).toBe(3);
        expect(resistReduction(1, -20)).toBe(0);
    });
});

describe('pipeline do dano', () => {
    const base = { kind: 'fisico' as const, targetAp: 5, resistanceMod: 4 };

    it('sem defesa o dano vem inteiro', () => {
        expect(computeDamage({ ...base, rolled: 20, defense: 'none' }).final).toBe(20);
        expect(computeDamage({ ...base, rolled: 20, defense: 'dodge-failed' }).final).toBe(20);
        expect(computeDamage({ ...base, rolled: 20, defense: 'resist-failed' }).final).toBe(20);
    });

    it('esquivou: dano anulado por completo', () => {
        expect(computeDamage({ ...base, rolled: 20, defense: 'dodged' }).final).toBe(0);
    });

    it('resistiu a ataque físico ou mágico: tira AP + metade do mod (subtração fixa)', () => {
        expect(computeDamage({ ...base, rolled: 20, defense: 'resisted' }).final).toBe(13);
        expect(computeDamage({ ...base, kind: 'magico', rolled: 20, defense: 'resisted' }).final).toBe(13);
        expect(computeDamage({ ...base, rolled: 5, defense: 'resisted' }).final).toBe(0);
    });

    it('ataque mental: resistiu = metade; falhou = completo', () => {
        expect(computeDamage({ ...base, kind: 'mental', rolled: 21, defense: 'resisted' }).final).toBe(10);
        expect(computeDamage({ ...base, kind: 'mental', rolled: 21, defense: 'resist-failed' }).final).toBe(21);
    });

    it('fraqueza dobra antes da defesa', () => {
        expect(computeDamage({ ...base, rolled: 10, weaknessMultiplier: 2, defense: 'none' }).final).toBe(20);
        expect(computeDamage({ ...base, rolled: 10, weaknessMultiplier: 2, defense: 'resisted' }).final).toBe(13);
    });

    it('bônus e penalidade de dano de quem ataca: percentual sobre o rolado mais os fixos', () => {
        expect(computeDamage({ ...base, rolled: 10, dealt: { pct: 25, flat: 2 }, defense: 'none' }).final).toBe(15);
        expect(computeDamage({ ...base, rolled: 10, dealt: { pct: -50, flat: 0 }, defense: 'none' }).final).toBe(5);
        expect(computeDamage({ ...base, rolled: 10, dealt: { pct: -200, flat: 0 }, defense: 'none' }).final).toBe(0);
    });

    it('resistência e vulnerabilidade do alvo por elemento, e a física vale para dano físico', () => {
        const fireResistance = [ { kind: 'resistance' as const, pct: -50, flat: 0, element: 'fogo' } ];
        expect(computeDamage({ ...base, rolled: 20, attackType: 'Fogo', taken: fireResistance, defense: 'none' }).final).toBe(10);
        expect(computeDamage({ ...base, rolled: 20, attackType: 'Água', taken: fireResistance, defense: 'none' }).final).toBe(20);

        const physical = [ { kind: 'resistance' as const, pct: -25, flat: 0, element: 'fisico' } ];
        expect(computeDamage({ ...base, rolled: 20, taken: physical, defense: 'none' }).final).toBe(15);
        expect(computeDamage({ ...base, kind: 'magico', rolled: 20, taken: physical, defense: 'none' }).final).toBe(20);

        const vulnerable = [ { kind: 'vulnerability' as const, pct: 50, flat: 0 } ];
        expect(computeDamage({ ...base, rolled: 20, taken: vulnerable, defense: 'none' }).final).toBe(30);
    });

    it('as linhas que revelam fraqueza e resistência do alvo são só do mestre', () => {
        const result = computeDamage({
            ...base,
            rolled: 10,
            weaknessMultiplier: 2,
            attackType: 'Fogo',
            taken: [ { kind: 'resistance', pct: -50, flat: 0, element: 'fogo' } ],
            defense: 'resisted'
        });
        const gm = visibleLines(result.steps, 'gm').map(entry => entry.label);
        const player = visibleLines(result.steps, 'player').map(entry => entry.label);

        expect(gm).toEqual(expect.arrayContaining([ 'Fraqueza do alvo', 'Resistências e vulnerabilidades do alvo' ]));
        expect(player).not.toContain('Fraqueza do alvo');
        expect(player).not.toContain('Resistências e vulnerabilidades do alvo');
        expect(player).toEqual(expect.arrayContaining([ 'Dano rolado', 'Resistência', 'Dano final' ]));
    });
});
