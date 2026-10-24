import { evolutionPointsForLevelUp } from '../evolutionPoints';

describe('evolutionPointsForLevelUp', () => {
    it('chegar a um nível múltiplo de 5 dá 3 pontos', () => {
        expect(evolutionPointsForLevelUp(4, 5)).toBe(3);
        expect(evolutionPointsForLevelUp(9, 10)).toBe(3);
        expect(evolutionPointsForLevelUp(19, 20)).toBe(3);
    });

    it('subir um nível fora dos múltiplos de 5 não dá nada', () => {
        expect(evolutionPointsForLevelUp(1, 2)).toBe(0);
        expect(evolutionPointsForLevelUp(5, 6)).toBe(0);
        expect(evolutionPointsForLevelUp(6, 9)).toBe(0);
    });

    it('saltos de vários níveis contam cada múltiplo de 5 do caminho', () => {
        expect(evolutionPointsForLevelUp(0, 5)).toBe(3);
        expect(evolutionPointsForLevelUp(4, 11)).toBe(6);
        expect(evolutionPointsForLevelUp(1, 15)).toBe(9);
        expect(evolutionPointsForLevelUp(1, 20)).toBe(12);
        expect(evolutionPointsForLevelUp(5, 10)).toBe(3);
    });

    it('o nível de partida não conta de novo', () => {
        expect(evolutionPointsForLevelUp(5, 5)).toBe(0);
        expect(evolutionPointsForLevelUp(5, 9)).toBe(0);
    });

    it('não subir (ou descer) não ganha nada, e lixo não quebra', () => {
        expect(evolutionPointsForLevelUp(10, 5)).toBe(0);
        expect(evolutionPointsForLevelUp(7, 7)).toBe(0);
        expect(evolutionPointsForLevelUp(NaN, 10)).toBe(6);
        expect(evolutionPointsForLevelUp(3, NaN)).toBe(0);
        expect(evolutionPointsForLevelUp(-5, 5)).toBe(3);
    });
});
