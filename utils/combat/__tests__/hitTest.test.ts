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

    it('regra única de d20: mod de Foco + 1 dados, vale o maior e soma a perícia Magia', () => {
        const rolls = [ 0.5, 0.95, 0.1, 0.3 ]; // d20: 11, 20, 3, 7
        jest.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0);

        const test = rollSpellTest(sheet());

        expect(test.rolls).toEqual([ 11, 20, 3, 7 ]);
        expect(test.bestRoll).toBe(20);
        expect(test.bonus).toBe(6);
        expect(test.bonusLabel).toBe('Magia');
        expect(test.total).toBe(26);
        expect(test.notation).toBe('4d20+6');
    });

    it('mod de Foco negativo rola 2 d20 e vale o menor (a mesma regra do botão da perícia na ficha)', () => {
        const rolls = [ 0.95, 0.1 ]; // d20: 20, 3
        jest.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0);

        const test = rollSpellTest(sheet({ mods: { attributes: { foc: -1 } } }));

        expect(test.rolls).toEqual([ 20, 3 ]);
        expect(test.keep).toBe('lowest');
        expect(test.bestRoll).toBe(3);
        expect(test.total).toBe(9);
        expect(test.notation).toBe('2d20+6');
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

        expect(rollSpellTest(sheet({ mods: { attributes: { foc: 0 } }, expertises: { Magia: { value: -2 } } })).notation).toBe('1d20-2');
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

describe('teste de acerto com Sobrepeso', () => {
    afterEach(() => jest.restoreAllMocks());
    // 10 kg carregados contra 8: 2 kg acima = −2 em Luta (VIG) e em Pontaria (DES); Magia (FOC) não sofre
    const heavy = (patch: Record<string, unknown> = {}) => sheet({ ...{ capacity: { max: 8 }, inventory: { weapons: [ { id: 'w1', name: 'Marreta', weight: 10 } ] } }, ...patch });

    it('tira do bônus de Luta e de Pontaria e o chat diz de onde vem o desconto', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollHitTest('vig', heavy())).toMatchObject({ bonus: 0, bonusLabel: 'Luta, sobrepeso -2' });
        expect(rollHitTest('des', heavy())).toMatchObject({ bonus: 2, bonusLabel: 'Pontaria, sobrepeso -2' });
    });

    it('o teste de magia (Foco) não sofre', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollSpellTest(heavy())).toMatchObject({ bonus: 6, bonusLabel: 'Magia' });
    });

    it('a perícia sem o atributo gravado vale pelo atributo do teste (Luta = VIG)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        // o `sheet()` base grava as perícias sem defaultAttribute
        expect(rollHitTest('vig', heavy()).bonus).toBe(0);
    });

    it('sem excesso de peso o teste é o de sempre', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        expect(rollHitTest('vig', heavy({ capacity: { max: 40 } }))).toMatchObject({ bonus: 2, bonusLabel: 'Luta' });
    });
});

describe('vantagem e desvantagem dos efeitos no teste de acerto', () => {
    afterEach(() => jest.restoreAllMocks());

    // mod 0 em VIG: 1 d20 de base, para a conta do saldo aparecer inteira
    const neutral = (): CharsheetDTO => sheet({ mods: { attributes: { vig: 0, des: 0, foc: 0 } } });

    it('uma desvantagem rola um d20 a mais e vale o menor (o mod 0, de 1 dado, vira 2 dados, o menor)', () => {
        const rolls = [ 0.95, 0.1 ]; // d20: 20, 3
        jest.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0);

        const hit = rollHitTest('vig', neutral(), { lessDice: 1, notes: [ 'Cegueira: desvantagem, −1d20' ] });

        expect(hit.rolls).toEqual([ 20, 3 ]);
        expect(hit.keep).toBe('lowest');
        expect(hit.bestRoll).toBe(3);
        expect(hit.total).toBe(5);
        expect(hit.notation).toBe('2d20+2');
        expect(hit.lessDice).toBe(1);
        expect(hit.notes).toEqual([ 'Cegueira: desvantagem, −1d20' ]);
    });

    it('vantagem e desvantagem se cancelam pelo saldo: 1 dado só', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const hit = rollHitTest('vig', neutral(), { extraDice: 1, lessDice: 1 });

        expect(hit.rolls).toHaveLength(1);
        expect(hit.keep).toBe('highest');
    });

    it('os d20 do mod de Foco já são vantagens: com 4 dados, uma desvantagem rola 3 e vale o maior', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const test = rollSpellTest(sheet(), { lessDice: 1 });

        expect(test.rolls).toHaveLength(3);
        expect(test.keep).toBe('highest');
    });

    it('o teste de magia aceita as vantagens e desvantagens dos efeitos', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const test = rollSpellTest(neutral(), { lessDice: 2, notes: [ 'Cegueira: desvantagem, −2d20' ] });

        expect(test.rolls).toHaveLength(3);
        expect(test.keep).toBe('lowest');
        expect(test.notes).toEqual([ 'Cegueira: desvantagem, −2d20' ]);
    });

    it('sem efeitos o teste é o de sempre (maior, sem notas)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const hit = rollHitTest('des', sheet());

        expect(hit).toMatchObject({ keep: 'highest', lessDice: 0, extraDice: 0, notes: [] });
    });
});

describe('acerto crítico no teste (rollHitTest)', () => {
    afterEach(() => jest.restoreAllMocks());

    it('o 20 natural marca o crítico sozinho, sem margem informada', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.99); // d20: 20
        const hit = rollHitTest('des', sheet());
        expect(hit.bestRoll).toBe(20);
        expect(hit.critical).toBe(true);
        expect(hit.critMargin).toBe(20);
    });

    it('19 natural só marca com a margem em 19', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // d20: 19
        expect(rollHitTest('des', sheet()).critical).toBe(false);
        expect(rollHitTest('des', sheet(), { critMargin: 19 }).critical).toBe(true);
        expect(rollHitTest('des', sheet(), { critMargin: 19 }).critMargin).toBe(19);
    });

    it('conta o d20 que valeu: o 20 que a desvantagem descartou não marca crítico', () => {
        const rolls = [ 0.99, 0.1 ]; // 20 e 3; com uma desvantagem valem 2d20 e o menor (mod 1 + 1 desvantagem rolam 2)
        jest.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0);
        const hit = rollHitTest('vig', sheet({ mods: { attributes: { vig: 0 } } }), { lessDice: 1 });
        expect(hit.keep).toBe('lowest');
        expect(hit.bestRoll).toBe(3);
        expect(hit.critical).toBe(false);
    });

    it('com vantagem, o 20 que valeu marca o crítico', () => {
        const rolls = [ 0.1, 0.99, 0.5 ];
        jest.spyOn(Math, 'random').mockImplementation(() => rolls.shift() ?? 0);
        const hit = rollHitTest('vig', sheet(), { extraDice: 2 });
        expect(hit.bestRoll).toBe(20);
        expect(hit.critical).toBe(true);
    });

    it('o teste de magia também traz o crítico, com a margem da magia', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // 19
        expect(rollSpellTest(sheet(), { critMargin: 19 }).critical).toBe(true);
        expect(rollSpellTest(sheet()).critical).toBe(false);
    });
});
