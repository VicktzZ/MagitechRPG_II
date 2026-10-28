import { creatureDiceFor, rollCreatureExpertise } from '../creatureRoll';

describe('creatureDiceFor', () => {
    it.each([ [ 0, 1 ], [ 4, 1 ], [ 5, 1 ], [ 10, 2 ], [ 15, 3 ], [ 20, 4 ], [ 25, 5 ], [ 30, 5 ], [ 99, 5 ] ])('atributo %s dá %s d20', (value, dice) => {
        expect(creatureDiceFor(value)).toBe(dice);
    });
});

describe('rollCreatureExpertise', () => {
    const creature = { attributes: { des: 15, vig: 0 }, expertises: { Reflexos: { value: 3, defaultAttribute: 'des' }, Sorte: { value: 2 }, Rigidez: { value: -1, defaultAttribute: 'vig' } } };

    it('rola os d20 do atributo, vale o maior e soma a perícia', () => {
        const sequence = [ 0.0, 0.5, 0.95 ]; // 1, 11, 20
        let index = 0;
        const roll = rollCreatureExpertise(creature, 'Reflexos', () => sequence[index++]!);

        expect(roll).toEqual({ dice: 3, rolls: [ 1, 11, 20 ], used: 20, bonus: 3, total: 23, keep: 'highest', notes: [] });
    });

    it('perícia sem atributo padrão rola 1 d20; atributo zero também', () => {
        expect(rollCreatureExpertise(creature, 'Sorte', () => 0.5)).toMatchObject({ dice: 1, total: 13 });
        expect(rollCreatureExpertise(creature, 'Rigidez', () => 0.5)).toMatchObject({ dice: 1, total: 10 });
    });

    it('sem a perícia (ou sem criatura) não rola', () => {
        expect(rollCreatureExpertise(creature, 'Inexistente')).toBeNull();
        expect(rollCreatureExpertise(null, 'Reflexos')).toBeNull();
    });
});

describe('rollCreatureExpertise com vantagem e desvantagem dos efeitos', () => {
    const creature = { attributes: { des: 15 }, expertises: { Reflexos: { value: 3, defaultAttribute: 'des' }, Sorte: { value: 2 } } };
    const sequence = (...values: number[]) => { let index = 0; return () => values[index++ % values.length]!; };

    it('desvantagem tira um d20 do saldo (3 dados viram 2) e, passando dos dados do atributo, vale o menor', () => {
        const two = rollCreatureExpertise(creature, 'Reflexos', sequence(0.0, 0.95), { advantages: 0, disadvantages: 1, notes: [ 'Cegueira: desvantagem, −1d20' ] });
        expect(two).toMatchObject({ dice: 2, keep: 'highest', notes: [ 'Cegueira: desvantagem, −1d20' ] });

        const lowest = rollCreatureExpertise(creature, 'Sorte', sequence(0.95, 0.0), { advantages: 0, disadvantages: 1, notes: [ 'Cegueira: desvantagem, −1d20' ] });
        expect(lowest).toMatchObject({ dice: 2, rolls: [ 20, 1 ], keep: 'lowest', used: 1, total: 3 });
    });

    it('vantagem rola um d20 a mais', () => {
        const roll = rollCreatureExpertise(creature, 'Sorte', sequence(0.1, 0.9), { advantages: 1, disadvantages: 0, notes: [ 'Precisão: vantagem, +1d20' ] });

        expect(roll).toMatchObject({ dice: 2, keep: 'highest', used: 19, total: 21 });
    });
});
