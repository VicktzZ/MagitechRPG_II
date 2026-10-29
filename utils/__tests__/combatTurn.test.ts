import { isCombatantInTurn } from '../combatTurn';

const sheet = { id: 'charsheet-1', userId: 'user-1' };

const combat = (overrides: Record<string, unknown> = {}) => ({
    isActive: true,
    phase: 'ACTION' as const,
    currentTurnIndex: 0,
    combatants: [ { id: 'charsheet-1', odacId: 'user-1' } ],
    ...overrides
});

// O combatente real tem mais campos; o teste só preenche os que a função lê
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asCombat = (value: unknown): any => value;

describe('isCombatantInTurn', () => {
    it('é a vez do jogador quando o combatente atual é a ficha dele', () => {
        expect(isCombatantInTurn(asCombat(combat()), sheet)).toBe(true);
    });

    it('também vale quando o combatente guarda só o id do usuário', () => {
        const value = combat({ combatants: [ { id: 'outra-ficha', odacId: 'user-1' } ] });
        expect(isCombatantInTurn(asCombat(value), sheet)).toBe(true);
    });

    it('não é a vez de quem não é o combatente atual', () => {
        const value = combat({ combatants: [ { id: 'x', odacId: 'y' }, { id: 'charsheet-1', odacId: 'user-1' } ] });
        expect(isCombatantInTurn(asCombat(value), sheet)).toBe(false);
    });

    it('sem combate, combate parado ou fora da fase de ação, ninguém está em turno', () => {
        expect(isCombatantInTurn(undefined, sheet)).toBe(false);
        expect(isCombatantInTurn(null, sheet)).toBe(false);
        expect(isCombatantInTurn(asCombat(combat({ isActive: false })), sheet)).toBe(false);
        expect(isCombatantInTurn(asCombat(combat({ phase: 'INITIATIVE' })), sheet)).toBe(false);
    });

    it('índice de turno fora da lista não quebra', () => {
        expect(isCombatantInTurn(asCombat(combat({ currentTurnIndex: 9 })), sheet)).toBe(false);
        expect(isCombatantInTurn(asCombat(combat({ combatants: undefined })), sheet)).toBe(false);
    });

    it('combatente sem odacId não casa com um usuário vazio', () => {
        const value = combat({ combatants: [ { id: 'outra' } ] });
        expect(isCombatantInTurn(asCombat(value), { id: 'charsheet-1', userId: '' })).toBe(false);
    });
});
