import type { AppliedEffect, Combat } from '@models';
import { collectModifiers } from '../engine/modifiers';
import {
    apWithEffects, combatantCeilings, displacementWithEffects, effectiveMaxVital, initiativeEffectBonus, statChanges, vitalCeiling
} from '../effectStats';

const effect = (name: string, modifiers: Array<Record<string, unknown>>, level = 1): AppliedEffect =>
    ({ id: name, effectId: name, level, remaining: 2, snapshot: { name, levels: [ { level, modifiers } ] } }) as unknown as AppliedEffect;

const fragilidade = effect('Fragilidade', [ { kind: 'stat_penalty', target: 'maxLp', value: '-25%' } ]);
const sobrecura = effect('Sobrecura', [ { kind: 'overflow_stat', target: 'lp', value: '+50%' } ]);
const sobremana = effect('Sobremana', [ { kind: 'overflow_stat', target: 'mp', value: '+100%' } ]);
const velocidade = effect('Velocidade', [ { kind: 'stat_bonus', target: 'displacement', value: '+25%' }, { kind: 'stat_bonus', target: 'initiative', value: 2 } ]);
const congelamento = effect('Congelamento', [ { kind: 'stat_penalty', target: 'displacement', value: '-50%' } ]);
const eletrizacao = effect('Eletrização', [ { kind: 'stat_penalty', target: 'ap', value: -2 } ]);

const set = (...effects: AppliedEffect[]) => collectModifiers(effects);

describe('máximo de LP e MP depois dos efeitos', () => {
    it('Fragilidade baixa o máximo (arredondado para baixo); sem efeito vale o gravado', () => {
        expect(effectiveMaxVital(40, set(fragilidade), 'lp')).toBe(30);
        expect(effectiveMaxVital(45, set(fragilidade), 'lp')).toBe(33);
        expect(effectiveMaxVital(40, set(), 'lp')).toBe(40);
        expect(effectiveMaxVital(40, set(fragilidade), 'mp')).toBe(40);
    });

    it('máximo ausente ou lixo vale zero, sem NaN', () => {
        expect(effectiveMaxVital(undefined, set(fragilidade), 'lp')).toBe(0);
        expect(effectiveMaxVital('abc', set(), 'lp')).toBe(0);
        expect(effectiveMaxVital('40', set(), 'lp')).toBe(40);
    });
});

describe('teto da cura (Sobrecura e Sobremana)', () => {
    it('sem efeito o teto é o máximo; a margem vale sobre o máximo de agora', () => {
        expect(vitalCeiling(40, set(), 'lp')).toBe(40);
        expect(vitalCeiling(40, set(sobrecura), 'lp')).toBe(60);
        expect(vitalCeiling(40, set(sobrecura, fragilidade), 'lp')).toBe(45);
        expect(vitalCeiling(25, set(sobrecura), 'lp')).toBe(37);
    });

    it('Sobrecura é do LP e Sobremana é do MP: um não vale para o outro', () => {
        expect(vitalCeiling(20, set(sobrecura), 'mp')).toBe(20);
        expect(vitalCeiling(20, set(sobremana), 'mp')).toBe(40);
        expect(vitalCeiling(20, set(sobremana), 'lp')).toBe(20);
    });

    it('dois efeitos de sobrecura não somam: vale a maior margem', () => {
        const maior = effect('Sobrecura II', [ { kind: 'overflow_stat', target: 'lp', value: '+100%' } ]);
        expect(vitalCeiling(40, set(sobrecura, maior), 'lp')).toBe(80);
    });
});

describe('iniciativa, deslocamento e AP', () => {
    it('o bônus de iniciativa soma entre efeitos e a penalidade fica negativa', () => {
        expect(initiativeEffectBonus(set(velocidade))).toBe(2);
        expect(initiativeEffectBonus(set(velocidade, effect('Lentidão', [ { kind: 'stat_penalty', target: 'initiative', value: 5 } ])))).toBe(-3);
        expect(initiativeEffectBonus(set())).toBe(0);
    });

    it('deslocamento e AP seguem os efeitos e nunca ficam abaixo de zero', () => {
        expect(displacementWithEffects(9, set(velocidade))).toBe(11.25);
        expect(displacementWithEffects(9, set(velocidade, congelamento))).toBe(6.75);
        expect(displacementWithEffects(9, set())).toBe(9);
        expect(apWithEffects(8, set(eletrizacao))).toBe(6);
        expect(apWithEffects(1, set(eletrizacao))).toBe(0);
        expect(apWithEffects(undefined, set())).toBe(0);
    });
});

describe('teto de um combatente em combate', () => {
    const combat = (isActive: boolean, effects: AppliedEffect[]) => ({ isActive, combatants: [ { id: 'cs-ana', effects } ] }) as unknown as Combat;

    it('os efeitos do combatente viram o teto de LP e de MP', () => {
        expect(combatantCeilings(combat(true, [ sobrecura, sobremana ]), 'cs-ana', { maxLp: 40, maxMp: 10 })).toEqual({ lp: 60, mp: 20 });
        expect(combatantCeilings(combat(true, [ fragilidade ]), 'cs-ana', { maxLp: 40, maxMp: 10 })).toEqual({ lp: 30, mp: 10 });
    });

    it('sem combate ativo, sem efeito ou sem o combatente não há teto: vale o máximo gravado', () => {
        expect(combatantCeilings(combat(false, [ sobrecura ]), 'cs-ana', { maxLp: 40 })).toEqual({});
        expect(combatantCeilings(combat(true, []), 'cs-ana', { maxLp: 40 })).toEqual({});
        expect(combatantCeilings(combat(true, [ sobrecura ]), 'cs-bia', { maxLp: 40 })).toEqual({});
        expect(combatantCeilings(null, 'cs-ana', { maxLp: 40 })).toEqual({});
    });

    it('só calcula o teto do que tem máximo', () => {
        expect(combatantCeilings(combat(true, [ sobrecura, sobremana ]), 'cs-ana', { maxLp: 40 })).toEqual({ lp: 60 });
    });
});

describe('o que a tela mostra', () => {
    it('bônus e penalidade que se anulam não aparecem', () => {
        expect(statChanges([ velocidade, congelamento, congelamento, velocidade, velocidade ], { displacement: 9 }).map(change => change.key)).toEqual([ 'displacement', 'initiative' ]);
        const mais = effect('A', [ { kind: 'stat_bonus', target: 'displacement', value: '+50%' } ]);
        const menos = effect('B', [ { kind: 'stat_penalty', target: 'displacement', value: '-50%' } ]);
        expect(statChanges([ mais, menos ], { displacement: 9 })).toEqual([]);
    });

    it('lista só as estatísticas que algum efeito mudou, com a origem', () => {
        const changes = statChanges([ velocidade, eletrizacao, fragilidade, sobrecura ], { displacement: 9, ap: 8, maxLp: 40, maxMp: 10 });

        expect(changes.map(change => change.key)).toEqual([ 'displacement', 'initiative', 'ap', 'maxLp', 'overflowLp' ]);
        expect(changes.find(change => change.key === 'displacement')).toMatchObject({ text: '9 m → 11,25 m', direction: 'up', sources: [ 'Velocidade' ] });
        expect(changes.find(change => change.key === 'initiative')).toMatchObject({ text: '+2', direction: 'up', sources: [ 'Velocidade' ] });
        expect(changes.find(change => change.key === 'ap')).toMatchObject({ text: '8 → 6', direction: 'down', sources: [ 'Eletrização' ] });
        expect(changes.find(change => change.key === 'maxLp')).toMatchObject({ text: '40 → 30', direction: 'down', sources: [ 'Fragilidade' ] });
        expect(changes.find(change => change.key === 'overflowLp')).toMatchObject({ text: 'até 45 (+50%)', direction: 'up', sources: [ 'Sobrecura' ] });
    });

    it('vários efeitos na mesma estatística entram todos na origem, sem repetir', () => {
        const [ change ] = statChanges([ velocidade, congelamento, congelamento ], { displacement: 9 });
        expect(change?.sources).toEqual([ 'Velocidade', 'Congelamento' ]);
        expect(change?.text).toBe('9 m → 2,25 m');
    });

    it('sem o valor de origem o texto diz só o que o efeito dá', () => {
        const changes = statChanges([ congelamento, eletrizacao, fragilidade ]);

        expect(changes.map(change => [ change.key, change.text, change.direction ])).toEqual([
            [ 'displacement', '−50%', 'down' ],
            [ 'ap', '−2', 'down' ],
            [ 'maxLp', '−25%', 'down' ]
        ]);
    });

    it('efeito sem estatística (vantagem, flag) e lista vazia não mostram nada', () => {
        expect(statChanges([ effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' } ]) ])).toEqual([]);
        expect(statChanges([])).toEqual([]);
        expect(statChanges(undefined)).toEqual([]);
    });

    it('vale o nível em que o efeito foi aplicado', () => {
        const levels = { id: 'v', effectId: 'v', level: 1, remaining: 2, snapshot: { name: 'Velocidade', levels: [
            { level: 1, modifiers: [ { kind: 'stat_bonus', target: 'initiative', value: 2 } ] },
            { level: 3, modifiers: [ { kind: 'stat_bonus', target: 'initiative', value: 6 } ] }
        ] } } as unknown as AppliedEffect;
        expect(statChanges([ levels ])[0]?.text).toBe('+2');
        expect(statChanges([ { ...levels, level: 2 } as AppliedEffect ])[0]?.text).toBe('+6');
    });
});

describe('terreno difícil no deslocamento (Fase 7)', () => {
    const botas = effect('Botas do Pântano', [ { kind: 'flag', target: 'terrain_immunity' } ]);

    it('sem efeito nenhum o terreno difícil já mostra o deslocamento pela metade', () => {
        const [ change ] = statChanges([], { displacement: 9 }, { difficultTerrain: true });
        expect(change).toMatchObject({ key: 'displacement', text: '9 m → 4,5 m', direction: 'down', sources: [ 'Terreno difícil' ] });
    });

    it('soma aos efeitos: Velocidade e depois a metade, com as duas origens', () => {
        const [ change ] = statChanges([ velocidade ], { displacement: 9 }, { difficultTerrain: true });
        expect(change).toMatchObject({ key: 'displacement', text: '9 m → 5,63 m', direction: 'down', sources: [ 'Velocidade', 'Terreno difícil' ] });
        // fora do terreno, o mesmo efeito dá o ganho
        expect(statChanges([ velocidade ], { displacement: 9 })[0]).toMatchObject({ text: '9 m → 11,25 m', direction: 'up' });
    });

    it('imunidade ou terreno normal não cortam', () => {
        expect(statChanges([ botas ], { displacement: 9 }, { difficultTerrain: true })).toEqual([]);
        expect(statChanges([], { displacement: 9 }, { difficultTerrain: false })).toEqual([]);
        expect(statChanges([], { displacement: 9 })).toEqual([]);
    });

    it('sem o deslocamento de origem o texto diz só "pela metade"', () => {
        expect(statChanges([], {}, { difficultTerrain: true })[0]).toMatchObject({ key: 'displacement', text: 'pela metade', direction: 'down' });
    });
});
