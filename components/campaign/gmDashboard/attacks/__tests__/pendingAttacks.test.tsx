import { ThemeProvider } from '@mui/material';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import PendingAttackCard from '../PendingAttackCard';
import PendingAttacksPanel from '../PendingAttacksPanel';

const mockContext = jest.fn();
jest.mock('@contexts', () => ({ useCampaignContext: () => mockContext() }));
jest.mock('@services', () => ({ campaignService: { resolveAttack: jest.fn(), dismissAttack: jest.fn(), declareAttack: jest.fn() } }));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const attack = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
    id: 'a1', attackerId: 'aria', attackerName: 'Aria', targetId: 'goblin-1', targetName: 'Goblin', source: 'weapon', name: 'Espada', kind: 'fisico',
    attackType: 'Cortante', attackTotal: 17, rolls: [ 12, 9 ], bonus: 5, damageRolled: 10, createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

const goblin = {
    id: 'goblin', name: 'Goblin', stats: { ap: 15, lp: 20 }, attributes: { des: 10 },
    expertises: { Reflexos: { value: 3, defaultAttribute: 'des' }, 'RES Física': { value: 4 } }
};

const campaignWith = (combat: Record<string, unknown>, creature: Record<string, unknown> = goblin) => ({
    campaign: {
        id: 'c1',
        custom: { creatures: [ creature ] },
        session: {
            combat: {
                isActive: true, phase: 'ACTION', round: 1, currentTurnIndex: 0, logs: [],
                combatants: [
                    { id: 'aria', name: 'Aria', type: 'player', effects: [] },
                    { id: 'goblin-1', name: 'Goblin', type: 'creature', effects: [] }
                ],
                ...combat
            }
        }
    },
    charsheets: [],
    rpgSystem: null
});

describe('PendingAttackCard', () => {
    it('mostra quem ataca quem, o acerto contra o AP, o dano rolado e o botão de aplicar', () => {
        mockContext.mockReturnValue(campaignWith({}));
        const html = render(<PendingAttackCard attack={attack()} />);

        expect(html).toContain('Aria → Goblin');
        expect(html).toContain('Espada · Cortante');
        expect(html).toContain('17 contra AP 15');
        expect(html).toContain('Acertou');
        expect(html).toContain('Aplicar 10 de dano');
        expect(html).not.toContain('Alvo fraco a este ataque');
    });

    it('errou: o botão confirma o erro e o dano proposto é zero', () => {
        mockContext.mockReturnValue(campaignWith({}));
        const html = render(<PendingAttackCard attack={attack({ attackTotal: 10, rolls: [ 5 ], bonus: 5 })} />);

        expect(html).toContain('Errou');
        expect(html).toContain('Confirmar erro');
    });

    it('sem o dano rolado avisa que espera o jogador e bloqueia a confirmação', () => {
        mockContext.mockReturnValue(campaignWith({}));
        const html = render(<PendingAttackCard attack={attack({ damageRolled: undefined })} />);

        expect(html).toContain('aguardando o jogador');
        expect(html).toContain('Espere o jogador rolar o dano, ou digite o dano final.');
        expect(html).toMatch(/<button[^>]*disabled[^>]*>Aplicar 0 de dano/);
    });

    it('alvo fraco: avisa só ao mestre, oferece o d20 extra e marca a linha como só do mestre', () => {
        mockContext.mockReturnValue(campaignWith({}, { ...goblin, weaknesses: [ 'Cortante' ] }));
        const html = render(<PendingAttackCard attack={attack()} />);

        expect(html).toContain('Alvo fraco a este ataque');
        expect(html).toContain('Rolar d20 extra');
        expect(html).toContain('(só o mestre vê)');
        expect(html).toContain('Aplicar 20 de dano');
    });

    it('ataque crítico aparece marcado', () => {
        mockContext.mockReturnValue(campaignWith({}));
        expect(render(<PendingAttackCard attack={attack({ critical: true })} />)).toContain('Crítico');
    });
});

describe('PendingAttackCard com o jogador como alvo', () => {
    const caio = {
        id: 'caio', name: 'Caio', stats: { ap: 12, lp: 30 },
        expertises: { Reflexos: { value: 3, defaultAttribute: 'des' }, 'RES Física': { value: 4 }, 'RES Mágica': { value: 2 }, 'RES Mental': { value: 5 } }
    };
    const asPlayerTarget = () => {
        const context = campaignWith({
            combatants: [
                { id: 'goblin-1', name: 'Goblin', type: 'creature', effects: [] },
                { id: 'caio', name: 'Caio', type: 'player', effects: [] }
            ]
        });
        return { ...context, charsheets: [ caio ] };
    };
    const incoming = (patch: Partial<PendingAttackData> = {}): PendingAttackData => attack({ attackerId: 'goblin-1', attackerName: 'Goblin', targetId: 'caio', targetName: 'Caio', ...patch });
    const dodge = { choice: 'dodge' as const, skill: 'Reflexos', total: 19, rolls: [ 16, 4 ], used: 16, bonus: 3 };

    it('enquanto o jogador não defendeu, avisa que espera a defesa dele (o mestre ainda pode resolver)', () => {
        mockContext.mockReturnValue(asPlayerTarget());
        const html = render(<PendingAttackCard attack={incoming()} />);

        expect(html).toContain('Aguardando a defesa de Caio');
        expect(html).not.toContain('Defesa rolada por Caio');
    });

    it('parte da esquiva que o jogador rolou: escolha, total e como saiu', () => {
        mockContext.mockReturnValue(asPlayerTarget());
        const html = render(<PendingAttackCard attack={incoming({ defense: dodge })} />);

        expect(html).toContain('Defesa rolada por Caio');
        expect(html).not.toContain('Aguardando a defesa de Caio');
        expect(html).toContain('Esquiva (Reflexos)');
        expect(html).toContain('value="19"');
        expect(html).toContain('Reflexos: [16, 4: 16] + 3 = 19 (rolado pelo jogador)');
        // Reflexos 19 passa do total 17 do ataque: anulou o dano
        expect(html).toContain('Aplicar 0 de dano');
    });

    it('jogador que escolheu não se defender: o dano vem inteiro', () => {
        mockContext.mockReturnValue(asPlayerTarget());
        const html = render(<PendingAttackCard attack={incoming({ defense: { choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 } })} />);

        expect(html).toContain('Caio não se defende');
        expect(html).toContain('Aplicar 10 de dano');
    });

    it('resistência rolada: usa o teste do jogador na RES da natureza do ataque', () => {
        mockContext.mockReturnValue(asPlayerTarget());
        // DT = ⌈17 ÷ 2⌉ = 9; 11 passa: o dano cai AP 12 + ⌊4 ÷ 2⌋ = 14, então 10 de dano vira 0
        const resist = { choice: 'resist' as const, skill: 'RES Física', total: 11, rolls: [ 8 ], used: 8, bonus: 3 };
        const html = render(<PendingAttackCard attack={incoming({ defense: resist })} />);

        expect(html).toContain('Resistência (RES Física)');
        expect(html).toContain('value="11"');
        expect(html).toContain('RES Física: [8] + 3 = 11 (rolado pelo jogador)');
        expect(html).toContain('Aplicar 0 de dano');
    });

    it('criatura como alvo não espera defesa de ninguém', () => {
        mockContext.mockReturnValue(campaignWith({}));
        const html = render(<PendingAttackCard attack={attack()} />);

        expect(html).not.toContain('Aguardando a defesa');
    });
});

describe('ataque com vários alvos no painel do mestre', () => {
    it('cada alvo tem o seu cartão e o cartão avisa que o ataque é em área', () => {
        mockContext.mockReturnValue(campaignWith({
            pendingAttacks: [
                attack({ id: 'a1', groupId: 'g1', groupSize: 2 }),
                attack({ id: 'a2', targetId: 'goblin-2', targetName: 'Goblin (2)', groupId: 'g1', groupSize: 2 })
            ]
        }));
        const html = render(<PendingAttacksPanel />);

        expect(html).toContain('pending-attack-a1');
        expect(html).toContain('pending-attack-a2');
        expect(html).toContain('Ataque em área: 2 alvos, um cartão por alvo');
    });

    it('ataque de um alvo só não leva o aviso de área', () => {
        mockContext.mockReturnValue(campaignWith({}));
        expect(render(<PendingAttackCard attack={attack()} />)).not.toContain('Ataque em área');
    });
});

describe('ataque de oportunidade no painel do mestre', () => {
    const opportunity = { id: 'o1', moverId: 'aria', moverName: 'Aria', reactorId: 'goblin-1', reactorName: 'Goblin', createdAt: '2026-10-28T12:00:00.000Z' };

    it('o cartão marca o ataque que veio de uma oportunidade', () => {
        mockContext.mockReturnValue(campaignWith({}));

        expect(render(<PendingAttackCard attack={attack({ opportunity: true })} />)).toContain('Ataque de oportunidade');
        expect(render(<PendingAttackCard attack={attack()} />)).not.toContain('Ataque de oportunidade');
    });

    it('o painel lista as saídas abertas e diz quem decide: a criatura pelo ataque manual, o jogador por conta própria', () => {
        mockContext.mockReturnValue(campaignWith({
            opportunities: [ opportunity, { ...opportunity, id: 'o2', moverId: 'goblin-1', moverName: 'Goblin', reactorId: 'aria', reactorName: 'Aria' } ]
        }));
        const html = render(<PendingAttacksPanel />);

        expect(html).toContain('opportunities-list');
        expect(html).toContain('Aria saiu do alcance de Goblin');
        expect(html).toContain('declare o ataque em &quot;Ataque manual&quot;');
        expect(html).toContain('Goblin saiu do alcance de Aria');
        expect(html).toContain('o jogador decide se ataca');
        expect(html).toContain('Dispensar');
    });

    it('sem saídas abertas a lista não aparece, e o botão de declarar a saída está sempre à mão', () => {
        mockContext.mockReturnValue(campaignWith({ opportunities: [] }));
        const html = render(<PendingAttacksPanel />);

        expect(html).not.toContain('opportunities-list');
        expect(html).toContain('Saída de alcance');
    });
});

describe('PendingAttacksPanel', () => {
    it('some fora do combate ou fora da fase de ação', () => {
        mockContext.mockReturnValue(campaignWith({ isActive: false }));
        expect(render(<PendingAttacksPanel />)).toBe('');

        mockContext.mockReturnValue(campaignWith({ phase: 'INITIATIVE' }));
        expect(render(<PendingAttacksPanel />)).toBe('');
    });

    it('sem ataques pendentes explica como eles chegam e oferece o ataque manual', () => {
        mockContext.mockReturnValue(campaignWith({ pendingAttacks: [] }));
        const html = render(<PendingAttacksPanel />);

        expect(html).toContain('Ataques');
        expect(html).toContain('Nenhum ataque esperando');
        expect(html).toContain('Ataque manual');
    });

    it('lista um cartão por ataque pendente', () => {
        mockContext.mockReturnValue(campaignWith({ pendingAttacks: [ attack({ id: 'a1' }), attack({ id: 'a2', name: 'Adaga' }) ] }));
        const html = render(<PendingAttacksPanel />);

        expect(html).toContain('pending-attack-a1');
        expect(html).toContain('pending-attack-a2');
        expect(html).not.toContain('Nenhum ataque esperando');
    });
});
