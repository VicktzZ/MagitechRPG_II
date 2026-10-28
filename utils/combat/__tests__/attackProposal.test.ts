import type { AppliedEffect } from '@models';
import { buildAttackProposal } from '../attackProposal';
import type { PendingAttackData } from '../pendingAttacks';

const attack = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
    id: 'a1', attackerId: 'aria', attackerName: 'Aria', targetId: 'goblin', targetName: 'Goblin', source: 'weapon', name: 'Espada', kind: 'fisico',
    attackType: 'Cortante', attackTotal: 17, rolls: [ 12, 9 ], bonus: 5, damageRolled: 10, createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

const goblin = { stats: { ap: 15 }, expertises: { 'RES Física': { value: 4 }, 'RES Mágica': { value: 0 }, Reflexos: { value: 3 } } };

const effect = (modifiers: Array<Record<string, unknown>>): AppliedEffect => ({
    id: 'e1', effectId: 'x', level: 1, remaining: 3, snapshot: { name: 'Teste', levels: [ { level: 1, modifiers } ] }
}) as unknown as AppliedEffect;

describe('buildAttackProposal', () => {
    it('acerta quando o total passa do AP e causa o dano rolado sem defesa', () => {
        const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none' });

        expect(proposal).toMatchObject({ hit: true, attackTotal: 17, targetAp: 15, finalDamage: 10, weak: false, extraDiceOwed: 0 });
        expect(proposal.lines.some(entry => entry.label === 'Acerto')).toBe(true);
    });

    it('erra quando o total fica abaixo do AP e o dano proposto é zero', () => {
        const proposal = buildAttackProposal(attack({ attackTotal: 12, rolls: [ 7 ], bonus: 5 }), [], { creature: goblin }, { defense: 'none' });

        expect(proposal).toMatchObject({ hit: false, finalDamage: 0 });
    });

    it('sem dano rolado ainda só diz se acertou', () => {
        const proposal = buildAttackProposal(attack({ damageRolled: undefined }), [], { creature: goblin }, { defense: 'none' });

        expect(proposal.resolution).toBeNull();
        expect(proposal.finalDamage).toBe(0);
        expect(proposal.lines.map(entry => entry.label)).toEqual([ 'Acerto' ]);
    });

    it('fraqueza do alvo: pede o d20 extra e, com ele, soma ao acerto e dobra o dano', () => {
        const fragile = { ...goblin, weaknesses: [ 'Cortante' ] };

        const before = buildAttackProposal(attack(), [], { creature: fragile }, { defense: 'none' });
        expect(before).toMatchObject({ weak: true, extraDiceOwed: 1, attackTotal: 17, finalDamage: 20 });
        expect(before.lines.find(entry => entry.label === 'Fraqueza do alvo ao ataque')?.visibility).toBe('gm');

        const after = buildAttackProposal(attack(), [], { creature: fragile }, { defense: 'none', extraRolls: [ 19 ] });
        expect(after).toMatchObject({ extraDiceOwed: 0, attackTotal: 24 });
    });

    it('a fraqueza do elemento da criatura vale (Água vence Fogo)', () => {
        const proposal = buildAttackProposal(attack({ attackType: 'Água', kind: 'magico' }), [], { creature: { ...goblin, elementalMastery: 'Fogo' } }, { defense: 'none' });
        expect(proposal.weak).toBe(true);
    });

    it('ataque manual do mestre (sem d20) não pede d20 extra', () => {
        const proposal = buildAttackProposal(attack({ rolls: [], bonus: 0, attackTotal: 18 }), [], { creature: { ...goblin, weaknesses: [ 'Cortante' ] } }, { defense: 'none' });
        expect(proposal).toMatchObject({ weak: true, extraDiceOwed: 0, attackTotal: 18 });
    });

    it('esquiva: Reflexos acima do total do atacante anula o dano e gasta a Reação', () => {
        const dodged = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 18 });
        expect(dodged.finalDamage).toBe(0);
        expect(dodged.resolution).toMatchObject({ targetSpentReaction: true });

        const failed = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 17 });
        expect(failed.finalDamage).toBe(10);
        expect(failed.resolution).toMatchObject({ targetSpentReaction: true });
    });

    it('esquiva não vale contra surpresa nem contra ataque mental', () => {
        const surprised = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 30, surprised: true });
        expect(surprised.dodge).toMatchObject({ allowed: false, reason: 'surpresa' });
        expect(surprised.finalDamage).toBe(10);

        const mental = buildAttackProposal(attack({ kind: 'mental' }), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 30 });
        expect(mental.dodge.reason).toBe('mental');
    });

    it('resistência: passando na DT o dano cai AP + metade do mod da perícia', () => {
        // DT = ⌈17 ÷ 2⌉ = 9; AP 15 + ⌊4 ÷ 2⌋ = 17 de redução
        const proposal = buildAttackProposal(attack({ damageRolled: 30 }), [], { creature: goblin }, { defense: 'resist', defenseTotal: 9 });

        expect(proposal.resistanceSkill).toBe('RES Física');
        expect(proposal.resistanceMod).toBe(4);
        expect(proposal.finalDamage).toBe(13);
    });

    it('trocar a natureza muda a resistência testada ("e se fosse mágico?")', () => {
        const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none', kind: 'magico' });
        expect(proposal).toMatchObject({ kind: 'magico', resistanceSkill: 'RES Mágica' });
    });

    it('resistência e vulnerabilidade da criatura entram no dano (e são linhas só do mestre)', () => {
        const proposal = buildAttackProposal(attack({ attackType: 'Fogo', kind: 'magico', damageRolled: 10 }), [], {
            creature: { ...goblin, damageModifiers: [ { kind: 'resistance', element: 'Fogo', value: '50%' } ] }
        }, { defense: 'none' });

        expect(proposal.finalDamage).toBe(5);
        expect(proposal.lines.find(entry => entry.label === 'Resistências e vulnerabilidades do alvo')?.visibility).toBe('gm');
    });

    it('jogador como alvo usa o AP da ficha, a maestria dele e os efeitos aplicados', () => {
        const sheet = { stats: { ap: 8 }, elementalMastery: 'Fogo', expertises: { 'RES Física': { value: 2 } } };

        const water = buildAttackProposal(attack({ attackType: 'Água', kind: 'magico' }), [], { sheet }, { defense: 'none' });
        expect(water).toMatchObject({ weak: true, targetAp: 8 });

        const armored = buildAttackProposal(attack(), [], { sheet, effects: [ effect([ { kind: 'stat_bonus', target: 'ap', value: '+4' } ]) ] }, { defense: 'none' });
        expect(armored.targetAp).toBe(12);
    });

    it('os efeitos de quem ataca somam ao dano', () => {
        const proposal = buildAttackProposal(attack({ damageRolled: 10 }), [ effect([ { kind: 'damage_dealt_bonus', value: '+3' } ]) ], { creature: goblin }, { defense: 'none' });
        expect(proposal.finalDamage).toBe(13);
    });
});
