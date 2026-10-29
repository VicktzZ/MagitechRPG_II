import { computeCargo, itemCargoWeight, removeInventoryEntry } from '../cargo';

describe('computeCargo', () => {
    it('soma peso × quantidade de itens, armas e armaduras', () => {
        const inventory = {
            items: [ { name: 'Ração', weight: 0.5, quantity: 4 }, { name: 'Corda', weight: 2, quantity: 1 } ],
            weapons: [ { name: 'Pistola', weight: 1.5, quantity: 1 } ],
            armors: [ { name: 'Colete', weight: 6, quantity: 1 } ]
        };
        expect(computeCargo(inventory)).toBe(11.5);
    });

    it('arredonda a 2 casas para não mostrar erro de ponto flutuante', () => {
        // 0.1 + 0.2 = 0.30000000000000004 e 0.3 × 3 = 0.8999999999999999 em ponto flutuante puro
        expect(computeCargo({ items: [ { weight: 0.1, quantity: 1 }, { weight: 0.2, quantity: 1 } ] })).toBe(0.3);
        expect(computeCargo({ items: [ { weight: 0.3, quantity: 3 } ] })).toBe(0.9);
        expect(computeCargo({ items: Array.from({ length: 10 }, () => ({ weight: 0.1, quantity: 1 })) })).toBe(1);
        expect(computeCargo({ items: [ { weight: 0.1, quantity: 3 }, { weight: 0.7, quantity: 1 } ] })).toBe(1);
    });

    it('mantém pesos com duas casas (0,25 kg)', () => {
        expect(computeCargo({ items: [ { weight: 0.25, quantity: 3 } ] })).toBe(0.75);
    });

    it('quantidade ausente, zero, negativa ou inválida conta como 1', () => {
        expect(computeCargo({ items: [ { weight: 2 } ] })).toBe(2);
        expect(computeCargo({ items: [ { weight: 2, quantity: 0 } ] })).toBe(2);
        expect(computeCargo({ items: [ { weight: 2, quantity: -3 } ] })).toBe(2);
        expect(computeCargo({ items: [ { weight: 2, quantity: 'muitos' } ] })).toBe(2);
    });

    it('peso ausente, negativo ou inválido não pesa', () => {
        expect(computeCargo({ items: [ { name: 'Sem peso' }, { weight: -5, quantity: 2 }, { weight: 'pesado' } ] })).toBe(0);
    });

    it('aceita pesos e quantidades gravados como texto numérico', () => {
        expect(computeCargo({ items: [ { weight: '1.5', quantity: '2' } ] })).toBe(3);
    });

    it('itens kind "Capacidade" não ocupam carga (na campanha eles aumentam capacity.max)', () => {
        const inventory = {
            items: [
                { name: 'Mochila reforçada', kind: 'Capacidade', weight: 5, quantity: 1 },
                { name: 'Ração', kind: 'Consumível', weight: 1, quantity: 2 }
            ]
        };
        expect(computeCargo(inventory)).toBe(2);
    });

    it('só itens são tratados como Capacidade: o kind de armas e armaduras é outra coisa', () => {
        // Armas e armaduras têm `kind` próprio (Padrão, Arremessável, Leve...) e sempre pesam
        expect(computeCargo({ weapons: [ { kind: 'Capacidade', weight: 3, quantity: 1 } ] })).toBe(3);
        expect(computeCargo({ armors: [ { kind: 'Capacidade', weight: 4, quantity: 1 } ] })).toBe(4);
    });

    it('aceita listas como objeto de chaves numéricas (formato antigo do Firestore)', () => {
        const inventory = {
            items: { 0: { weight: 1, quantity: 1 }, 1: { weight: 2, quantity: 2 } }
        };
        expect(computeCargo(inventory)).toBe(5);
    });

    it('ignora entradas que não são objetos (ids soltos, nulos)', () => {
        expect(computeCargo({ items: [ 'abc123', null, undefined, 7, { weight: 1, quantity: 1 } ] })).toBe(1);
    });

    it('inventário vazio, nulo ou indefinido dá 0', () => {
        expect(computeCargo({})).toBe(0);
        expect(computeCargo(null)).toBe(0);
        expect(computeCargo(undefined)).toBe(0);
        expect(computeCargo({ items: [], weapons: [], armors: [] })).toBe(0);
    });
});

describe('itemCargoWeight', () => {
    it('devolve peso × quantidade da entrada', () => {
        expect(itemCargoWeight({ weight: 1.5, quantity: 3 })).toBe(4.5);
    });

    it('Capacidade só zera quando é um item', () => {
        const entry = { kind: 'Capacidade', weight: 5, quantity: 1 };
        expect(itemCargoWeight(entry, { isItem: true })).toBe(0);
        expect(itemCargoWeight(entry)).toBe(5);
    });

    it('entrada que não é objeto pesa 0', () => {
        expect(itemCargoWeight('x')).toBe(0);
        expect(itemCargoWeight(null)).toBe(0);
    });
});

describe('removeInventoryEntry', () => {
    const potion = (id: string | undefined) => ({ id, name: 'Poção', weight: 0.5, quantity: 1 });

    it('remove só o item de mesmo id, não todos de mesmo nome', () => {
        const list = [ potion('a'), potion('b'), { id: 'c', name: 'Corda' } ];
        const result = removeInventoryEntry<{ id: string }>(list, { id: 'b', name: 'Poção' });
        expect(result.map(entry => entry.id)).toEqual([ 'a', 'c' ]);
    });

    it('sem id, remove a posição clicada quando o nome confere (dois itens de mesmo nome)', () => {
        const list = [ potion(undefined), potion(undefined), { name: 'Corda' } ];
        const result = removeInventoryEntry(list, { index: 1, name: 'Poção' });
        expect(result).toHaveLength(2);
        expect(result).toEqual([ list[0], list[2] ]);
    });

    it('sem id e sem posição, remove apenas a primeira com o mesmo nome', () => {
        const list = [ potion(undefined), potion(undefined) ];
        expect(removeInventoryEntry(list, { name: 'Poção' })).toEqual([ list[1] ]);
    });

    it('com ids repetidos usa a posição clicada para desempatar', () => {
        const list = [ potion('x'), potion('x'), potion('x') ];
        const result = removeInventoryEntry(list, { id: 'x', index: 2, name: 'Poção' });
        expect(result).toEqual([ list[0], list[1] ]);
    });

    it('posição desatualizada cai no id e depois no nome', () => {
        const list = [ potion('a'), potion('b') ];
        expect(removeInventoryEntry<{ id: string }>(list, { id: 'a', index: 1, name: 'Poção' }).map(entry => entry.id)).toEqual([ 'b' ]);
        expect(removeInventoryEntry(list, { index: 9, name: 'Poção' })).toEqual([ list[1] ]);
    });

    it('posição só (sem id nem nome) remove aquela posição', () => {
        const list = [ { n: 1 }, { n: 2 }, { n: 3 } ];
        expect(removeInventoryEntry(list, { index: 1 })).toEqual([ list[0], list[2] ]);
    });

    it('não altera a lista original e devolve cópia quando nada confere', () => {
        const list = [ potion('a') ];
        const untouched = removeInventoryEntry(list, { id: 'zzz', name: 'Outro' });
        expect(untouched).toEqual(list);
        expect(untouched).not.toBe(list);
        removeInventoryEntry(list, { id: 'a' });
        expect(list).toHaveLength(1);
    });

    it('aceita lista no formato objeto de chaves numéricas e devolve array', () => {
        const result = removeInventoryEntry({ 0: potion('a'), 1: potion('b') }, { id: 'a' });
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([ potion('b') ]);
    });

    it('lista vazia ou nula devolve []', () => {
        expect(removeInventoryEntry(undefined, { id: 'a' })).toEqual([]);
        expect(removeInventoryEntry(null, { name: 'x' })).toEqual([]);
    });
});

describe('excluir um de dois itens de mesmo nome recalcula a carga', () => {
    it('a carga cai só pelo item excluído', () => {
        const items = [
            { name: 'Poção', weight: 0.5, quantity: 2 },
            { name: 'Poção', weight: 0.5, quantity: 2 },
            { name: 'Corda', weight: 3, quantity: 1 }
        ];
        const before = computeCargo({ items });
        const after = computeCargo({ items: removeInventoryEntry(items, { index: 0, name: 'Poção' }) });
        expect(before).toBe(5);
        expect(after).toBe(4);
    });
});
