import type { Combatant } from '@models';
import { freshBudget } from '../engine/actionBudget';
import {
    applyBudgetDelta, applyBudgetPatch, combatantBudget, combatantPerRound, describeBudget, describePerRound, hasCustomPerRound, MAX_ACTIONS_PER_SLOT, normalizeBudget, planActionGrant,
    resetActionBudgets, stepNow, stepPerRound
} from '../actionBudgets';
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

describe('ações por rodada (o mestre dá mais de uma ação de cada tipo)', () => {
    it('sem o campo vale 1 de cada, e o que o mestre deu é lido de volta (de 0 a 9)', () => {
        expect(combatantPerRound(combatant({}))).toEqual(freshBudget());
        expect(hasCustomPerRound(combatant({}))).toBe(false);

        const boss = combatant({ actionsPerRound: { padrao: 2, bonus: 1, movimento: 3, reacao: 1 } });
        expect(combatantPerRound(boss)).toEqual({ padrao: 2, bonus: 1, movimento: 3, reacao: 1 });
        expect(hasCustomPerRound(boss)).toBe(true);
        expect(combatantPerRound(combatant({ actionsPerRound: { padrao: 40 } as never })).padrao).toBe(MAX_ACTIONS_PER_SLOT);
    });

    it('a rodada que vira devolve as ações até o número por rodada de cada um, não só 1', () => {
        const combatants = [
            combatant({ id: 'boss', type: 'creature', actions: { padrao: 0, bonus: 0, movimento: 0, reacao: 0 }, actionsPerRound: { padrao: 2, bonus: 1, movimento: 3, reacao: 1 } }),
            combatant({ id: 'comum', actions: { padrao: 0, bonus: 0, movimento: 0, reacao: 0 } })
        ];

        resetActionBudgets(combatants);

        expect(combatants[0]!.actions).toEqual({ padrao: 2, bonus: 1, movimento: 3, reacao: 1 });
        expect(combatants[1]!.actions).toEqual(freshBudget());
    });

    it('o orçamento devolvido é uma cópia: gastar não mexe no número por rodada', () => {
        const boss = combatant({ actionsPerRound: { padrao: 2, bonus: 1, movimento: 1, reacao: 1 } });
        resetActionBudgets([ boss ]);
        boss.actions!.padrao = 0;
        expect(boss.actionsPerRound!.padrao).toBe(2);
    });

    it('describePerRound lista só o que foge do padrão', () => {
        expect(describePerRound(freshBudget())).toBe('');
        expect(describePerRound({ padrao: 2, bonus: 1, movimento: 3, reacao: 1 })).toBe('Padrão 2, Movimento 3');
        expect(describePerRound({ padrao: 1, bonus: 0, movimento: 1, reacao: 1 })).toBe('Bônus 0');
    });
});

describe('applyBudgetDelta (dar ou tirar ações por variação)', () => {
    const current = { padrao: 1, bonus: 0, movimento: 2, reacao: 1 };

    it('soma ao que o combatente tem e só mexe nos espaços informados', () => {
        expect(applyBudgetDelta(current, { padrao: 2 })).toEqual({ padrao: 3, bonus: 0, movimento: 2, reacao: 1 });
        expect(applyBudgetDelta(current, { movimento: -1, bonus: 1 })).toEqual({ padrao: 1, bonus: 1, movimento: 1, reacao: 1 });
    });

    it('fica sempre entre 0 e 9', () => {
        expect(applyBudgetDelta(current, { movimento: 9 })).toEqual({ ...current, movimento: MAX_ACTIONS_PER_SLOT });
        expect(applyBudgetDelta(current, { padrao: -9 })).toEqual({ ...current, padrao: 0 });
    });

    it('um gasto feito ao mesmo tempo não é desfeito: a variação é somada ao valor de agora', () => {
        // O mestre abriu o diálogo com 2 Padrão e deu +1; enquanto isso o jogador gastou uma (ficou 1): vira 2, e não 3
        expect(applyBudgetDelta({ ...current, padrao: 1 }, { padrao: 1 })!.padrao).toBe(2);
    });

    it('não altera o orçamento recebido', () => {
        applyBudgetDelta(current, { padrao: 3 });
        expect(current.padrao).toBe(1);
    });

    it.each([
        [ 'sem corpo', undefined ],
        [ 'vazio', {} ],
        [ 'lista', [ 1 ] ],
        [ 'só zeros', { padrao: 0, bonus: 0 } ],
        [ 'chave desconhecida', { livre: 1 } ],
        [ 'texto', { padrao: '1' } ],
        [ 'fracionário', { padrao: 0.5 } ],
        [ 'acima de 9', { padrao: MAX_ACTIONS_PER_SLOT + 1 } ],
        [ 'abaixo de -9', { padrao: -MAX_ACTIONS_PER_SLOT - 1 } ]
    ])('recusa %s', (_nome, delta) => {
        expect(applyBudgetDelta(current, delta)).toBeNull();
    });
});

describe('o diálogo "Dar ações" (stepNow, stepPerRound, planActionGrant)', () => {
    const start = { now: freshBudget(), perRound: freshBudget() };

    it('subir o por rodada leva o de agora junto (a criatura com 2 Padrão por rodada já tem 2 agora)', () => {
        const next = stepPerRound(start, 'padrao', 1);
        expect(next.perRound.padrao).toBe(2);
        expect(next.now.padrao).toBe(2);
    });

    it('descer o por rodada também leva o de agora, sem passar de 0', () => {
        const down = stepPerRound({ now: { ...freshBudget(), bonus: 0 }, perRound: { ...freshBudget(), bonus: 1 } }, 'bonus', -1);
        expect(down.perRound.bonus).toBe(0);
        expect(down.now.bonus).toBe(0);
    });

    it('no teto de 9 o por rodada não sobe e o de agora fica onde estava', () => {
        const top = { now: { ...freshBudget(), movimento: 9 }, perRound: { ...freshBudget(), movimento: 9 } };
        expect(stepPerRound(top, 'movimento', 1)).toEqual(top);
    });

    it('mexer só no de agora é um extra desta rodada: o por rodada não muda', () => {
        const next = stepNow(start, 'movimento', 2);
        expect(next.now.movimento).toBe(3);
        expect(next.perRound).toEqual(freshBudget());
    });

    it('o plano traz só o que mudou; sem mudança é null', () => {
        expect(planActionGrant(start, start)).toBeNull();
        expect(planActionGrant(start, stepNow(start, 'padrao', 1))).toEqual({ delta: { padrao: 1 }, perRound: {} });
        expect(planActionGrant(start, stepPerRound(start, 'movimento', 2))).toEqual({ delta: { movimento: 2 }, perRound: { movimento: 3 } });
    });

    it('o plano usa a variação em relação ao que o diálogo abriu (tirar uma ação dá delta negativo)', () => {
        const before = { now: { padrao: 3, bonus: 1, movimento: 1, reacao: 1 }, perRound: { padrao: 3, bonus: 1, movimento: 1, reacao: 1 } };
        expect(planActionGrant(before, stepNow(before, 'padrao', -2))).toEqual({ delta: { padrao: -2 }, perRound: {} });
    });
});
