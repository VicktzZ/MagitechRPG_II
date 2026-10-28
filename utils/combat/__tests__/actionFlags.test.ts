import type { AppliedEffect, Combat } from '@models';
import { actionBlocks, blockReason, combatantActionBlocks, effectiveBudget, isBlocked, joinNames, NO_ACTION_BLOCKS } from '../actionFlags';

const effect = (name: string, modifiers: Array<Record<string, unknown>>, level = 1): AppliedEffect =>
    ({ id: name, effectId: name, level, remaining: 2, snapshot: { name, levels: [ { level, modifiers } ] } }) as unknown as AppliedEffect;

const paralisia = effect('Paralisia', [ { kind: 'skip_turn' }, { kind: 'no_actions' }, { kind: 'no_spells' } ]);
const silenciamento = effect('Silenciamento', [ { kind: 'no_spells' } ]);
const necrose = effect('Necrose', [ { kind: 'no_healing' } ]);
const cegueira = effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' } ]);

describe('flags de ação dos efeitos', () => {
    it('cada flag guarda o nome dos efeitos que a dão, sem repetir', () => {
        const blocks = actionBlocks([ paralisia, silenciamento, paralisia, necrose, cegueira ]);

        expect(blocks.skip_turn).toEqual([ 'Paralisia' ]);
        expect(blocks.no_actions).toEqual([ 'Paralisia' ]);
        expect(blocks.no_spells).toEqual([ 'Paralisia', 'Silenciamento' ]);
        expect(blocks.no_healing).toEqual([ 'Necrose' ]);
    });

    it('efeito sem flag de ação (vantagem, desvantagem...) não impede nada', () => {
        expect(actionBlocks([ cegueira ])).toEqual(NO_ACTION_BLOCKS);
        expect(actionBlocks(undefined)).toEqual(NO_ACTION_BLOCKS);
        expect(actionBlocks([])).toEqual(NO_ACTION_BLOCKS);
    });

    it('vale o nível em que o efeito foi aplicado', () => {
        // Congelamento: só o nível 3 pula o turno
        const congelamento = { id: 'c', effectId: 'c', level: 1, remaining: 2, snapshot: { name: 'Congelamento', levels: [
            { level: 1, modifiers: [] }, { level: 2, modifiers: [] }, { level: 3, modifiers: [ { kind: 'skip_turn', note: 'Chance de pular o turno.' } ] }
        ] } } as unknown as AppliedEffect;

        expect(actionBlocks([ congelamento ]).skip_turn).toEqual([]);
        expect(actionBlocks([ { ...congelamento, level: 3 } as AppliedEffect ]).skip_turn).toEqual([ 'Congelamento' ]);
    });

    it('o combatente só tem flags com o combate ativo', () => {
        const combat = (isActive: boolean) => ({ isActive, combatants: [ { id: 'cs-ana', effects: [ silenciamento ] } ] }) as unknown as Combat;

        expect(isBlocked(combatantActionBlocks(combat(true), 'cs-ana'), 'no_spells')).toBe(true);
        expect(isBlocked(combatantActionBlocks(combat(false), 'cs-ana'), 'no_spells')).toBe(false);
        expect(isBlocked(combatantActionBlocks(combat(true), 'outro'), 'no_spells')).toBe(false);
        expect(isBlocked(combatantActionBlocks(combat(true), undefined), 'no_spells')).toBe(false);
    });
});

describe('texto dos avisos', () => {
    it('junta os nomes: um, dois ou mais', () => {
        expect(joinNames([])).toBe('');
        expect(joinNames([ 'Paralisia' ])).toBe('Paralisia');
        expect(joinNames([ 'Paralisia', 'Silenciamento' ])).toBe('Paralisia e Silenciamento');
        expect(joinNames([ 'A', 'B', 'C' ])).toBe('A, B e C');
    });

    it('cada flag tem a própria frase, e sem flag a frase é vazia', () => {
        const blocks = actionBlocks([ paralisia, necrose ]);

        expect(blockReason(blocks, 'skip_turn', 'Aria')).toBe('Aria está com Paralisia: o turno pode ser pulado');
        expect(blockReason(blocks, 'no_actions', 'Aria')).toBe('Aria está com Paralisia e não pode agir');
        expect(blockReason(blocks, 'no_spells', 'Aria')).toBe('Aria está com Paralisia e não pode conjurar magias');
        expect(blockReason(blocks, 'no_healing', 'Aria')).toBe('Aria está com Necrose: a cura é bloqueada');
        expect(blockReason(NO_ACTION_BLOCKS, 'no_spells', 'Aria')).toBe('');
    });
});

describe('ações de fato (Paralisia)', () => {
    it('sem ações enquanto o efeito impede de agir; o orçamento guardado não muda', () => {
        const combatant = { actions: { padrao: 1, bonus: 1, movimento: 0, reacao: 1 }, effects: [ paralisia ] };

        expect(effectiveBudget(combatant)).toEqual({ padrao: 0, bonus: 0, movimento: 0, reacao: 0 });
        expect(combatant.actions).toEqual({ padrao: 1, bonus: 1, movimento: 0, reacao: 1 });
    });

    it('sem o efeito vale o orçamento guardado (e sem o campo, tudo disponível)', () => {
        expect(effectiveBudget({ actions: { padrao: 0, bonus: 1, movimento: 1, reacao: 1 }, effects: [ silenciamento ] })).toEqual({ padrao: 0, bonus: 1, movimento: 1, reacao: 1 });
        expect(effectiveBudget({ effects: [] })).toEqual({ padrao: 1, bonus: 1, movimento: 1, reacao: 1 });
        expect(effectiveBudget(undefined)).toEqual({ padrao: 1, bonus: 1, movimento: 1, reacao: 1 });
    });
});
