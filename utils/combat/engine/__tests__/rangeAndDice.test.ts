import { dicePool, keptRoll, rollPool } from '../dicePool';
import { MELEE_REACH_M, rangeKind, rangeMeters } from '../rangeMeters';
import { effectiveDisplacement } from '../terrain';

describe('alcance em metros', () => {
    it('Curto 3m, Médio 18m e Longo 30m (regras do dono), Padrão 9m e Ampliado 90m do catálogo', () => {
        expect(rangeMeters('Curto')).toBe(3);
        expect(rangeMeters('Curto (3m)')).toBe(3);
        expect(rangeMeters('Médio')).toBe(18);
        expect(rangeMeters('Médio (18m)')).toBe(18);
        expect(rangeMeters('Longo (30m)')).toBe(30);
        expect(rangeMeters('Padrão (9m)')).toBe(9);
        expect(rangeMeters('Ampliado (90m)')).toBe(90);
    });

    it('corpo a corpo e Toque valem 1,5m; Pessoal, Visão e Ilimitado não são distância', () => {
        expect(rangeMeters('Corpo-a-corpo')).toBe(MELEE_REACH_M);
        expect(rangeMeters('Toque')).toBe(1.5);
        expect(rangeMeters('Pessoal')).toBeNull();
        expect(rangeMeters('Pessoal (Área)')).toBeNull();
        expect(rangeMeters('Visão')).toBeNull();
        expect(rangeMeters('Visível')).toBeNull();
        expect(rangeMeters('Ilimitado')).toBeNull();
    });

    it('reconhece metros soltos e ignora caixa e acento', () => {
        expect(rangeMeters('4,5m')).toBe(4.5);
        expect(rangeMeters('9m')).toBe(9);
        expect(rangeMeters('MÉDIO')).toBe(18);
        expect(rangeMeters(undefined)).toBeNull();
        expect(rangeKind('Pessoal (Área)')).toBe('pessoal');
        expect(rangeKind('Visão')).toBe('visao');
        expect(rangeKind('???')).toBe('desconhecido');
    });
});

describe('terreno difícil', () => {
    it('corta o deslocamento pela metade, salvo imunidade', () => {
        expect(effectiveDisplacement(9)).toBe(9);
        expect(effectiveDisplacement(9, { difficultTerrain: true })).toBe(4.5);
        expect(effectiveDisplacement(9, { difficultTerrain: true, immune: true })).toBe(9);
        expect(effectiveDisplacement(-3, { difficultTerrain: true })).toBe(0);
    });
});

describe('vantagem e desvantagem acumulam (saldo líquido)', () => {
    it('sem nada é 1d20', () => {
        expect(dicePool()).toEqual({ count: 1, keep: 'highest', score: 0 });
    });

    it('cada vantagem soma 1d20 e vale o maior', () => {
        expect(dicePool({ advantages: 1 })).toEqual({ count: 2, keep: 'highest', score: 1 });
        expect(dicePool({ advantages: 3 })).toEqual({ count: 4, keep: 'highest', score: 3 });
    });

    it('cada desvantagem soma 1d20 e vale o menor', () => {
        expect(dicePool({ disadvantages: 1 })).toEqual({ count: 2, keep: 'lowest', score: -1 });
        expect(dicePool({ disadvantages: 2 })).toEqual({ count: 3, keep: 'lowest', score: -2 });
    });

    it('vantagens e desvantagens se compensam pelo saldo (n − m)', () => {
        expect(dicePool({ advantages: 2, disadvantages: 2 })).toEqual({ count: 1, keep: 'highest', score: 0 });
        expect(dicePool({ advantages: 3, disadvantages: 1 })).toEqual({ count: 3, keep: 'highest', score: 2 });
        expect(dicePool({ advantages: 1, disadvantages: 3 })).toEqual({ count: 3, keep: 'lowest', score: -2 });
    });

    it('os dados base do atributo contam como vantagens (um d20 por ponto do mod)', () => {
        expect(dicePool({ baseDice: 3 })).toEqual({ count: 3, keep: 'highest', score: 2 });
        // 3 dados base e 1 desvantagem: o saldo ainda é positivo, rola 2 e vale o maior
        expect(dicePool({ baseDice: 3, disadvantages: 1 })).toEqual({ count: 2, keep: 'highest', score: 1 });
        // 2 dados base e 2 desvantagens: saldo −1, rola 2 e vale o menor
        expect(dicePool({ baseDice: 2, disadvantages: 2 })).toEqual({ count: 2, keep: 'lowest', score: -1 });
        // o acerto de hoje com Furtivo: 2 dados base + 1 vantagem = 3 dados, o maior
        expect(dicePool({ baseDice: 2, advantages: 1 }).count).toBe(3);
    });

    it('entrada inválida cai nos padrões', () => {
        expect(dicePool({ baseDice: 0, advantages: -2, disadvantages: Number.NaN })).toEqual({ count: 1, keep: 'highest', score: 0 });
    });

    it('rola o pool e fica com o dado certo', () => {
        expect(keptRoll([ 4, 17, 9 ], 'highest')).toBe(17);
        expect(keptRoll([ 4, 17, 9 ], 'lowest')).toBe(4);
        expect(keptRoll([], 'highest')).toBe(0);

        const sequence = [ 0.9, 0.0, 0.5 ];
        let index = 0;
        const result = rollPool({ count: 3, keep: 'lowest', score: -2 }, () => sequence[index++]!);
        expect(result.rolls).toEqual([ 19, 1, 11 ]);
        expect(result.kept).toBe(1);
    });
});
