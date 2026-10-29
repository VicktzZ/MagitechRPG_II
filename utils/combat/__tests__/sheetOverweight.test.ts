import { sheetExpertisePenalty, sheetOverweight } from '../sheetOverweight';

const sheet = (patch: Record<string, unknown> = {}, max = 10) => ({
    capacity: { max, cargo: 0 },
    inventory: {
        weapons: [ { id: 'w1', name: 'Espada', weight: 4 } ],
        armors: [ { id: 'a1', name: 'Couraça', weight: 5 } ],
        items: [ { id: 'i1', name: 'Poção', weight: 0.5, quantity: 2 } ]
    },
    ...patch
});

describe('sheetOverweight', () => {
    it('dentro da capacidade não há penalidade', () => {
        expect(sheetOverweight(sheet())).toEqual({ carried: 10, max: 10, excess: 0, penalty: 0 });
        expect(sheetOverweight(sheet({}, 25)).penalty).toBe(0);
    });

    it('cada quilo excedido tira 1, e um quilo começado conta', () => {
        // 10 kg carregados contra 9,5: 0,5 kg acima = −1
        expect(sheetOverweight(sheet({}, 9.5))).toMatchObject({ excess: 1, penalty: -1 });
        // contra 8: 2 kg acima = −2
        expect(sheetOverweight(sheet({}, 8))).toMatchObject({ excess: 2, penalty: -2 });
        // contra 7,9: 2,1 kg acima = −3
        expect(sheetOverweight(sheet({}, 7.9))).toMatchObject({ excess: 3, penalty: -3 });
    });

    it('a soma de pesos com casas decimais não gera um quilo a mais por erro de ponto flutuante', () => {
        const light = { capacity: { max: 0.3 }, inventory: { items: [ { id: 'a', name: 'A', weight: 0.1, quantity: 1 }, { id: 'b', name: 'B', weight: 0.2, quantity: 1 } ] } };
        expect(sheetOverweight(light).penalty).toBe(0);
    });

    it('item de Capacidade (mochila) não pesa, e item pesa pela quantidade', () => {
        const withBackpack = sheet({
            inventory: { items: [ { id: 'm', name: 'Mochila', kind: 'Capacidade', weight: 3, quantity: 1 }, { id: 'p', name: 'Pedra', weight: 2, quantity: 4 } ] }
        }, 7);
        expect(sheetOverweight(withBackpack)).toMatchObject({ carried: 8, excess: 1, penalty: -1 });
    });

    it('capacidade 0, ausente ou inválida é ficha sem limite', () => {
        expect(sheetOverweight(sheet({}, 0)).penalty).toBe(0);
        expect(sheetOverweight(sheet({ capacity: undefined })).penalty).toBe(0);
        expect(sheetOverweight(sheet({ capacity: { max: 'x' } })).penalty).toBe(0);
    });

    it('sistema customizado nunca sofre a penalidade', () => {
        expect(sheetOverweight(sheet({ systemId: 'sys-1' }, 1))).toEqual({ carried: 0, max: 0, excess: 0, penalty: 0 });
    });

    it('lê o inventário gravado como objeto de chaves numéricas e ignora lixo', () => {
        const legacy = sheet({ inventory: { weapons: { 0: { id: 'w1', name: 'Espada', weight: 6 } }, armors: null, items: undefined } }, 4);
        expect(sheetOverweight(legacy)).toMatchObject({ carried: 6, excess: 2, penalty: -2 });
        expect(sheetOverweight(null)).toEqual({ carried: 0, max: 0, excess: 0, penalty: 0 });
        expect(sheetOverweight('ficha')).toEqual({ carried: 0, max: 0, excess: 0, penalty: 0 });
    });
});

describe('sheetExpertisePenalty', () => {
    const heavy = sheet({}, 8);

    it('só as perícias de atributo base DES e VIG sofrem (qualquer caixa)', () => {
        expect(sheetExpertisePenalty(heavy, 'des')).toBe(-2);
        expect(sheetOverweight(heavy).penalty).toBe(-2);
        expect(sheetExpertisePenalty(heavy, 'VIG')).toBe(-2);
        expect(sheetExpertisePenalty(heavy, 'foc')).toBe(0);
        expect(sheetExpertisePenalty(heavy, 'log')).toBe(0);
        expect(sheetExpertisePenalty(heavy, undefined)).toBe(0);
    });

    it('sem sobrepeso nenhuma perícia sofre', () => {
        expect(sheetExpertisePenalty(sheet(), 'des')).toBe(0);
    });
});
