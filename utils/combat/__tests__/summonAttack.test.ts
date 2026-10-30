import { attackTargetsFor, buildSummonAttackBody, buildSummonHitText, isSummonAttackSkill, SUMMON_ATTACK_SKILLS } from '../summonAttack';

const roll = { rolls: [ 14, 9 ], used: 14, bonus: 3, total: 17, keep: 'highest' as const };

describe('ataque do invocado (utils/combat/summonAttack.ts)', () => {
    it('as perícias de ataque são Luta, Pontaria e Magia', () => {
        expect(SUMMON_ATTACK_SKILLS).toEqual([ 'Luta', 'Pontaria', 'Magia' ]);
        expect(isSummonAttackSkill('Luta')).toBe(true);
        expect(isSummonAttackSkill('Furtividade')).toBe(false);
        expect(isSummonAttackSkill(undefined)).toBe(false);
    });

    it('o alvo é qualquer um do combate, menos o próprio invocado', () => {
        const list = [ { id: 'aria' }, { id: 'golem-1' }, { id: 'orc-1' } ];
        expect(attackTargetsFor(list, 'golem-1').map(entry => entry.id)).toEqual([ 'aria', 'orc-1' ]);
        expect(attackTargetsFor(undefined, 'golem-1')).toEqual([]);
    });

    it('o corpo da declaração é um ataque manual com o acerto rolado e o dano do dado', () => {
        const body = buildSummonAttackBody({ summonId: 'golem-1', choice: { targetId: 'orc-1', skill: 'Luta', kind: 'fisico', attackType: 'Esmagante' }, attackName: 'Soco Rúnico', roll, damage: 21 });
        expect(body).toEqual({
            combatantId: 'golem-1',
            targetId: 'orc-1',
            attack: { source: 'manual', name: 'Soco Rúnico', kind: 'fisico', attackType: 'Esmagante', attackTotal: 17, rolls: [ 14, 9 ], bonus: 3 },
            damage: 21
        });
    });

    it('sem dado escolhido o ataque vai sem dano, e dano inválido é descartado', () => {
        const base = { summonId: 'golem-1', choice: { targetId: 'orc-1', skill: 'Luta' as const, kind: 'fisico' as const }, attackName: 'Luta', roll };
        expect(buildSummonAttackBody(base)).not.toHaveProperty('damage');
        expect(buildSummonAttackBody({ ...base, damage: -3 })).not.toHaveProperty('damage');
        expect(buildSummonAttackBody({ ...base, damage: 2.5 })).not.toHaveProperty('damage');
        expect(buildSummonAttackBody({ ...base, damage: 0 })).toHaveProperty('damage', 0);
    });

    it('modificador negativo (vale o menor) vai como keep lowest para o mestre refazer o total', () => {
        const body = buildSummonAttackBody({ summonId: 'g', choice: { targetId: 'o', skill: 'Luta', kind: 'fisico' }, attackName: 'Luta', roll: { ...roll, keep: 'lowest' } });
        expect(body.attack).toMatchObject({ keep: 'lowest' });
    });

    it('a linha do chat diz de quem é o invocado, a perícia e o d20 que valeu', () => {
        expect(buildSummonHitText('Golem Arcano', 'Aria', 'Soco Rúnico', 'Luta', roll)).toBe('🎯 Golem Arcano (invocado por Aria) testou acerto com **Soco Rúnico** (Luta): [14, 9: 14] +3 = **17**');
        expect(buildSummonHitText('Golem Arcano', undefined, 'Luta', 'Luta', { ...roll, rolls: [ 11 ], used: 11, bonus: -1, total: 10 })).toBe('🎯 Golem Arcano testou acerto com **Luta** (Luta): [11] -1 = **10**');
        expect(buildSummonHitText('Golem', 'Aria', 'Luta', 'Luta', { ...roll, keep: 'lowest' })).toContain('Luta, vale o menor');
    });
});
