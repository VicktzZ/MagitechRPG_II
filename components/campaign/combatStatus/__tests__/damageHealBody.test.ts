import { damageHealBody } from '../useDamageHeal';

describe('damageHealBody', () => {
    it('dano e cura escolhem a ação da rota e levam alvo e valor', () => {
        expect(damageHealBody({ type: 'damage', targetId: 'goblin-1', value: 7 }, undefined, false)).toEqual({ action: 'apply_damage', targetId: 'goblin-1', value: 7 });
        expect(damageHealBody({ type: 'heal', targetId: 'aria', value: 4 }, undefined, false)).toEqual({ action: 'apply_heal', targetId: 'aria', value: 4 });
    });

    it('sem dizer quem causa vale o padrão: o personagem do jogador, ou o do turno atual para o mestre', () => {
        expect(damageHealBody({ type: 'damage', targetId: 't', value: 1 }, 'borin', false)).toMatchObject({ combatantId: 'borin' });
    });

    it('o mestre escolhe quem causa, e isso vale no lugar do padrão', () => {
        expect(damageHealBody({ type: 'damage', targetId: 't', value: 1, actorId: 'goblin-2' }, 'borin', false)).toMatchObject({ combatantId: 'goblin-2' });
    });

    it('"o mestre" (null) vai sem combatente, mesmo havendo padrão', () => {
        const body = damageHealBody({ type: 'damage', targetId: 't', value: 1, actorId: null }, 'borin', false);
        expect(body).not.toHaveProperty('combatantId');
    });

    it('sem padrão e sem quem causa também não manda combatente', () => {
        expect(damageHealBody({ type: 'heal', targetId: 't', value: 1 }, undefined, false)).not.toHaveProperty('combatantId');
    });

    it('"Curar mesmo assim" manda o force', () => {
        expect(damageHealBody({ type: 'heal', targetId: 't', value: 3, actorId: null }, undefined, true)).toMatchObject({ action: 'apply_heal', force: true });
        expect(damageHealBody({ type: 'heal', targetId: 't', value: 3 }, undefined, false)).not.toHaveProperty('force');
    });
});
