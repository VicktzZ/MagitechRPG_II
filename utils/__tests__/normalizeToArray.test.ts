import { normalizeToArray } from '../normalizeToArray';

describe('normalizeToArray', () => {
    it('mantém arrays', () => {
        expect(normalizeToArray<number>([ 1, 2 ])).toEqual([ 1, 2 ]);
    });

    it('converte objeto com chaves numéricas, na ordem numérica', () => {
        expect(normalizeToArray<string>({ 10: 'c', 2: 'b', 1: 'a' })).toEqual([ 'a', 'b', 'c' ]);
    });

    it('lista os valores de um mapa por id, achatando arrays e ignorando nulos', () => {
        expect(normalizeToArray<number>({ a: 1, b: [ 2, 3 ], c: null, d: undefined })).toEqual([ 1, 2, 3 ]);
    });

    it('devolve [] para vazio, nulo e o que não é objeto', () => {
        expect(normalizeToArray(null)).toEqual([]);
        expect(normalizeToArray(undefined)).toEqual([]);
        expect(normalizeToArray('texto')).toEqual([]);
        expect(normalizeToArray(5)).toEqual([]);
    });
});
