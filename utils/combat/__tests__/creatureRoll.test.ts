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

        expect(roll).toEqual({ dice: 3, rolls: [ 1, 11, 20 ], used: 20, bonus: 3, total: 23 });
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
