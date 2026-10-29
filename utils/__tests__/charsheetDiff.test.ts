import { collectChanges, isSameValue, toSpellIds } from '@utils/charsheetDiff';
import { healthySheet, type Sheet } from './charsheetFixture';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('collectChanges', () => {
    test('sem mudança, nada para gravar', () => {
        const base = healthySheet();
        expect(collectChanges(base, clone(base))).toEqual({});
    });

    test('grava só o campo que mudou, com caminho de campo', () => {
        const base = healthySheet();
        const current = clone(base);
        current.anotacoes = 'nova nota';
        current.attributes.vig = 9;
        current.expertises.Luta.value = 4;
        expect(collectChanges(base, current)).toEqual({
            anotacoes: 'nova nota',
            'attributes.vig': 9,
            'expertises.Luta.value': 4
        });
    });

    test('listas valem como um todo', () => {
        const base = healthySheet();
        const current = clone(base);
        current.inventory.items = [ { id: 'i1', name: 'Poção' } ];
        expect(collectChanges(base, current)).toEqual({ 'inventory.items': [ { id: 'i1', name: 'Poção' } ] });
    });

    test('o que a campanha escreve enquanto a página está aberta não é tocado', () => {
        const base = healthySheet();
        const current = clone(base);
        current.anotacoes = 'só isto';
        // o mestre deu dinheiro e uma vantagem: a foto do formulário é antiga, mas o diff só leva as anotações
        const changes = collectChanges(base, current);
        expect(Object.keys(changes)).toEqual([ 'anotacoes' ]);
    });

    test('nunca grava id, dono, data de criação, jogador nem sessão', () => {
        const base = healthySheet();
        const current = clone(base);
        current.id = 'outro';
        current.userId = 'invasor';
        current.createdAt = '2030-01-01';
        current.playerName = 'Outro nome';
        current.session = [ { campaignCode: 'X', perks: [] } ];
        expect(collectChanges(base, current)).toEqual({});
    });

    test('undefined vira null e NaN vira null', () => {
        const base = healthySheet();
        const current = clone(base);
        current.subclass = undefined;
        current.age = Number.NaN;
        expect(collectChanges(base, current)).toEqual({ subclass: null, age: null });
    });

    test('chave que não cabe num caminho de campo grava o objeto pai inteiro', () => {
        const base = healthySheet();
        const current = clone(base);
        current.expertises['Perícia.com.ponto'] = { value: 1, defaultAttribute: null };
        const changes = collectChanges(base, current);
        expect(Object.keys(changes)).toEqual([ 'expertises' ]);
        expect(changes['expertises']).toMatchObject({ 'Perícia.com.ponto': { value: 1 } });
    });

    test('valores aninhados saem sem undefined', () => {
        const base = healthySheet();
        const current = clone(base);
        current.inventory.items = [ { id: 'i1', name: 'A', description: undefined } ];
        const changes = collectChanges(base, current);
        expect(changes['inventory.items']).toEqual([ { id: 'i1', name: 'A' } ]);
        expect('description' in (changes['inventory.items'] as Sheet[])[0]!).toBe(false);
    });

    test('muita coisa mudada grava as chaves de topo inteiras (a rota aceita 200 campos)', () => {
        const base = healthySheet();
        base.customFields = {};
        const current = clone(base);
        current.customFields = Object.fromEntries(Array.from({ length: 180 }, (_, index) => [ `campo${index}`, index ]));
        const changes = collectChanges(base, current);
        expect(Object.keys(changes)).toEqual([ 'customFields' ]);
    });

    describe('magias', () => {
        test('o formulário tem objetos, o banco guarda ids', () => {
            const base = { ...healthySheet(), spells: [ { id: 's1', name: 'Fagulha' } ] };
            const current = { ...clone(base), spells: [ { id: 's1', name: 'Fagulha' }, { id: 's2', name: 'Brasa' } ] };
            expect(collectChanges(base, current)).toEqual({ spells: [ 's1', 's2' ] });
        });

        test('lista igual não grava, mesmo com objetos diferentes por dentro', () => {
            const base = { ...healthySheet(), spells: [ { id: 's1', name: 'Fagulha', stages: [ 'a' ] } ] };
            const current = { ...clone(base), spells: [ { id: 's1', name: 'Fagulha', stages: [ 'a', 'b' ] } ] };
            expect(collectChanges(base, current)).toEqual({});
        });

        test('magia que a carga não resolveu volta junto quando a lista é regravada', () => {
            const base = { ...healthySheet(), spells: [ { id: 's1', name: 'Fagulha' } ] };
            const current = { ...clone(base), spells: [] };
            const changes = collectChanges(base, current, { preserved: { spells: [ 'id-que-sumiu' ] } });
            expect(changes['spells']).toEqual([ 'id-que-sumiu' ]);
        });

        test('toSpellIds aceita ids, objetos e objeto de chaves numéricas', () => {
            expect(toSpellIds({ 0: 'a', 1: { id: 'b' }, 2: { name: 'C' } })).toEqual([ 'a', 'b', 'C' ]);
        });
    });

    describe('poderes', () => {
        test('poder não resolvido volta junto quando a lista de poderes é regravada', () => {
            const base = healthySheet();
            base.skills.powers = [ { id: 'p1', name: 'Poder 1' } ];
            const current = clone(base);
            current.skills.powers = [ { id: 'p1', name: 'Poder 1' }, { id: 'p2', name: 'Poder 2' } ];
            const changes = collectChanges(base, current, { preserved: { powers: [ 'p-antigo' ] } });
            expect(changes['skills.powers']).toEqual([ { id: 'p1', name: 'Poder 1' }, { id: 'p2', name: 'Poder 2' }, 'p-antigo' ]);
        });

        test('lista de poderes que não mudou não é regravada', () => {
            const base = healthySheet();
            const current = clone(base);
            current.anotacoes = 'x';
            expect(collectChanges(base, current, { preserved: { powers: [ 'p-antigo' ] } })).toEqual({ anotacoes: 'x' });
        });
    });
});

describe('isSameValue', () => {
    test('trata null, undefined e chave ausente como iguais', () => {
        expect(isSameValue({ a: 1, b: undefined }, { a: 1 })).toBe(true);
        expect(isSameValue(null, undefined)).toBe(true);
        expect(isSameValue('', null)).toBe(false);
    });

    test('compara listas e objetos em profundidade', () => {
        expect(isSameValue([ { a: [ 1, 2 ] } ], [ { a: [ 1, 2 ] } ])).toBe(true);
        expect(isSameValue([ 1, 2 ], [ 2, 1 ])).toBe(false);
        expect(isSameValue(Number.NaN, Number.NaN)).toBe(true);
    });
});
