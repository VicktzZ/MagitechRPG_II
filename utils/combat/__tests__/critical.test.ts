import { applyCritMultiplier, baseCritMargin, critDamageText, critMargin, critMarginLabel, critMultiplier, DEFAULT_CRIT_MARGIN, isCriticalRoll } from '../critical';

describe('margem de crítico (utils/combat/critical.ts)', () => {
    it('sem cadastro, 0 ou lixo, a margem da arma é 20', () => {
        for (const value of [ undefined, null, '', 0, 1, NaN, 'abc' ]) expect(baseCritMargin(value)).toBe(20);
    });

    it('a arma traz a margem dela, de 2 a 20 (a "Crítico ≥ 19" da ficha)', () => {
        expect(baseCritMargin(19)).toBe(19);
        expect(baseCritMargin('17')).toBe(17);
        expect(baseCritMargin(2)).toBe(2);
        expect(baseCritMargin(25)).toBe(20);
    });

    it('cadastro à mão com texto ("19-20") vale o primeiro número', () => {
        expect(baseCritMargin('19-20')).toBe(19);
        expect(baseCritMargin(' 18 ')).toBe(18);
        expect(baseCritMargin('-')).toBe(20);
    });

    it('as reduções baixam a margem, nunca abaixo de 2, e aumentar a margem não existe', () => {
        expect(critMargin(undefined, 1)).toBe(19);
        expect(critMargin(19, 2)).toBe(17);
        expect(critMargin(3, 5)).toBe(2);
        expect(critMargin(19, -3)).toBe(19);
        expect(critMargin(20, NaN)).toBe(20);
    });

    it('o d20 natural passa da margem: ≥ margem marca o crítico; o 20 natural sempre marca', () => {
        expect(isCriticalRoll(20, 20)).toBe(true);
        expect(isCriticalRoll(19, 20)).toBe(false);
        expect(isCriticalRoll(19, 19)).toBe(true);
        expect(isCriticalRoll(18, 19)).toBe(false);
        expect(isCriticalRoll(20, 2)).toBe(true);
        expect(isCriticalRoll(1, 2)).toBe(false);
        expect(isCriticalRoll(NaN, 20)).toBe(false);
    });

    it('uma margem fora do intervalo é corrigida na hora de comparar', () => {
        expect(isCriticalRoll(1, 1)).toBe(false);
        expect(isCriticalRoll(19, 25)).toBe(false);
        expect(isCriticalRoll(20, 25)).toBe(true);
    });
});

describe('multiplicador do crítico', () => {
    it('o padrão é ×2 e a margem não interfere nele', () => {
        expect(critMultiplier()).toBe(2);
        expect(critMultiplier([])).toBe(2);
        expect(applyCritMultiplier(9)).toBe(18);
        // a margem é outra conta: uma arma com margem 17 continua ×2
        expect(critMargin(17)).toBe(17);
        expect(critMultiplier([])).toBe(2);
    });

    it('uma fonte sobe o multiplicador (o Furtivo do ladino faz ×3); o maior vence e fonte menor não conta', () => {
        expect(critMultiplier([ 3 ])).toBe(3);
        expect(critMultiplier([ 3, 4, 2 ])).toBe(4);
        expect(critMultiplier([ 1, 0, -2 ])).toBe(2);
        expect(critMultiplier([ NaN ])).toBe(2);
        expect(applyCritMultiplier(7, 3)).toBe(21);
    });
});

describe('textos', () => {
    it('a margem em palavras', () => {
        expect(critMarginLabel(DEFAULT_CRIT_MARGIN)).toBe('d20 = 20');
        expect(critMarginLabel(19)).toBe('d20 ≥ 19');
        expect(critMarginLabel(18)).toBe('d20 ≥ 18');
    });

    it('a regra do dano dita em texto', () => {
        expect(critDamageText(9, 2, 18)).toBe('Crítico: dano ×2 (9 × 2 = 18)');
        expect(critDamageText(7, 3, 21)).toBe('Crítico: dano ×3 (7 × 3 = 21)');
    });
});
