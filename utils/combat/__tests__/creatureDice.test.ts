import { parseActionRoll } from '../actionRollMessage';
import {
    buildCreatureDiceText, describeCreatureDice, MAX_CREATURE_DICES, MAX_DICE_CONFIGS, MAX_DICE_MODIFIERS, rollCreatureDice, sanitizeCreatureDices, type CreatureDice
} from '../creatureDice';

const dice = (patch: Partial<CreatureDice> = {}): CreatureDice => ({
    id: 'mordida', name: 'Mordida', description: 'Dano da mordida', dices: [ { quantity: 2, faces: 6 } ], modifiers: [ { bonus: 3 } ], ...patch
});

/** Aleatório fixo: devolve a sequência dada (valores em [0, 1)) */
const sequence = (...values: number[]) => {
    let index = 0;
    return () => values[index++ % values.length]!;
};

describe('sanitizeCreatureDices', () => {
    it('lista que não é lista vira vazia, e o que não é objeto é descartado', () => {
        expect(sanitizeCreatureDices(undefined)).toEqual([]);
        expect(sanitizeCreatureDices('lixo')).toEqual([]);
        expect(sanitizeCreatureDices([ null, 3, 'x', [] ])).toEqual([]);
    });

    it('mantém um dado válido como está', () => {
        expect(sanitizeCreatureDices([ dice() ])).toEqual([ dice() ]);
    });

    it('descarta o dado sem nome ou sem nenhum grupo de dados válido', () => {
        expect(sanitizeCreatureDices([ dice({ name: '   ' }), dice({ dices: [] }), dice({ dices: [ { quantity: 0, faces: 6 } ] }) ])).toEqual([]);
    });

    it('só aceita inteiros nas faixas: 1 a 99 dados, 2 a 1000 faces; texto numérico vale', () => {
        const [ result ] = sanitizeCreatureDices([ {
            id: 'a', name: 'Rajada', dices: [ { quantity: '3', faces: '8' }, { quantity: 100, faces: 6 }, { quantity: 1, faces: 1 }, { quantity: 1.5, faces: 6 }, { quantity: 2, faces: 1000 } ]
        } ]);
        expect(result.dices).toEqual([ { quantity: 3, faces: 8 }, { quantity: 2, faces: 1000 } ]);
    });

    it('um termo é um só dos três (atributo, perícia ou bônus) e o bônus zero ou fora da faixa é descartado', () => {
        const [ result ] = sanitizeCreatureDices([ {
            id: 'a', name: 'Golpe', dices: [ { quantity: 1, faces: 10 } ],
            modifiers: [ { attribute: 'foc', bonus: 5 }, { expertise: 'Luta' }, { bonus: -2 }, { bonus: 0 }, { bonus: 5000 }, { bonus: 'x' }, {}, null ]
        } ]);
        expect(result.modifiers).toEqual([ { attribute: 'foc' }, { expertise: 'Luta' }, { bonus: -2 } ]);
    });

    it('corta os tamanhos: nome em 60, descrição em 300, até 6 grupos e 6 termos', () => {
        const [ result ] = sanitizeCreatureDices([ {
            id: 'a',
            name: 'N'.repeat(100),
            description: 'D'.repeat(500),
            dices: Array.from({ length: 10 }, () => ({ quantity: 1, faces: 6 })),
            modifiers: Array.from({ length: 10 }, (_, index) => ({ bonus: index + 1 }))
        } ]);
        expect(result.name).toHaveLength(60);
        expect(result.description).toHaveLength(300);
        expect(result.dices).toHaveLength(MAX_DICE_CONFIGS);
        expect(result.modifiers).toHaveLength(MAX_DICE_MODIFIERS);
    });

    it('guarda no máximo 20 dados e dá um id único a cada um (id repetido ou ausente é refeito)', () => {
        const many = Array.from({ length: 30 }, () => dice({ id: 'igual' }));
        const result = sanitizeCreatureDices(many);
        expect(result).toHaveLength(MAX_CREATURE_DICES);
        expect(new Set(result.map(entry => entry.id)).size).toBe(MAX_CREATURE_DICES);

        const [ semId ] = sanitizeCreatureDices([ { name: 'Sem id', dices: [ { quantity: 1, faces: 4 } ] } ]);
        expect(semId.id).toBe('dice-0');
    });
});

describe('describeCreatureDice', () => {
    it('junta os grupos de dados e os termos', () => {
        expect(describeCreatureDice(dice())).toBe('2d6 + 3');
        expect(describeCreatureDice(dice({ dices: [ { quantity: 1, faces: 10 }, { quantity: 2, faces: 4 } ], modifiers: [ { attribute: 'foc' }, { expertise: 'Luta' }, { bonus: -2 } ] }))).toBe('1d10 + 2d4 + FOC + Luta - 2');
    });
});

describe('rollCreatureDice', () => {
    it('rola cada grupo e soma o bônus fixo', () => {
        // 0.0 → 1 e 0.99 → 6 em d6
        const roll = rollCreatureDice(dice(), null, sequence(0, 0.99));
        expect(roll.segments).toEqual([
            { notation: '2d6', display: '[1, 6]', total: 7 },
            { notation: 'Bônus', display: '3', total: 3 }
        ]);
        expect(roll.total).toBe(10);
    });

    it('soma o valor do atributo e da perícia da criatura; o que ela não tem soma 0', () => {
        const creature = { attributes: { foc: 12 }, expertises: { Luta: { value: 4, defaultAttribute: 'vig' } } };
        const roll = rollCreatureDice(dice({ dices: [ { quantity: 1, faces: 4 } ], modifiers: [ { attribute: 'foc' }, { expertise: 'Luta' }, { attribute: 'car' } ] }), creature, () => 0.5);

        expect(roll.segments.map(segment => [ segment.notation, segment.total ])).toEqual([ [ '1d4', 3 ], [ 'FOC', 12 ], [ 'Luta', 4 ], [ 'CAR', 0 ] ]);
        expect(roll.total).toBe(19);
    });

    it('bônus negativo diminui o total', () => {
        expect(rollCreatureDice(dice({ dices: [ { quantity: 1, faces: 4 } ], modifiers: [ { bonus: -2 } ] }), null, () => 0.99).total).toBe(2);
    });

    it('os valores rolados ficam sempre entre 1 e as faces', () => {
        for (let attempt = 0; attempt < 200; attempt++) {
            const [ segment ] = rollCreatureDice(dice({ dices: [ { quantity: 5, faces: 20 } ], modifiers: [] }), null).segments;
            const values = segment.display.slice(1, -1).split(', ').map(Number);
            expect(values).toHaveLength(5);
            for (const value of values) {
                expect(value).toBeGreaterThanOrEqual(1);
                expect(value).toBeLessThanOrEqual(20);
            }
        }
    });
});

describe('buildCreatureDiceText', () => {
    it('é um cartão de dados "efeito" que o chat reconhece, com o nome da criatura e o total', () => {
        const roll = rollCreatureDice(dice(), null, sequence(0, 0.99));
        const parsed = parseActionRoll(buildCreatureDiceText('Goblin (2)', roll));

        expect(parsed).toMatchObject({ kind: 'efeito', player: 'Goblin (2)', title: 'Mordida', total: 10, cost: null, dt: null });
        expect(parsed!.detail).toBe('Dado da criatura · Dano da mordida');
        expect(parsed!.segments).toEqual(roll.segments);
    });

    it('sem descrição o detalhe é só "Dado da criatura"', () => {
        const parsed = parseActionRoll(buildCreatureDiceText('Lobo', rollCreatureDice(dice({ description: '' }), null)));
        expect(parsed!.detail).toBe('Dado da criatura');
    });

    it('bônus negativo volta do cartão com o sinal', () => {
        const parsed = parseActionRoll(buildCreatureDiceText('Lobo', rollCreatureDice(dice({ modifiers: [ { bonus: -2 } ] }), null, () => 0)));
        expect(parsed!.segments[1]).toEqual({ notation: 'Bônus', display: '-2', total: -2 });
    });
});
