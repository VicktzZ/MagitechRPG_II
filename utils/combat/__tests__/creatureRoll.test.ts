import { creatureDiceFor, rollCreatureExpertise } from '../creatureRoll';

describe('creatureDiceFor', () => {
    // Regra única de d20: o modificador da criatura (0 vale −1, 5 vale 1... até 5) + 1; modificador negativo rola 2
    it.each([ [ 0, 2 ], [ 4, 1 ], [ 5, 2 ], [ 10, 3 ], [ 15, 4 ], [ 20, 5 ], [ 25, 6 ], [ 30, 6 ], [ 99, 6 ] ])('atributo %s dá %s d20', (value, dice) => {
        expect(creatureDiceFor(value)).toBe(dice);
    });
});

describe('rollCreatureExpertise', () => {
    const creature = { attributes: { des: 15, vig: 0 }, expertises: { Reflexos: { value: 3, defaultAttribute: 'des' }, Sorte: { value: 2 }, Rigidez: { value: -1, defaultAttribute: 'vig' } } };

    it('rola os d20 do atributo (modificador + 1), vale o maior e soma a perícia', () => {
        const sequence = [ 0.0, 0.5, 0.95, 0.3 ]; // 1, 11, 20, 7
        let index = 0;
        const roll = rollCreatureExpertise(creature, 'Reflexos', () => sequence[index++]!);

        expect(roll).toEqual({ dice: 4, rolls: [ 1, 11, 20, 7 ], used: 20, bonus: 3, total: 23, keep: 'highest', notes: [] });
    });

    it('perícia sem atributo padrão rola 1 d20; atributo zero (modificador −1) rola 2 e vale o menor', () => {
        expect(rollCreatureExpertise(creature, 'Sorte', () => 0.5)).toMatchObject({ dice: 1, total: 13 });
        expect(rollCreatureExpertise(creature, 'Rigidez', () => 0.5)).toMatchObject({ dice: 2, keep: 'lowest', total: 10 });
        const sequence = [ 0.9, 0.1 ]; // 19, 3
        let index = 0;
        expect(rollCreatureExpertise(creature, 'Rigidez', () => sequence[index++]!)).toMatchObject({ rolls: [ 19, 3 ], used: 3, total: 2 });
    });

    it('sem a perícia (ou sem criatura) não rola', () => {
        expect(rollCreatureExpertise(creature, 'Inexistente')).toBeNull();
        expect(rollCreatureExpertise(null, 'Reflexos')).toBeNull();
    });
});

describe('rollCreatureExpertise com vantagem e desvantagem dos efeitos', () => {
    const creature = { attributes: { des: 15 }, expertises: { Reflexos: { value: 3, defaultAttribute: 'des' }, Sorte: { value: 2 } } };
    const sequence = (...values: number[]) => { let index = 0; return () => values[index++ % values.length]!; };

    it('desvantagem tira um d20 do saldo (4 dados viram 3) e, passando dos dados do atributo, vale o menor', () => {
        const three = rollCreatureExpertise(creature, 'Reflexos', sequence(0.0, 0.95), { advantages: 0, disadvantages: 1, notes: [ 'Cegueira: desvantagem, −1d20' ] });
        expect(three).toMatchObject({ dice: 3, keep: 'highest', notes: [ 'Cegueira: desvantagem, −1d20' ] });

        const lowest = rollCreatureExpertise(creature, 'Sorte', sequence(0.95, 0.0), { advantages: 0, disadvantages: 1, notes: [ 'Cegueira: desvantagem, −1d20' ] });
        expect(lowest).toMatchObject({ dice: 2, rolls: [ 20, 1 ], keep: 'lowest', used: 1, total: 3 });
    });

    it('vantagem rola um d20 a mais', () => {
        const roll = rollCreatureExpertise(creature, 'Sorte', sequence(0.1, 0.9), { advantages: 1, disadvantages: 0, notes: [ 'Precisão: vantagem, +1d20' ] });

        expect(roll).toMatchObject({ dice: 2, keep: 'highest', used: 19, total: 21 });
    });
});
