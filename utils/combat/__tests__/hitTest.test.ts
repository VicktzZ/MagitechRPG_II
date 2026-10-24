import type { CharsheetDTO } from '@models/dtos';
import { rollHitTest, rollSpellTest } from '../hitTest';

const sheet = (patch: Record<string, unknown> = {}): CharsheetDTO => ({
    attributes: { des: 10, vig: 5, log: 5, sab: 5, foc: 15, car: 10 },
    mods: { attributes: { des: 2, vig: 1, log: 1, sab: 1, foc: 3, car: 2 } },
    expertises: { Magia: { value: 6 }, Luta: { value: 2 }, Pontaria: { value: 4 } },
    ...patch
}) as unknown as CharsheetDTO;

describe('rollSpellTest (teste de magia ao conjurar)', () => {
    afterEach(() => jest.restoreAllMocks());

    it('rola um d20 por ponto do mod de Foco, vale o maior e soma a perícia Magia', () => {
        const rolls = [ 0.5, 0.95, 0.1 ]; // d20: 11, 20, 3
        jest.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0);

        const test = rollSpellTest(sheet());

        expect(test.rolls).toEqual([ 11, 20, 3 ]);
        expect(test.bestRoll).toBe(20);
        expect(test.bonus).toBe(6);
        expect(test.bonusLabel).toBe('Magia');
        expect(test.total).toBe(26);
        expect(test.notation).toBe('3d20+6');
    });

    it('sempre o mesmo teste, seja qual for a magia: não depende de arma nem de outro atributo', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        expect(rollSpellTest(sheet()).total).toBe(rollHitTest('foc', sheet()).total);
    });

    it('mod de Foco zerado ou ausente rola um d20 só', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollSpellTest(sheet({ mods: { attributes: { foc: 0 } } })).rolls).toHaveLength(1);
        expect(rollSpellTest(sheet({ mods: undefined })).rolls).toHaveLength(1);
    });

    it('sem a perícia Magia usa o valor do atributo Foco', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const test = rollSpellTest(sheet({ expertises: {} }));

        expect(test).toMatchObject({ bonus: 15, bonusLabel: 'FOC', total: 26 });
    });

    it('bônus negativo aparece com o sinal certo na expressão', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollSpellTest(sheet({ mods: { attributes: { foc: 1 } }, expertises: { Magia: { value: -2 } } })).notation).toBe('1d20-2');
    });
});

describe('rollHitTest (o mesmo teste do botão Acerto da arma)', () => {
    afterEach(() => jest.restoreAllMocks());

    it('Destreza usa Pontaria, Vigor usa Luta', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollHitTest('des', sheet())).toMatchObject({ bonus: 4, bonusLabel: 'Pontaria' });
        expect(rollHitTest('vig', sheet())).toMatchObject({ bonus: 2, bonusLabel: 'Luta' });
    });

    it('atributo sem perícia equivalente usa o próprio valor', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollHitTest('log', sheet())).toMatchObject({ bonus: 5, bonusLabel: 'LOG' });
    });
});
