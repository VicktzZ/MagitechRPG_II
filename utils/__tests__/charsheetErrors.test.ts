import { describePendingPoints, labelPath, listFormErrors, sectionFor, translateMessage } from '@utils/charsheetErrors';

describe('translateMessage', () => {
    test.each([
        [ 'Required', 'campo obrigatório' ],
        [ 'Expected string, received null', 'campo obrigatório' ],
        [ 'Expected number, received nan', 'digite um número' ],
        [ 'Expected array, received object', 'valor inválido (esperado lista, recebido objeto)' ],
        [ 'Expected integer, received float', 'use um número inteiro' ],
        [ 'Number must be less than or equal to 10', 'o máximo é 10' ],
        [ 'Mensagem que o schema já escreveu', 'Mensagem que o schema já escreveu' ]
    ])('%s', (input, expected) => {
        expect(translateMessage(input)).toBe(expected);
    });
});

describe('labelPath', () => {
    const values = { inventory: { weapons: [ { name: 'Pistola' }, { name: '' } ] }, expertises: { Luta: { value: 12 } } };

    test('usa o nome do item no lugar do índice', () => {
        expect(labelPath([ 'inventory', 'weapons', 0, 'ammo' ], values)).toBe('Inventário > Armas > Pistola > Munição');
    });

    test('item sem nome vira "item N"', () => {
        expect(labelPath([ 'inventory', 'weapons', 1, 'hit' ], values)).toBe('Inventário > Armas > item 2 > Acerto');
    });

    test('perícia usa o próprio nome', () => {
        expect(labelPath([ 'expertises', 'Luta', 'value' ], values)).toBe('Perícias > Luta > Valor');
    });

    test('pontos mostram só o nome do ponto', () => {
        expect(labelPath([ 'points', 'attributes' ])).toBe('Pontos de atributo');
    });

    test('campo de raiz tem rótulo próprio', () => {
        expect(labelPath([ 'age' ])).toBe('Idade');
    });
});

describe('sectionFor', () => {
    test('liga o caminho à seção da página', () => {
        expect(sectionFor([ 'inventory', 'items', 0, 'name' ]).label).toBe('Inventário');
        expect(sectionFor([ 'points', 'expertises' ]).label).toBe('Perícias');
        expect(sectionFor([ 'points', 'attributes' ]).label).toBe('Atributos');
        expect(sectionFor([ 'session', 0, 'stats' ]).id).toBeUndefined();
    });
});

describe('listFormErrors', () => {
    test('uma linha por erro, com seção e sem repetir', () => {
        const ref = { ref: { tagName: 'INPUT' } };
        const errors = {
            name: { type: 'too_small', message: 'String must contain at least 1 character(s)', ...ref },
            inventory: { weapons: [ { ammo: { type: 'invalid_type', message: 'Required' } } ] },
            points: { attributes: { type: 'custom', message: 'Você ainda possui 5 ponto(s) de atributo para gastar' } }
        };
        const values = { inventory: { weapons: [ { name: 'Pistola' } ] } };
        const list = listFormErrors(errors, values);
        expect(list).toHaveLength(3);
        expect(list.find(item => item.path === 'inventory.weapons.0.ammo')).toMatchObject({
            label: 'Inventário > Armas > Pistola > Munição', message: 'campo obrigatório', section: 'Inventário'
        });
        expect(list.find(item => item.path === 'points.attributes')?.label).toBe('Pontos de atributo');
    });
});

describe('describePendingPoints', () => {
    test('lista só o que sobra', () => {
        expect(describePendingPoints({ attributes: 5, expertises: 1 })).toEqual([ '5 pontos de atributo', '1 ponto de perícia' ]);
        expect(describePendingPoints({ attributes: 0, expertises: -2 })).toEqual([]);
        expect(describePendingPoints(undefined)).toEqual([]);
    });
});
