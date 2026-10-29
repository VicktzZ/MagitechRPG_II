import { applyVitalDelta, MAX_VITAL_DELTA, parseVitalAmount, VITAL_FIELDS, VITAL_KEYS } from '../vitals';

describe('applyVitalDelta', () => {
    it('dano tira do valor atual, e cura soma até o máximo', () => {
        expect(applyVitalDelta(38, 45, -5)).toBe(33);
        expect(applyVitalDelta(38, 45, 5)).toBe(43);
    });

    it('dano nunca leva abaixo de zero', () => {
        expect(applyVitalDelta(3, 45, -10)).toBe(0);
        expect(applyVitalDelta(0, 45, -1)).toBe(0);
    });

    it('cura para no máximo', () => {
        expect(applyVitalDelta(43, 45, 10)).toBe(45);
        expect(applyVitalDelta(45, 45, 1)).toBe(45);
    });

    it('quem está acima do máximo (pontos dados pelo mestre) não perde nada ao ser curado, mas perde ao levar dano', () => {
        expect(applyVitalDelta(50, 45, 5)).toBe(50);
        expect(applyVitalDelta(50, 45, -8)).toBe(42);
    });

    it('variação zero ou inválida não muda nada', () => {
        expect(applyVitalDelta(10, 20, 0)).toBe(10);
        expect(applyVitalDelta(10, 20, NaN)).toBe(10);
        expect(applyVitalDelta(10, 20, Infinity)).toBe(10);
    });

    it('valores faltando ou inválidos (ficha antiga, sistema customizado) contam como zero em vez de virar NaN', () => {
        expect(applyVitalDelta(undefined, undefined, 5)).toBe(0);
        expect(applyVitalDelta(undefined, 20, 5)).toBe(5);
        expect(applyVitalDelta('abc', 20, -3)).toBe(0);
        expect(applyVitalDelta('12', '20', 3)).toBe(15);
        expect(applyVitalDelta(null, null, -2)).toBe(0);
    });

    it('um valor negativo herdado não sobe a zero com dano', () => {
        expect(applyVitalDelta(-3, 20, -2)).toBe(-3);
        expect(applyVitalDelta(-3, 20, 4)).toBe(1);
    });

    it('várias variações seguidas dão o mesmo que uma soma (sem estourar o máximo nem o zero)', () => {
        const steps = [ -10, -10, 5, 30, -50, 7 ];
        const final = steps.reduce((current, delta) => applyVitalDelta(current, 40, delta), 40);
        expect(final).toBe(7);
    });
});

describe('parseVitalAmount', () => {
    it('aceita inteiros de 1 até o limite, com espaços nas pontas', () => {
        expect(parseVitalAmount('1')).toBe(1);
        expect(parseVitalAmount(' 12 ')).toBe(12);
        expect(parseVitalAmount(String(MAX_VITAL_DELTA))).toBe(MAX_VITAL_DELTA);
    });

    it('recusa vazio, zero, negativo, decimal, texto e acima do limite', () => {
        [ '', ' ', '0', '-3', '2.5', '2,5', 'abc', '1e3', String(MAX_VITAL_DELTA + 1) ].forEach(text => {
            expect(parseVitalAmount(text)).toBeNull();
        });
    });
});

describe('campos dos pontos vitais', () => {
    it('cada ponto vital aponta para o atual e o máximo de stats', () => {
        expect(VITAL_KEYS).toEqual([ 'lp', 'mp', 'ap' ]);
        expect(VITAL_FIELDS.lp).toEqual({ current: 'lp', max: 'maxLp' });
        expect(VITAL_FIELDS.mp).toEqual({ current: 'mp', max: 'maxMp' });
        expect(VITAL_FIELDS.ap).toEqual({ current: 'ap', max: 'maxAp' });
    });
});
