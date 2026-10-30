import { buildAttackProposal } from '../attackProposal';
import { buildAttackReaction, type AttackReaction } from '../attackReactions';
import { findPassiveByKey } from '../passives';
import type { PendingAttackData } from '../pendingAttacks';

const attack = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
    id: 'a1', attackerId: 'goblin', attackerName: 'Goblin', targetId: 'aria', targetName: 'Aria', source: 'manual', name: 'Machadada', kind: 'fisico',
    attackTotal: 20, rolls: [], bonus: 0, damageRolled: 12, melee: true, createdAt: '2026-10-30T12:00:00.000Z', ...patch
});

const reaction = (key: string): AttackReaction => {
    const def = findPassiveByKey(key);
    const built = def && buildAttackReaction(def, { id: 'aria', name: 'Aria' }, `r-${key}`, '2026-10-30T12:00:00.000Z');
    if (!built) throw new Error(`${key} não é reação`);
    return built;
};

const aria = { sheet: { stats: { ap: 8 }, expertises: { 'RES Física': { value: 4 }, Reflexos: { value: 3 } } } };

describe('a proposta do mestre com as reações do alvo', () => {
    it('sem reações o ataque de 20 passa do AP 8 e causa o dano inteiro', () => {
        const proposal = buildAttackProposal(attack(), [], aria, { defense: 'none' });
        expect(proposal).toMatchObject({ hit: true, targetAp: 8, finalDamage: 12 });
    });

    it('Barreira de Ki: +10 de AP contra este ataque, e o ataque de 20 passa a errar o AP 18? não: 20 ≥ 18 ainda acerta', () => {
        const proposal = buildAttackProposal(attack({ reactions: [ reaction('subclass:barreira de ki') ] }), [], aria, { defense: 'none' });
        expect(proposal.targetAp).toBe(18);
        expect(proposal.hit).toBe(true);
        expect(proposal.lines.find(entry => entry.label === 'Reação: Barreira de Ki')).toMatchObject({ detail: '+10 de AP contra este ataque', visibility: 'all' });
    });

    it('Barreira de Ki: com o acerto em 17 o ataque passa a errar (AP 18) e o lembrete do empurrão é só do mestre', () => {
        const proposal = buildAttackProposal(attack({ attackTotal: 17, reactions: [ reaction('subclass:barreira de ki') ] }), [], aria, { defense: 'none' });
        expect(proposal).toMatchObject({ hit: false, targetAp: 18, finalDamage: 0 });
        const note = proposal.lines.find(entry => entry.visibility === 'gm' && entry.detail?.includes('empurrado 3 m'));
        expect(note).toBeDefined();
    });

    it('Barreira de Ki não conta contra quem ignora a armadura', () => {
        const proposal = buildAttackProposal(attack({ attackTotal: 3, reactions: [ reaction('subclass:barreira de ki') ] }), [ { id: 'f', effectId: 'f', level: 1, remaining: 0, indefinite: true,
            snapshot: { name: 'Forma Primordial', levels: [ { level: 1, modifiers: [ { kind: 'flag', target: 'ignore_ap' } ] } ] } } as never ], aria, { defense: 'none' });
        expect(proposal.targetAp).toBe(0);
        expect(proposal.hit).toBe(true);
    });

    it('Metamorfose Adaptativa: o dano cai pela metade (12 → 6)', () => {
        const proposal = buildAttackProposal(attack({ reactions: [ reaction('subclass:metamorfose adaptativa') ] }), [], aria, { defense: 'none' });
        expect(proposal).toMatchObject({ hit: true, finalDamage: 6 });
        expect(proposal.lines.find(entry => entry.label === 'Reação: Metamorfose Adaptativa')?.detail).toBe('dano −50%');
    });

    it('Xeque-Mate: o ataque erra sozinho, mesmo com o dano rolado, e nada é calculado', () => {
        const proposal = buildAttackProposal(attack({ attackTotal: 40, reactions: [ reaction('subclass:xeque-mate') ] }), [], aria, { defense: 'none' });
        expect(proposal).toMatchObject({ hit: false, finalDamage: 0, resolution: null });
        expect(proposal.lines.map(entry => entry.label)).toContain('Reação: Xeque-Mate');
        expect(proposal.lines.at(-1)).toMatchObject({ label: 'Acerto', detail: 'errou automaticamente' });
    });

    it('Xeque-Mate sem o dano rolado também erra', () => {
        const proposal = buildAttackProposal(attack({ damageRolled: undefined, reactions: [ reaction('subclass:xeque-mate') ] }), [], aria, { defense: 'none' });
        expect(proposal.hit).toBe(false);
    });

    it('as reações somam: Barreira + Metamorfose', () => {
        const proposal = buildAttackProposal(attack({ reactions: [ reaction('subclass:barreira de ki'), reaction('subclass:metamorfose adaptativa') ] }), [], aria, { defense: 'none' });
        expect(proposal).toMatchObject({ targetAp: 18, hit: true, finalDamage: 6 });
    });

    it('o contra-ataque aparece como linha pública do cálculo', () => {
        const counter = { abilityKey: 'subclass:xeque-mate', source: 'Xeque-Mate', guaranteedCrit: true, extraDice: '6d6', meleeOnly: false };
        const proposal = buildAttackProposal(attack({ source: 'weapon', counter }), [], { creature: { stats: { ap: 5 } } }, { defense: 'none' });
        expect(proposal.lines.find(entry => entry.label === 'Contra-ataque: Xeque-Mate')).toMatchObject({ detail: 'crítico garantido, +6d6 de dano, qualquer arma', visibility: 'all' });
    });
});

describe('a proposta do mestre com a Fixação Mágica do alvo', () => {
    const fixed = { ...aria, invulnerableTo: 'Brasa Voraz' };
    const spell = (patch: Partial<PendingAttackData> = {}) => attack({ source: 'spell', kind: 'magico', name: 'Brasa Voraz', attackTotal: 30, ...patch });

    it('a magia fixada do alvo erra sozinha, sem calcular dano, e o motivo é só do mestre', () => {
        const proposal = buildAttackProposal(spell(), [], fixed, { defense: 'none' });
        expect(proposal).toMatchObject({ hit: false, finalDamage: 0, resolution: null });
        expect(proposal.lines.find(entry => entry.label === 'Fixação Mágica do alvo')).toMatchObject({ visibility: 'gm' });
        expect(proposal.lines.at(-1)).toMatchObject({ label: 'Acerto', detail: 'errou' });
    });

    it('outra magia acerta normalmente', () => {
        const proposal = buildAttackProposal(spell({ name: 'Raio Gélido' }), [], fixed, { defense: 'none' });
        expect(proposal.hit).toBe(true);
    });

    it('arma com o mesmo nome da magia fixada não é barrada (só magia)', () => {
        const proposal = buildAttackProposal(attack({ source: 'weapon', name: 'Brasa Voraz', attackTotal: 30 }), [], fixed, { defense: 'none' });
        expect(proposal.hit).toBe(true);
    });

    it('sem Fixação Mágica o alvo não é invulnerável', () => {
        expect(buildAttackProposal(spell(), [], { ...aria, invulnerableTo: null }, { defense: 'none' }).hit).toBe(true);
        expect(buildAttackProposal(spell(), [], aria, { defense: 'none' }).hit).toBe(true);
    });
});
