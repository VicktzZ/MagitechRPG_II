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

    it('magia de elemento Psíquico vale como mental: RES Mental, sem esquiva e dano pela metade', () => {
        const psychic = attack({ source: 'spell', name: 'Pulso Mental', kind: 'magico', attackType: 'PSÍQUICO', damageRolled: 10 });
        const mentalGoblin = { ...goblin, expertises: { ...goblin.expertises, 'RES Mental': { value: 6 } } };

        const none = buildAttackProposal(psychic, [], { creature: mentalGoblin }, { defense: 'none' });
        expect(none).toMatchObject({ kind: 'mental', resistanceSkill: 'RES Mental', resistanceMod: 6 });
        expect(none.dodge).toMatchObject({ allowed: false, reason: 'mental' });

        // DT = ⌈17 ÷ 2⌉ = 9: passando, o dano mental cai pela metade
        const resisted = buildAttackProposal(psychic, [], { creature: mentalGoblin }, { defense: 'resist', defenseTotal: 9 });
        expect(resisted.finalDamage).toBe(5);

        // O mestre ainda pode trocar a natureza para físico ("e se fosse físico?"); só a magia (mágica) de elemento Psíquico vira mental
        expect(buildAttackProposal(psychic, [], { creature: mentalGoblin }, { defense: 'none', kind: 'fisico' }).kind).toBe('fisico');
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

    describe('alvo desprevenido (matriz de percepção)', () => {
        const furtivo = { cause: 'furtivo' as const, advantages: 1 };

        it('furtivo: pede 1d20 extra, tira a esquiva e explica a surpresa para todos', () => {
            const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 30, surprised: true, surprise: furtivo });

            expect(proposal).toMatchObject({ extraDiceOwed: 1, extraDiceSources: [ 'surpresa' ] });
            expect(proposal.dodge).toEqual({ allowed: false, reason: 'surpresa' });
            const surprise = proposal.lines.find(entry => entry.label === 'Alvo desprevenido');
            expect(surprise?.detail).toContain('+1d20 no acerto');
            expect(surprise?.detail).toContain('sem esquiva');
            expect(surprise?.visibility).toBe('all');
        });

        it('com o d20 extra rolado o acerto sobe e a dívida zera', () => {
            const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none', surprised: true, surprise: furtivo, extraRolls: [ 19 ] });

            expect(proposal).toMatchObject({ extraDiceOwed: 0, attackTotal: 24 });
        });

        it('invisível: 2d20; o efeito Furtivo na arma já deu 1, então o mestre rola só 1', () => {
            const invisible = { cause: 'invisivel' as const, advantages: 2 };

            expect(buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none', surprised: true, surprise: invisible }).extraDiceOwed).toBe(2);

            const rolled = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none', surprised: true, surprise: { ...invisible, alreadyRolled: 1 } });
            expect(rolled.extraDiceOwed).toBe(1);
            expect(rolled.lines.find(entry => entry.label === 'Alvo desprevenido')?.detail).toContain('1 já rolado pelo atacante');
        });

        it('fraqueza e surpresa somam os d20 devidos e explicam de onde vêm', () => {
            const fragile = { ...goblin, weaknesses: [ 'Cortante' ] };
            const proposal = buildAttackProposal(attack(), [], { creature: fragile }, { defense: 'none', surprised: true, surprise: furtivo });

            expect(proposal).toMatchObject({ extraDiceOwed: 2, extraDiceSources: [ 'fraqueza', 'surpresa' ] });
        });

        it('o mestre desmarcou o desprevenido: sem d20, sem linha e a esquiva volta', () => {
            const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 30, surprised: false, surprise: furtivo });

            expect(proposal.extraDiceOwed).toBe(0);
            expect(proposal.dodge.allowed).toBe(true);
            expect(proposal.lines.some(entry => entry.label === 'Alvo desprevenido')).toBe(false);
        });

        it('d20 rolado a mais não vale: desmarcar a surpresa depois de rolar tira o dado', () => {
            const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none', surprised: false, surprise: furtivo, extraRolls: [ 20 ] });

            expect(proposal.attackTotal).toBe(17);
        });

        it('fora da vista (sem d20) só tira a esquiva; ataque manual sem d20 também não pede dado', () => {
            const outro = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none', surprised: true, surprise: { cause: 'outro', advantages: 0 } });
            expect(outro.extraDiceOwed).toBe(0);
            expect(outro.dodge.reason).toBe('surpresa');

            const manual = buildAttackProposal(attack({ rolls: [], bonus: 0 }), [], { creature: goblin }, { defense: 'none', surprised: true, surprise: furtivo });
            expect(manual.extraDiceOwed).toBe(0);
        });

        it('marcar desprevenido na mão (sem a matriz) continua só tirando a esquiva', () => {
            const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'dodge', defenseTotal: 30, surprised: true });

            expect(proposal.extraDiceOwed).toBe(0);
            expect(proposal.dodge.reason).toBe('surpresa');
        });
    });

    describe('acerto com desvantagem dos efeitos', () => {
        const lowest = attack({ rolls: [ 15, 4 ], keep: 'lowest', bonus: 5, attackTotal: 9 });

        it('o total é o do menor d20 e uma linha pública explica', () => {
            const proposal = buildAttackProposal(lowest, [], { creature: goblin }, { defense: 'none' });

            expect(proposal.attackTotal).toBe(9);
            expect(proposal.hit).toBe(false);
            expect(proposal.lines.find(entry => entry.label === 'Acerto com desvantagem')).toMatchObject({ detail: 'vale o menor d20', visibility: 'all' });
        });

        it('um d20 extra de vantagem (fraqueza do alvo) cancela a desvantagem pelo saldo, em vez de valer o maior', () => {
            const fragile = { ...goblin, weaknesses: [ 'Cortante' ] };
            const proposal = buildAttackProposal(lowest, [], { creature: fragile }, { defense: 'none', extraRolls: [ 18 ] });

            expect(proposal.attackTotal).toBe(20);
        });

        it('sem desvantagem não há a linha', () => {
            const proposal = buildAttackProposal(attack(), [], { creature: goblin }, { defense: 'none' });

            expect(proposal.lines.some(entry => entry.label === 'Acerto com desvantagem')).toBe(false);
        });
    });
});
