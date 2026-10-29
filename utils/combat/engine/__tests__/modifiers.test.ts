import type { AppliedEffect } from '@models';
import { advantagesFor, collectModifiers, disadvantagesFor, hasFlag, modifiedStat, parseAmount } from '../modifiers';
import { visionLevel } from '../lighting';

function effect(modifiers: Array<Record<string, unknown>>, level = 1): AppliedEffect {
    return { id: 'a', effectId: 'e', level, remaining: 2, snapshot: { levels: [ { level, modifiers } ] } } as unknown as AppliedEffect;
}

describe('valores do catálogo', () => {
    it('lê percentual, fixo e número; o sinal escrito não importa (a magnitude)', () => {
        expect(parseAmount('-25%')).toEqual({ pct: 25, flat: 0 });
        expect(parseAmount('+100%')).toEqual({ pct: 100, flat: 0 });
        expect(parseAmount('+5')).toEqual({ pct: 0, flat: 5 });
        expect(parseAmount('-1')).toEqual({ pct: 0, flat: 1 });
        expect(parseAmount(2)).toEqual({ pct: 0, flat: 2 });
        expect(parseAmount('2,5')).toEqual({ pct: 0, flat: 2.5 });
        expect(parseAmount('partial')).toBeNull();
        expect(parseAmount(undefined)).toBeNull();
    });
});

describe('modificadores dos efeitos aplicados', () => {
    it('conta vantagens e desvantagens por teste', () => {
        const set = collectModifiers([
            effect([ { kind: 'advantage', target: 'attack' }, { kind: 'advantage', target: 'stealth' } ]),
            effect([ { kind: 'advantage', target: 'attack' }, { kind: 'disadvantage', target: 'dodge' } ])
        ]);
        expect(advantagesFor(set, 'attack')).toBe(2);
        expect(advantagesFor(set, 'stealth')).toBe(1);
        expect(disadvantagesFor(set, 'dodge')).toBe(1);
        expect(disadvantagesFor(set, 'attack')).toBe(0);
    });

    it('o sinal do tipo manda: resistência reduz, vulnerabilidade aumenta, penalidade de dano reduz', () => {
        const set = collectModifiers([
            effect([
                { kind: 'damage_resistance', value: '-25%', element: 'fogo' },
                { kind: 'damage_vulnerability', value: '+50%' },
                { kind: 'damage_dealt_bonus', value: '+25%' },
                { kind: 'damage_dealt_penalty', value: '-50%' }
            ])
        ]);
        expect(set.taken).toEqual([
            { kind: 'resistance', pct: -25, flat: 0, element: 'fogo' },
            { kind: 'vulnerability', pct: 50, flat: 0 }
        ]);
        expect(set.dealt).toEqual({ pct: -25, flat: 0 });
    });

    it('estatísticas: AP, deslocamento e iniciativa', () => {
        const set = collectModifiers([
            effect([ { kind: 'stat_penalty', target: 'ap', value: '-2' }, { kind: 'stat_penalty', target: 'displacement', value: '-50%' } ]),
            effect([ { kind: 'stat_bonus', target: 'initiative', value: 4 } ])
        ]);
        expect(modifiedStat(set, 'ap', 10)).toBe(8);
        expect(modifiedStat(set, 'displacement', 9)).toBe(4.5);
        expect(modifiedStat(set, 'initiative', 3)).toBe(7);
        expect(modifiedStat(set, 'maxLp', 40)).toBe(40);
        expect(modifiedStat(collectModifiers([ effect([ { kind: 'stat_penalty', target: 'ap', value: -20 } ]) ]), 'ap', 5)).toBe(0);
    });

    it('marcadores: flags do catálogo e os tipos sem valor', () => {
        const set = collectModifiers([
            effect([ { kind: 'flag', target: 'invisible', value: 'partial' }, { kind: 'flag', target: 'true_sight' }, { kind: 'skip_turn' }, { kind: 'no_spells' } ])
        ]);
        expect(hasFlag(set, 'invisible')).toBe(true);
        expect(set.flags['invisible']).toBe('partial');
        expect(hasFlag(set, 'true_sight')).toBe(true);
        expect(hasFlag(set, 'skip_turn')).toBe(true);
        expect(hasFlag(set, 'no_spells')).toBe(true);
        expect(hasFlag(set, 'no_actions')).toBe(false);
    });

    it('usa o nível em que o efeito foi aplicado', () => {
        const applied = {
            level: 2,
            snapshot: {
                levels: [
                    { level: 1, modifiers: [ { kind: 'advantage', target: 'attack' } ] },
                    { level: 2, modifiers: [ { kind: 'advantage', target: 'attack' }, { kind: 'advantage', target: 'dodge' } ] }
                ]
            }
        } as unknown as AppliedEffect;
        const set = collectModifiers([ applied ]);
        expect(advantagesFor(set, 'dodge')).toBe(1);
    });

    it('efeito sem modificadores (magia sustentada) e lista vazia não quebram', () => {
        expect(collectModifiers(undefined).taken).toEqual([]);
        expect(collectModifiers([ { level: 1, snapshot: { levels: [] }, sustained: {} } as unknown as AppliedEffect ]).flags).toEqual({});
    });

    it('a visão do combatente sai dos marcadores', () => {
        expect(visionLevel(collectModifiers([ effect([ { kind: 'flag', target: 'dim_vision' } ]) ]))).toBe('aprimorada');
        expect(visionLevel(collectModifiers([ effect([ { kind: 'flag', target: 'dim_vision' }, { kind: 'flag', target: 'true_sight' } ]) ]))).toBe('verdadeira');
        expect(visionLevel(collectModifiers([]))).toBe('normal');
        expect(visionLevel(collectModifiers([]), 'aprimorada')).toBe('aprimorada');
    });
});
