import type { Combatant } from '@models';
import { freshBudget } from '../engine/actionBudget';
import { applyBudgetPatch, combatantBudget, describeBudget, MAX_ACTIONS_PER_SLOT, normalizeBudget, resetActionBudgets } from '../actionBudgets';
import { resetRoundWindows } from '../roundWindow';

const combatant = (patch: Partial<Combatant>): Combatant => ({ id: 'x', name: 'X', type: 'player', ...patch }) as Combatant;

describe('normalizeBudget / combatantBudget', () => {
    it('combatente sem o campo (combate começado antes, ou recém-chegado) tem tudo disponível', () => {
        expect(combatantBudget(combatant({}))).toEqual(freshBudget());
        expect(combatantBudget(null)).toEqual(freshBudget());
        expect(normalizeBudget(undefined)).toEqual(freshBudget());
        expect(normalizeBudget('lixo')).toEqual(freshBudget());
    });

    it('lê o que foi gravado e completa o que falta com o padrão', () => {
        expect(normalizeBudget({ padrao: 0, reacao: 0 })).toEqual({ padrao: 0, bonus: 1, movimento: 1, reacao: 0 });
    });

    it('valor inválido cai no padrão só daquele espaço; fora da faixa é cortado em 0 a 9', () => {
        expect(normalizeBudget({ padrao: 'abc', bonus: -3, movimento: 99, reacao: 2.7 })).toEqual({
            padrao: 1,
            bonus: 0,
            movimento: MAX_ACTIONS_PER_SLOT,
            reacao: 2
        });
    });
});

describe('resetActionBudgets (a rodada virou)', () => {
    it('devolve todas as ações de todos, inclusive a Reação e as de quem nunca tinha o campo', () => {
        const combatants = [
            combatant({ id: 'a', actions: { padrao: 0, bonus: 0, movimento: 0, reacao: 0 } }),
            combatant({ id: 'b', actions: { padrao: 0, bonus: 1, movimento: 0, reacao: 0 } }),
            combatant({ id: 'c', type: 'creature' })
        ];

        resetActionBudgets(combatants);

        for (const entry of combatants) expect(entry.actions).toEqual(freshBudget());
    });

    it('não falha sem combatentes', () => {
        expect(() => { resetActionBudgets(undefined); }).not.toThrow();
    });

    it('cada combatente recebe o seu orçamento (não compartilham o mesmo objeto)', () => {
        const combatants = [ combatant({ id: 'a' }), combatant({ id: 'b' }) ];
        resetActionBudgets(combatants);
        combatants[0]!.actions!.padrao = 0;
        expect(combatants[1]!.actions!.padrao).toBe(1);
    });
});

describe('resetRoundWindows', () => {
    it('zera o limite de MP e devolve as ações na mesma virada', () => {
        const combatants = [ combatant({ id: 'a', mpSpentThisTurn: 6, mpLimitOverride: true, actions: { padrao: 0, bonus: 0, movimento: 0, reacao: 0 } }) ];

        resetRoundWindows(combatants);

        expect(combatants[0]).toMatchObject({ mpSpentThisTurn: 0, mpLimitOverride: false, actions: freshBudget() });
    });
});

describe('applyBudgetPatch (ajuste do mestre)', () => {
    const current = freshBudget();

    it('muda só os espaços informados', () => {
        expect(applyBudgetPatch(current, { reacao: 0 })).toEqual({ padrao: 1, bonus: 1, movimento: 1, reacao: 0 });
        expect(applyBudgetPatch(current, { padrao: 2, movimento: 0 })).toEqual({ padrao: 2, bonus: 1, movimento: 0, reacao: 1 });
    });

    it('não altera o orçamento recebido', () => {
        applyBudgetPatch(current, { padrao: 0 });
        expect(current).toEqual(freshBudget());
    });

    it.each([
        [ 'sem corpo', undefined ],
        [ 'vazio', {} ],
        [ 'lista', [ 1 ] ],
        [ 'chave desconhecida', { livre: 0 } ],
        [ 'texto', { padrao: '0' } ],
        [ 'fracionário', { padrao: 0.5 } ],
        [ 'negativo', { padrao: -1 } ],
        [ 'acima do máximo', { padrao: MAX_ACTIONS_PER_SLOT + 1 } ]
    ])('recusa %s', (_nome, patch) => {
        expect(applyBudgetPatch(current, patch)).toBeNull();
    });
});

describe('describeBudget', () => {
    it('lista os quatro espaços por extenso', () => {
        expect(describeBudget({ padrao: 1, bonus: 0, movimento: 1, reacao: 2 })).toBe('Padrão 1, Bônus 0, Movimento 1, Reação 2');
    });
});
