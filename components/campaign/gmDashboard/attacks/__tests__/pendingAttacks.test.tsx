import { ThemeProvider } from '@mui/material';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import HiddenFromNotice from '../../../awareness/HiddenFromNotice';
import PendingAttackCard from '../PendingAttackCard';
import PendingAttacksPanel from '../PendingAttacksPanel';
import UnseenList from '../UnseenList';

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

    it('acerto rolado com desvantagem dos efeitos: o cartão marca e usa o menor d20', () => {
        mockContext.mockReturnValue(campaignWith({}));
        const html = render(<PendingAttackCard attack={attack({ rolls: [ 15, 4 ], keep: 'lowest', bonus: 5, attackTotal: 9 })} />);

        expect(html).toContain('Acerto com desvantagem: vale o menor d20');
        expect(html).toContain('9 contra AP 15');
        expect(html).toContain('Errou');
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

describe('alvo desprevenido (matriz de percepção) no painel do mestre', () => {
    const hidden = { id: 'u1', hiderId: 'aria', hiderName: 'Aria', observerId: 'goblin-1', observerName: 'Goblin', cause: 'furtivo', createdAt: '2026-10-28T12:00:00.000Z' };
    const stealthEffect = { id: 'e1', effectId: 'seed-furtivo', level: 1, remaining: 3, snapshot: { name: 'Furtivo', levels: [] } };

    it('o atacante fora da vista do alvo: o cartão já parte do desprevenido, pede o d20 extra e a esquiva fica negada', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [ hidden ] }));
        const html = render(<PendingAttackCard attack={attack()} />);

        expect(html).toContain('Alvo desprevenido: não via o atacante (furtivo)');
        expect(html).toContain('Vantagem: +1d20 no acerto (surpresa)');
        expect(html).toContain('Rolar d20 extra');
        expect(html).toMatch(/type="checkbox"[^>]*checked/);
    });

    it('sem o par na matriz o alvo via o atacante: nada de desprevenido', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [] }));
        const html = render(<PendingAttackCard attack={attack()} />);

        expect(html).not.toContain('Alvo desprevenido: não via');
        expect(html).not.toContain('Vantagem: +');
        expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
    });

    it('o atacante com o efeito Furtivo na arma já rolou o 1d20: o mestre não rola de novo', () => {
        const context = campaignWith({ unseen: [ hidden ] });
        context.campaign.session.combat.combatants[0] = { id: 'aria', name: 'Aria', type: 'player', effects: [ stealthEffect ] } as never;
        mockContext.mockReturnValue(context);
        const html = render(<PendingAttackCard attack={attack()} />);

        expect(html).toContain('Alvo desprevenido: não via o atacante (furtivo)');
        expect(html).not.toContain('Rolar d20 extra');
    });

    it('invisível: dois d20, e o furtivo só vale para a arma (na magia o efeito não deu d20)', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [ { ...hidden, cause: 'invisivel' } ] }));
        expect(render(<PendingAttackCard attack={attack()} />)).toContain('Vantagem: +2d20 no acerto (surpresa)');

        const context = campaignWith({ unseen: [ hidden ] });
        context.campaign.session.combat.combatants[0] = { id: 'aria', name: 'Aria', type: 'player', effects: [ stealthEffect ] } as never;
        mockContext.mockReturnValue(context);
        expect(render(<PendingAttackCard attack={attack({ source: 'spell' })} />)).toContain('Vantagem: +1d20 no acerto (surpresa)');
    });

    it('fraqueza e surpresa juntas somam os d20 e dizem de onde vêm', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [ hidden ] }, { ...goblin, weaknesses: [ 'Cortante' ] }));

        expect(render(<PendingAttackCard attack={attack()} />)).toContain('Vantagem: +2d20 no acerto (fraqueza e surpresa)');
    });
});

describe('Furtividade no painel do mestre', () => {
    const hidden = { id: 'u1', hiderId: 'aria', hiderName: 'Aria', observerId: 'goblin-1', observerName: 'Goblin', cause: 'furtivo', createdAt: '2026-10-28T12:00:00.000Z' };

    it('o botão está sempre à mão e a lista só aparece com alguém escondido', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [] }));
        const empty = render(<PendingAttacksPanel />);
        expect(empty).toContain('Furtividade');
        expect(empty).not.toContain('unseen-list');

        mockContext.mockReturnValue(campaignWith({ unseen: [ hidden ] }));
        expect(render(<PendingAttacksPanel />)).toContain('unseen-list');
    });

    it('lista o escondido, quem não o vê, a DT de Percepção e as ações', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [ hidden, { ...hidden, id: 'u2', observerId: 'orc-1', observerName: 'Orc', cause: 'invisivel' } ] }));
        const html = render(<UnseenList />);

        expect(html).toContain('unseen-group-aria');
        expect(html).toContain('Goblin não o vê');
        expect(html).toContain('(furtivo)');
        expect(html).toContain('Percepção DT 20');
        expect(html).toContain('Orc não o vê');
        expect(html).toContain('Percepção DT 30');
        expect(html).toContain('Testar Percepção');
        expect(html).toContain('Revelar a todos');
    });

    it('fora da vista não tem DT na regra: só revelar na mão', () => {
        mockContext.mockReturnValue(campaignWith({ unseen: [ { ...hidden, cause: 'outro' } ] }));
        const html = render(<UnseenList />);

        expect(html).toContain('Goblin não o vê');
        expect(html).not.toContain('Testar Percepção');
        expect(html).not.toContain('Percepção DT');
        expect(html).toContain('Revelar');
    });

    it('observador com Visão Verdadeira vê o furtivo sem teste', () => {
        const context = campaignWith({ unseen: [ hidden ] });
        context.campaign.session.combat.combatants[1] = {
            id: 'goblin-1', name: 'Goblin', type: 'creature',
            effects: [ { id: 'e1', effectId: 'x', level: 1, remaining: 3, snapshot: { name: 'Visão Verdadeira', levels: [ { level: 1, modifiers: [ { kind: 'flag', target: 'true_sight' } ] } ] } } ]
        } as never;
        mockContext.mockReturnValue(context);
        const html = render(<UnseenList />);

        expect(html).toContain('Visão Verdadeira: vê sem teste');
        expect(html).not.toContain('Testar Percepção');
    });

    it('a notificação de quem se esconde mostra de quem; quem não o vê não recebe nada', () => {
        const combat = { unseen: [ hidden, { ...hidden, id: 'u2', observerId: 'orc-1', observerName: 'Orc' } ] } as never;

        const html = render(<HiddenFromNotice combat={combat} combatantId="aria" />);
        expect(html).toContain('Você está fora da vista de Goblin, Orc (furtivo)');
        expect(render(<HiddenFromNotice combat={combat} combatantId="goblin-1" />)).toBe('');
        expect(render(<HiddenFromNotice combat={{} as never} combatantId="aria" />)).toBe('');
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

        // o título "Ataques" agora é a aba do painel de combate; aqui ficam as ferramentas e o estado vazio
        expect(html).toContain('id="ataques"');
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
