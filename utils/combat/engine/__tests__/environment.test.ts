import { ACTION_SLOTS, canSpend, executionSlot, freshBudget, spendAction } from '../actionBudget';
import { lightingEffect } from '../lighting';
import { expertiseOverweightPenalty, excessKg, isOverweight, overweightPenalty } from '../overweight';
import { isOpportunitySpell, meleeReach, opportunityCheck } from '../opportunity';
import { detectionDT, observerSees, surprise } from '../perception';

describe('luz e visão', () => {
    it('claro não muda nada', () => {
        for (const vision of [ 'normal', 'aprimorada', 'verdadeira' ] as const) {
            expect(lightingEffect('claro', vision)).toEqual({ blinded: false, partialCover: false });
        }
    });

    it('penumbra: cobertura parcial (desvantagem no acerto), salvo para visão aprimorada ou verdadeira', () => {
        expect(lightingEffect('penumbra', 'normal')).toEqual({ blinded: false, partialCover: true });
        expect(lightingEffect('penumbra', 'aprimorada')).toEqual({ blinded: false, partialCover: false });
        expect(lightingEffect('penumbra', 'verdadeira')).toEqual({ blinded: false, partialCover: false });
    });

    it('escuridão: cegueira para visão normal, cobertura parcial para aprimorada e nada para verdadeira', () => {
        expect(lightingEffect('escuridao', 'normal')).toEqual({ blinded: true, partialCover: false });
        expect(lightingEffect('escuridao', 'aprimorada')).toEqual({ blinded: false, partialCover: true });
        expect(lightingEffect('escuridao', 'verdadeira')).toEqual({ blinded: false, partialCover: false });
    });
});

describe('furtividade, invisibilidade e surpresa', () => {
    it('DT para notar: furtivo 20, invisível 30, e a visão verdadeira muda isso', () => {
        expect(detectionDT({ furtive: true })).toBe(20);
        expect(detectionDT({ invisible: true })).toBe(30);
        expect(detectionDT({ furtive: true, invisible: true })).toBe(30);
        expect(detectionDT({ invisible: true, observerVision: 'verdadeira' })).toBe(15);
        expect(detectionDT({ furtive: true, observerVision: 'verdadeira' })).toBeNull();
        expect(detectionDT({ furtive: true, observerVision: 'aprimorada' })).toBe(20);
        expect(detectionDT({})).toBeNull();
    });

    it('quem enxerga o ser: o que o notou, o que está à vista e a visão verdadeira diante do furtivo', () => {
        expect(observerSees({ furtive: true })).toBe(false);
        expect(observerSees({ furtive: true, spotted: true })).toBe(true);
        expect(observerSees({})).toBe(true);
        expect(observerSees({ furtive: true, observerVision: 'verdadeira' })).toBe(true);
        expect(observerSees({ invisible: true, observerVision: 'verdadeira' })).toBe(false);
    });

    it('surpresa: furtivo +1d20, invisível +2d20, e o alvo não esquiva', () => {
        expect(surprise({ furtive: true }, {})).toEqual({ advantages: 1, noDodge: true });
        expect(surprise({ furtive: true, invisible: true }, {})).toEqual({ advantages: 2, noDodge: true });
        expect(surprise({ invisible: true }, {})).toEqual({ advantages: 2, noDodge: true });
    });

    it('sem surpresa quando o alvo já viu o atacante', () => {
        expect(surprise({ furtive: true }, { spotted: true })).toEqual({ advantages: 0, noDodge: false });
        expect(surprise({ furtive: true }, { vision: 'verdadeira' })).toEqual({ advantages: 0, noDodge: false });
        expect(surprise({}, {})).toEqual({ advantages: 0, noDodge: false });
        expect(surprise({ invisible: true }, { vision: 'verdadeira' })).toEqual({ advantages: 2, noDodge: true });
    });
});

describe('ações por rodada', () => {
    it('uma Padrão, uma Bônus, uma de Movimento e uma Reação', () => {
        expect(freshBudget()).toEqual({ padrao: 1, bonus: 1, movimento: 1, reacao: 1 });
        expect(ACTION_SLOTS).toHaveLength(4);
    });

    it('habilidades dão ações extras', () => {
        expect(freshBudget({ padrao: 1 })).toEqual({ padrao: 2, bonus: 1, movimento: 1, reacao: 1 });
        expect(freshBudget({ padrao: -3, bonus: Number.NaN })).toEqual(freshBudget());
    });

    it('reconhece a execução do catálogo, com Livre valendo Bônus', () => {
        expect(executionSlot('Padrão')).toBe('padrao');
        expect(executionSlot('Livre')).toBe('bonus');
        expect(executionSlot('Bônus')).toBe('bonus');
        expect(executionSlot('Movimento')).toBe('movimento');
        expect(executionSlot('Reação')).toBe('reacao');
        expect(executionSlot('Completa')).toBe('completa');
        expect(executionSlot('padrão')).toBe('padrao');
        expect(executionSlot('???')).toBeNull();
    });

    it('gasta um espaço sem mexer no orçamento original', () => {
        const budget = freshBudget();
        const spent = spendAction(budget, 'Padrão');
        expect(spent.ok).toBe(true);
        expect(spent.budget).toEqual({ padrao: 0, bonus: 1, movimento: 1, reacao: 1 });
        expect(budget.padrao).toBe(1);
        expect(spendAction(spent.budget, 'Padrão')).toMatchObject({ ok: false, missing: [ 'padrao' ] });
    });

    it('Completa gasta tudo menos a Reação, e só com as três livres', () => {
        const full = spendAction(freshBudget(), 'Completa');
        expect(full.budget).toEqual({ padrao: 0, bonus: 0, movimento: 0, reacao: 1 });
        const partial = spendAction(spendAction(freshBudget(), 'Livre').budget, 'Completa');
        expect(partial).toMatchObject({ ok: false, missing: [ 'bonus' ] });
        expect(canSpend(full.budget, 'Reação')).toBe(true);
    });

    it('execução desconhecida não gasta nada', () => {
        expect(spendAction(freshBudget(), 'Bizarra')).toMatchObject({ ok: false, missing: [] });
    });
});

describe('ataque de oportunidade', () => {
    it('alcance corpo a corpo: 1,5m desarmado, o da arma branca se maior, e arma que não é branca não serve', () => {
        expect(meleeReach(null)).toBe(1.5);
        expect(meleeReach(undefined)).toBe(1.5);
        expect(meleeReach({ categ: 'Arma Branca (Leve)', range: 'Corpo-a-corpo' })).toBe(1.5);
        expect(meleeReach({ categ: 'Arma Branca (Pesada)', range: 'Curto (3m)' })).toBe(3);
        expect(meleeReach({ categ: 'Arma Branca (Leve)', range: '' })).toBe(1.5);
        expect(meleeReach({ categ: 'Arma de Fogo (Leve)', range: 'Longo (30m)' })).toBeNull();
    });

    it('magia de oportunidade: Reação com alcance Curto; Toque, Visão, Pessoal e mais longos não', () => {
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Curto' })).toBe(true);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Curto (3m)' })).toBe(true);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Toque' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Visão' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Pessoal' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Reação', range: 'Médio' })).toBe(false);
        expect(isOpportunitySpell({ execution: 'Padrão', range: 'Curto' })).toBe(false);
    });

    const reactor = { hasReaction: true, sawMover: true };

    it('sair do alcance de quem já viu e tem Reação provoca', () => {
        expect(opportunityCheck({ reactor, mover: {} })).toEqual({ provoked: true, reason: null });
    });

    it('Desengajar e saída instantânea (teleporte) anulam', () => {
        expect(opportunityCheck({ reactor, mover: { disengaged: true } }).reason).toBe('desengajou');
        expect(opportunityCheck({ reactor, mover: { instantExit: true } }).reason).toBe('saida-instantanea');
    });

    it('precisa ter visto o alvo, estar em condições e ter a Reação', () => {
        expect(opportunityCheck({ reactor: { ...reactor, sawMover: false }, mover: {} }).reason).toBe('nao-viu');
        expect(opportunityCheck({ reactor: { ...reactor, incapacitated: true }, mover: {} }).reason).toBe('incapacitado');
        expect(opportunityCheck({ reactor: { ...reactor, hasReaction: false }, mover: {} }).reason).toBe('sem-reacao');
    });
});

describe('Sobrepeso', () => {
    it('−1 para cada kg excedido, contando o kg começado', () => {
        expect(excessKg(105, 100)).toBe(5);
        expect(excessKg(100.3, 100)).toBe(1);
        expect(excessKg(100, 100)).toBe(0);
        expect(excessKg(90, 100)).toBe(0);
        expect(overweightPenalty(105, 100)).toBe(-5);
        expect(isOverweight(100.3, 100)).toBe(true);
        expect(isOverweight(100, 100)).toBe(false);
    });

    it('ficha sem limite de capacidade e valores inválidos não têm sobrepeso', () => {
        expect(excessKg(50, 0)).toBe(0);
        expect(excessKg(Number.NaN, 100)).toBe(0);
    });

    it('só as perícias de atributo base DES e VIG sofrem', () => {
        expect(expertiseOverweightPenalty('des', -5)).toBe(-5);
        expect(expertiseOverweightPenalty('vig', -5)).toBe(-5);
        expect(expertiseOverweightPenalty('VIG', -2)).toBe(-2);
        expect(expertiseOverweightPenalty('foc', -5)).toBe(0);
        expect(expertiseOverweightPenalty(null, -5)).toBe(0);
    });
});
