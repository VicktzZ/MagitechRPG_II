import type { SpellDTO } from '@models/dtos';
import type { HitTestResult } from '@utils/combat/hitTest';
import { isAttackSpell, useSpellAttack } from '../useSpellAttack';

const mockDeclare = jest.fn();
const mockAttachDamage = jest.fn();

// O hook compartilhado lê os contextos da campanha; aqui só interessa o que a magia manda para ele
jest.mock('../useAttackTargeting', () => ({
    useAttackTargeting: () => ({
        targeting: { enabled: true, targets: [], targetId: 'goblin-1', setTargetId: jest.fn(), pending: [] },
        declare: mockDeclare,
        attachDamage: mockAttachDamage
    })
}));

const spell = (patch: Partial<SpellDTO> = {}): SpellDTO => ({
    id: 'faca-de-vento',
    name: 'Faca de Vento',
    element: 'AR',
    level: 1,
    type: 'Ataque (imediato)',
    ...patch
}) as unknown as SpellDTO;

const test: HitTestResult = { total: 21, rolls: [ 14, 9 ], bonus: 7 } as unknown as HitTestResult;

beforeEach(() => {
    mockDeclare.mockReset();
    mockAttachDamage.mockReset();
});

describe('isAttackSpell', () => {
    it('só a categoria Ataque conta, inclusive somada a outra', () => {
        expect(isAttackSpell(spell({ type: 'Ataque (imediato)' }))).toBe(true);
        expect(isAttackSpell(spell({ type: 'Ataque/Recuperação (imediato)' }))).toBe(true);
        expect(isAttackSpell(spell({ type: 'ataque (contínuo)' }))).toBe(true);
        expect(isAttackSpell(spell({ type: 'Cura (imediato)' }))).toBe(false);
        expect(isAttackSpell(spell({ type: 'Defesa (sustentado)' }))).toBe(false);
        expect(isAttackSpell(spell({ type: undefined }))).toBe(false);
    });
});

describe('useSpellAttack', () => {
    it('magia de ataque declara o teste de magia como acerto mágico, com o elemento como tipo', async () => {
        await useSpellAttack().declareSpell(spell(), test);

        expect(mockDeclare).toHaveBeenCalledWith({
            source: 'spell',
            name: 'Faca de Vento',
            kind: 'magico',
            attackType: 'AR',
            attackTotal: 21,
            rolls: [ 14, 9 ],
            bonus: 7
        }, undefined);
    });

    it('no ataque de oportunidade a declaração leva a opção para o servidor ligar a oportunidade', async () => {
        await useSpellAttack().declareSpell(spell(), test, { opportunity: true });

        expect(mockDeclare).toHaveBeenCalledWith(expect.objectContaining({ source: 'spell', name: 'Faca de Vento' }), { opportunity: true });
    });

    it('magia que não é de ataque não declara nada', async () => {
        await useSpellAttack().declareSpell(spell({ type: 'Cura (imediato)' }), test);

        expect(mockDeclare).not.toHaveBeenCalled();
    });

    it('o dano rolado ao efetuar se junta ao ataque da magia', async () => {
        await useSpellAttack().attachSpellDamage(spell(), 9);

        expect(mockAttachDamage).toHaveBeenCalledWith('Faca de Vento', 'spell', 9);
    });

    it('sem dano rolado ou em magia que não é de ataque, nada vai ao mestre', async () => {
        await useSpellAttack().attachSpellDamage(spell(), 0);
        await useSpellAttack().attachSpellDamage(spell({ type: 'Cura (imediato)' }), 12);

        expect(mockAttachDamage).not.toHaveBeenCalled();
    });

    it('devolve o alvo do ataque assistido para o seletor da seção', () => {
        expect(useSpellAttack().targeting.targetId).toBe('goblin-1');
    });
});
