import type { Combat } from '@models';
import { findSheetCombatant, getSheetMetrics } from '../charsheetMetrics';

const sheet = { id: 'cs-ana', level: 5, ORMLevel: 2, mpLimit: 1, attributes: { foc: 5 }, overall: 52, systemId: null };

const combat = (overrides: Record<string, unknown> = {}): Combat => ({
    isActive: true,
    combatants: [
        { id: 'cs-bia', name: 'Borin', type: 'player', mpSpentThisTurn: 9 },
        { id: 'cs-ana', name: 'Aria', type: 'player', mpSpentThisTurn: 3 }
    ],
    ...overrides
}) as unknown as Combat;

describe('getSheetMetrics', () => {
    it('devolve o Overall guardado e o limite de MP por turno: ⌈(nível + foco) ÷ 2⌉ + ORM + bônus', () => {
        // ⌈(5 + 5) ÷ 2⌉ = 5, + ORM 2 + bônus 1
        expect(getSheetMetrics(sheet)).toEqual({ overall: 52, mpLimit: 8, mpSpent: null });
    });

    it('em combate ativo, mostra quanto o personagem já gastou nesta rodada', () => {
        expect(getSheetMetrics(sheet, 'Classic', combat())).toEqual({ overall: 52, mpLimit: 8, mpSpent: 3 });
    });

    it('fora do combate, ou combate encerrado, ou fora dele, não há gasto', () => {
        expect(getSheetMetrics(sheet, 'Classic', null).mpSpent).toBeNull();
        expect(getSheetMetrics(sheet, 'Classic', combat({ isActive: false })).mpSpent).toBeNull();
        expect(getSheetMetrics({ ...sheet, id: 'cs-caio' }, 'Classic', combat()).mpSpent).toBeNull();
    });

    it('combatente sem gasto registrado vale zero', () => {
        const fresh = combat({ combatants: [ { id: 'cs-ana', type: 'player' } ] });
        expect(getSheetMetrics(sheet, 'Classic', fresh).mpSpent).toBe(0);
    });

    it('onde a regra não vale (Roguelite, sistema customizado, ficha sem nível) não há limite nem gasto, mas há Overall', () => {
        expect(getSheetMetrics(sheet, 'Roguelite', combat())).toEqual({ overall: 52, mpLimit: null, mpSpent: null });
        expect(getSheetMetrics({ ...sheet, systemId: 'sistema-x' }, 'Classic', combat())).toEqual({ overall: 52, mpLimit: null, mpSpent: null });
        expect(getSheetMetrics({ ...sheet, level: 0, ORMLevel: 0, attributes: { foc: 0 } }, 'Classic').mpLimit).toBeNull();
    });

    it('Overall ausente, negativo ou lixo vira número válido', () => {
        expect(getSheetMetrics({ ...sheet, overall: undefined }).overall).toBe(0);
        expect(getSheetMetrics({ ...sheet, overall: 'abc' }).overall).toBe(0);
        expect(getSheetMetrics({ ...sheet, overall: -4 }).overall).toBe(0);
        expect(getSheetMetrics({ ...sheet, overall: '40' }).overall).toBe(40);
        expect(getSheetMetrics({ ...sheet, overall: 40.9 }).overall).toBe(40);
    });
});

describe('findSheetCombatant', () => {
    it('acha pelo id da ficha só com combate ativo', () => {
        expect(findSheetCombatant(combat(), { id: 'cs-ana' })?.name).toBe('Aria');
        expect(findSheetCombatant(combat({ isActive: false }), { id: 'cs-ana' })).toBeUndefined();
        expect(findSheetCombatant(undefined, { id: 'cs-ana' })).toBeUndefined();
        expect(findSheetCombatant(combat(), {})).toBeUndefined();
    });

    it('lista de combatentes que não é lista não quebra', () => {
        expect(findSheetCombatant(combat({ combatants: { 0: { id: 'cs-ana' } } }), { id: 'cs-ana' })).toBeUndefined();
    });
});
